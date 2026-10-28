import {
  getDb,
  logPlatformActivity,
  type CicSheetSourceRow,
  type SheetColumnDefinition,
} from '@cic/db';
import {
  buildColumnSchema,
  canonicalizeRowData,
  computeDataHash,
  computeRowKey,
  normalizeCellValue,
} from './normalizer.ts';
import { diffSheetRows, type ExistingSheetRowSnapshot, type IncomingSheetRowSnapshot } from './diff.ts';
import { getDriveFileModifiedTime, readFullSheetRows } from './google-client.ts';

export interface SyncSheetResult {
  runId: string;
  sourceId: string;
  sourceCode: string;
  status: 'success' | 'skipped' | 'failed';
  rowsRead: number;
  rowsInserted: number;
  rowsUpdated: number;
  rowsRemoved: number;
  rowsRestored: number;
  schemaChanged: boolean;
  errorMessage?: string;
}

export async function syncSheetSourceById(
  sourceId: string | number,
  options: {
    trigger?: 'schedule' | 'manual' | 'webhook' | 'restore';
    force?: boolean;
    triggeredBy?: number | null;
  } = {}
): Promise<SyncSheetResult> {
  const sql = getDb();
  const trigger = options.trigger || 'manual';

  const [source] = await sql<CicSheetSourceRow[]>`
    SELECT *
    FROM public.cic_sheet_sources
    WHERE id = ${sourceId} AND deleted_at IS NULL
    LIMIT 1
  `;

  if (!source) {
    throw new Error(`Không tìm thấy nguồn Sheet #${sourceId}`);
  }

  // Create running record in cic_sheet_sync_runs
  const [runRow] = await sql<{ id: string }[]>`
    INSERT INTO public.cic_sheet_sync_runs (
      source_id, trigger, status, triggered_by
    ) VALUES (
      ${source.id}, ${trigger}, 'running', ${options.triggeredBy ?? null}
    )
    RETURNING id
  `;
  const runId = String(runRow.id);

  try {
    // 1. Check Drive modifiedTime if not forced
    const driveModifiedIso = await getDriveFileModifiedTime(source.spreadsheet_id);
    if (
      !options.force &&
      trigger === 'schedule' &&
      driveModifiedIso &&
      source.last_sheet_modified_at &&
      new Date(driveModifiedIso).getTime() <= new Date(source.last_sheet_modified_at).getTime()
    ) {
      await sql`
        UPDATE public.cic_sheet_sync_runs
        SET status = 'skipped', finished_at = now()
        WHERE id = ${runId}
      `;
      await sql`
        UPDATE public.cic_sheet_sources
        SET next_run_at = now() + (${source.interval_minutes} || ' minutes')::interval,
            updated_at = now()
        WHERE id = ${source.id}
      `;
      return {
        runId,
        sourceId: String(source.id),
        sourceCode: source.code,
        status: 'skipped',
        rowsRead: 0,
        rowsInserted: 0,
        rowsUpdated: 0,
        rowsRemoved: 0,
        rowsRestored: 0,
        schemaChanged: false,
      };
    }

    // 2. Read full rows (FORMATTED + UNFORMATTED) from Google Sheets
    const rawPayload = await readFullSheetRows(
      source.spreadsheet_id,
      source.sheet_name,
      source.header_row || 1
    );

    const existingSchema: SheetColumnDefinition[] = Array.isArray(source.column_schema)
      ? source.column_schema
      : [];

    const { schema: nextSchema, schemaChanged } = buildColumnSchema(
      rawPayload.headers,
      rawPayload.formattedRows.slice(0, 30),
      existingSchema
    );

    // 3. Parse incoming rows using nextSchema
    const incomingRows: IncomingSheetRowSnapshot[] = [];
    const totalRows = Math.max(rawPayload.formattedRows.length, rawPayload.unformattedRows.length);

    for (let i = 0; i < totalRows; i++) {
      const fRow = rawPayload.formattedRows[i] || [];
      const uRow = rawPayload.unformattedRows[i] || [];
      const rowData: Record<string, unknown> = {};
      let hasAnyValue = false;

      for (let colIdx = 0; colIdx < nextSchema.length; colIdx++) {
        const colDef = nextSchema[colIdx];
        const val = normalizeCellValue(uRow[colIdx], fRow[colIdx], colDef.type);
        if (val !== null && val !== undefined && val !== '') {
          rowData[colDef.key] = val;
          hasAnyValue = true;
        }
      }

      if (!hasAnyValue) {
        continue;
      }

      const canonical = canonicalizeRowData(rowData);
      const dataHash = computeDataHash(canonical);
      const rowKey = computeRowKey(canonical, source.key_columns || [], dataHash);
      const sheetRowNumber = (source.header_row || 1) + 1 + i;

      incomingRows.push({
        row_key: rowKey,
        row_number: sheetRowNumber,
        data: canonical,
        data_hash: dataHash,
      });
    }

    // 4. Inside a single transaction: diff against existing cic_sheet_rows and apply changes
    let insertedCount = 0;
    let updatedCount = 0;
    let removedCount = 0;
    let restoredCount = 0;

    await sql.begin(async (tx) => {
      const existingRows = await tx<ExistingSheetRowSnapshot[]>`
        SELECT id, row_key, row_number, data, data_hash, removed_at
        FROM public.cic_sheet_rows
        WHERE source_id = ${source.id}
        FOR UPDATE
      `;

      const diff = diffSheetRows(existingRows, incomingRows);

      // 4a. Insert new rows
      for (const item of diff.toInsert) {
        const [inserted] = await tx<{ id: string }[]>`
          INSERT INTO public.cic_sheet_rows (
            source_id, row_key, row_number, data, data_hash, first_seen_at, last_seen_at, updated_at, removed_at
          ) VALUES (
            ${source.id},
            ${item.row_key},
            ${item.row_number},
            ${tx.json(item.data as never)},
            ${item.data_hash},
            now(),
            now(),
            now(),
            NULL
          )
          RETURNING id
        `;
        await tx`
          INSERT INTO public.cic_sheet_row_changes (
            row_id, run_id, change_type, old_data, new_data
          ) VALUES (
            ${inserted.id},
            ${runId},
            'insert',
            NULL,
            ${tx.json(item.data as never)}
          )
        `;
        insertedCount++;
      }

      // 4b. Update modified rows
      for (const item of diff.toUpdate) {
        await tx`
          UPDATE public.cic_sheet_rows
          SET row_number = ${item.row_number},
              data = ${tx.json(item.new_data as never)},
              data_hash = ${item.data_hash},
              last_seen_at = now(),
              updated_at = now(),
              removed_at = NULL
          WHERE id = ${item.existingId}
        `;
        await tx`
          INSERT INTO public.cic_sheet_row_changes (
            row_id, run_id, change_type, old_data, new_data
          ) VALUES (
            ${item.existingId},
            ${runId},
            'update',
            ${tx.json(item.old_data as never)},
            ${tx.json(item.new_data as never)}
          )
        `;
        updatedCount++;
      }

      // 4c. Restore previously soft-removed rows that reappeared
      for (const item of diff.toRestore) {
        await tx`
          UPDATE public.cic_sheet_rows
          SET row_number = ${item.row_number},
              data = ${tx.json(item.new_data as never)},
              data_hash = ${item.data_hash},
              last_seen_at = now(),
              updated_at = now(),
              removed_at = NULL
          WHERE id = ${item.existingId}
        `;
        await tx`
          INSERT INTO public.cic_sheet_row_changes (
            row_id, run_id, change_type, old_data, new_data
          ) VALUES (
            ${item.existingId},
            ${runId},
            'restore',
            ${tx.json(item.old_data as never)},
            ${tx.json(item.new_data as never)}
          )
        `;
        restoredCount++;
      }

      // 4d. Soft-remove rows that disappeared from the sheet (never hard-delete)
      for (const item of diff.toRemove) {
        await tx`
          UPDATE public.cic_sheet_rows
          SET removed_at = now(),
              updated_at = now()
          WHERE id = ${item.existingId}
        `;
        await tx`
          INSERT INTO public.cic_sheet_row_changes (
            row_id, run_id, change_type, old_data, new_data
          ) VALUES (
            ${item.existingId},
            ${runId},
            'remove',
            ${tx.json(item.old_data as never)},
            NULL
          )
        `;
        removedCount++;
      }

      // 4e. Update last_seen_at / row_number on unchanged active rows
      await tx`
        UPDATE public.cic_sheet_rows
        SET last_seen_at = now()
        WHERE source_id = ${source.id} AND removed_at IS NULL
      `;

      for (const touch of diff.toTouchRowNumber) {
        await tx`
          UPDATE public.cic_sheet_rows
          SET row_number = ${touch.row_number}
          WHERE id = ${touch.existingId}
        `;
      }

      // 4f. Update cic_sheet_sources metadata and cic_sheet_sync_runs status
      await tx`
        UPDATE public.cic_sheet_sources
        SET column_schema = ${tx.json(nextSchema as never)},
            last_synced_at = now(),
            last_sheet_modified_at = ${driveModifiedIso ? new Date(driveModifiedIso) : new Date()},
            next_run_at = now() + (${source.interval_minutes} || ' minutes')::interval,
            updated_at = now()
        WHERE id = ${source.id}
      `;

      await tx`
        UPDATE public.cic_sheet_sync_runs
        SET status = 'success',
            rows_read = ${incomingRows.length},
            rows_inserted = ${insertedCount},
            rows_updated = ${updatedCount + restoredCount},
            rows_removed = ${removedCount},
            schema_changed = ${schemaChanged},
            finished_at = now()
        WHERE id = ${runId}
      `;
    });

    if (insertedCount > 0 || updatedCount > 0 || removedCount > 0 || restoredCount > 0 || schemaChanged) {
      await logPlatformActivity({
        actorId: options.triggeredBy ?? null,
        actorLabel: options.triggeredBy ? `User #${options.triggeredBy}` : 'SyncEngine',
        actionCode: 'sheet_source.sync',
        category: 'sheet_sync',
        severity: schemaChanged ? 'medium' : 'low',
        entityType: 'cic_sheet_sources',
        entityId: String(source.id),
        entityTitle: source.name,
        module: 'sheet_sync',
        result: 'success',
        resultMessage: `Đồng bộ ${source.code}: đọc ${incomingRows.length}, +${insertedCount} mới, ~${updatedCount + restoredCount} cập nhật, -${removedCount} ẩn`,
        sourceApp: trigger === 'schedule' ? 'sync-worker' : 'data-hub',
      });
    }

    return {
      runId,
      sourceId: String(source.id),
      sourceCode: source.code,
      status: 'success',
      rowsRead: incomingRows.length,
      rowsInserted: insertedCount,
      rowsUpdated: updatedCount,
      rowsRemoved: removedCount,
      rowsRestored: restoredCount,
      schemaChanged,
    };
  } catch (err: any) {
    const message = err?.message || 'Lỗi đồng bộ Google Sheets không xác định';
    await sql`
      UPDATE public.cic_sheet_sync_runs
      SET status = 'failed',
          error_message = ${message},
          finished_at = now()
      WHERE id = ${runId}
    `;
    await sql`
      UPDATE public.cic_sheet_sources
      SET next_run_at = now() + (${source.interval_minutes} || ' minutes')::interval,
          updated_at = now()
      WHERE id = ${source.id}
    `;
    await logPlatformActivity({
      actorId: options.triggeredBy ?? null,
      actorLabel: 'SyncEngine',
      actionCode: 'sheet_source.sync_failed',
      category: 'sheet_sync',
      severity: 'high',
      entityType: 'cic_sheet_sources',
      entityId: String(source.id),
      entityTitle: source.name,
      module: 'sheet_sync',
      result: 'failed',
      resultMessage: message,
      sourceApp: trigger === 'schedule' ? 'sync-worker' : 'data-hub',
    });

    return {
      runId,
      sourceId: String(source.id),
      sourceCode: source.code,
      status: 'failed',
      rowsRead: 0,
      rowsInserted: 0,
      rowsUpdated: 0,
      rowsRemoved: 0,
      rowsRestored: 0,
      schemaChanged: false,
      errorMessage: message,
    };
  }
}

export async function restoreSheetRowToChange(
  rowId: string | number,
  changeId: string | number,
  actorId: number | null = null
): Promise<void> {
  const sql = getDb();
  await sql.begin(async (tx) => {
    const [row] = await tx<{ id: string; source_id: string; data: Record<string, unknown> }[]>`
      SELECT id, source_id, data
      FROM public.cic_sheet_rows
      WHERE id = ${rowId}
      FOR UPDATE
    `;
    if (!row) throw new Error(`Không tìm thấy dòng #${rowId}`);

    const [change] = await tx<{ id: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null }[]>`
      SELECT id, old_data, new_data
      FROM public.cic_sheet_row_changes
      WHERE id = ${changeId} AND row_id = ${rowId}
    `;
    if (!change) throw new Error(`Không tìm thấy bản ghi lịch sử #${changeId}`);

    const targetData = change.new_data || change.old_data;
    if (!targetData) throw new Error('Bản ghi lịch sử không có dữ liệu để khôi phục.');

    const canonical = canonicalizeRowData(targetData);
    const dataHash = computeDataHash(canonical);

    const [runRow] = await tx<{ id: string }[]>`
      INSERT INTO public.cic_sheet_sync_runs (
        source_id, trigger, status, rows_read, rows_updated, finished_at, triggered_by
      ) VALUES (
        ${row.source_id}, 'restore', 'success', 1, 1, now(), ${actorId}
      )
      RETURNING id
    `;

    await tx`
      UPDATE public.cic_sheet_rows
      SET data = ${tx.json(canonical as never)},
          data_hash = ${dataHash},
          removed_at = NULL,
          updated_at = now()
      WHERE id = ${row.id}
    `;

    await tx`
      INSERT INTO public.cic_sheet_row_changes (
        row_id, run_id, change_type, old_data, new_data
      ) VALUES (
        ${row.id},
        ${runRow.id},
        'restore',
        ${tx.json(row.data as never)},
        ${tx.json(canonical as never)}
      )
    `;
  });
}
