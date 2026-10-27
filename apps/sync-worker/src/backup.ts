import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx-js-style';
import {
  getDb,
  logPlatformActivity,
  type CicBackupRow,
  type CicSheetRowRecord,
  type CicSheetSourceRow,
  type SheetColumnDefinition,
} from '@cic/db';

export function getBackupBaseDir(): string {
  const dir =
    process.env.BACKUP_STORAGE_DIR?.trim() ||
    path.resolve(process.cwd(), 'infra/supabase/backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function sha256File(filePath: string): { sizeBytes: number; checksum: string } {
  const buf = fs.readFileSync(filePath);
  const checksum = crypto.createHash('sha256').update(buf).digest('hex');
  return { sizeBytes: buf.byteLength, checksum };
}

function timestampSlug(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export async function createDatabaseBackup(
  trigger: 'schedule' | 'manual' | 'pre_restore' = 'manual',
  createdBy: number | null = null
): Promise<CicBackupRow> {
  const sql = getDb();
  const baseDir = getBackupBaseDir();
  const dbSubDir = path.join(baseDir, 'db');
  if (!fs.existsSync(dbSubDir)) fs.mkdirSync(dbSubDir, { recursive: true });

  const fileName = `cic_postgres_${timestampSlug()}.dump`;
  const relativePath = `db/${fileName}`;
  const fullPath = path.join(baseDir, relativePath);

  const [record] = await sql<CicBackupRow[]>`
    INSERT INTO public.cic_backups (
      scope, scope_ref_id, trigger, status, expires_at, created_by
    ) VALUES (
      'database', NULL, ${trigger}, 'running', now() + interval '14 days', ${createdBy}
    )
    RETURNING *
  `;

  try {
    const dbUrl =
      process.env.DATABASE_URL?.trim() ||
      'postgresql://postgres:cic_supabase_2026@localhost:54322/postgres';

    try {
      execSync(`pg_dump "${dbUrl}" -Fc -f "${fullPath}"`, { stdio: 'pipe' });
    } catch {
      // Fallback to docker exec supabase-db if host pg_dump is not in PATH
      execSync(
        `docker exec supabase-db pg_dump -U postgres -d postgres -Fc -f /tmp/${fileName} && docker cp supabase-db:/tmp/${fileName} "${fullPath}"`,
        { stdio: 'pipe' }
      );
    }

    const { sizeBytes, checksum } = sha256File(fullPath);

    const [updated] = await sql<CicBackupRow[]>`
      UPDATE public.cic_backups
      SET status = 'success',
          file_path = ${relativePath},
          size_bytes = ${sizeBytes},
          checksum_sha256 = ${checksum},
          finished_at = now()
      WHERE id = ${record.id}
      RETURNING *
    `;

    await logPlatformActivity({
      actorId: createdBy,
      actorLabel: createdBy ? `User #${createdBy}` : 'BackupRunner',
      actionCode: 'backup.create_database',
      category: 'backups',
      entityType: 'cic_backups',
      entityId: String(record.id),
      entityTitle: fileName,
      module: 'backups',
      result: 'success',
      resultMessage: `Sao lưu DB thành công (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`,
      sourceApp: trigger === 'schedule' ? 'sync-worker' : 'data-hub',
    });

    return updated;
  } catch (err: any) {
    const msg = err?.message || 'Lỗi khi chạy pg_dump';
    const [failed] = await sql<CicBackupRow[]>`
      UPDATE public.cic_backups
      SET status = 'failed',
          error_message = ${msg},
          finished_at = now()
      WHERE id = ${record.id}
      RETURNING *
    `;
    return failed;
  }
}

export async function createSheetSourceBackup(
  sourceId: string | number,
  trigger: 'schedule' | 'manual' | 'pre_restore' = 'manual',
  createdBy: number | null = null
): Promise<CicBackupRow> {
  const sql = getDb();
  const [source] = await sql<CicSheetSourceRow[]>`
    SELECT * FROM public.cic_sheet_sources WHERE id = ${sourceId} LIMIT 1
  `;
  if (!source) throw new Error(`Không tìm thấy nguồn Sheet #${sourceId}`);

  const baseDir = getBackupBaseDir();
  const sheetsSubDir = path.join(baseDir, 'sheets');
  if (!fs.existsSync(sheetsSubDir)) fs.mkdirSync(sheetsSubDir, { recursive: true });

  const slug = timestampSlug();
  const jsonRelPath = `sheets/${source.code}_${slug}.json`;
  const xlsxRelPath = `sheets/${source.code}_${slug}.xlsx`;
  const jsonFullPath = path.join(baseDir, jsonRelPath);
  const xlsxFullPath = path.join(baseDir, xlsxRelPath);

  const [record] = await sql<CicBackupRow[]>`
    INSERT INTO public.cic_backups (
      scope, scope_ref_id, trigger, status, expires_at, created_by
    ) VALUES (
      'sheet_source', ${source.id}, ${trigger}, 'running', now() + interval '30 days', ${createdBy}
    )
    RETURNING *
  `;

  try {
    const rows = await sql<CicSheetRowRecord[]>`
      SELECT *
      FROM public.cic_sheet_rows
      WHERE source_id = ${source.id} AND removed_at IS NULL
      ORDER BY COALESCE(row_number, 999999) ASC, id ASC
    `;

    const snapshotPayload = {
      exportedAt: new Date().toISOString(),
      source: {
        id: source.id,
        code: source.code,
        name: source.name,
        spreadsheet_id: source.spreadsheet_id,
        sheet_name: source.sheet_name,
        key_columns: source.key_columns,
        column_schema: source.column_schema,
      },
      rowCount: rows.length,
      rows: rows.map((r) => ({
        row_key: r.row_key,
        row_number: r.row_number,
        data: r.data,
        data_hash: r.data_hash,
        first_seen_at: r.first_seen_at,
        last_seen_at: r.last_seen_at,
      })),
    };

    fs.writeFileSync(jsonFullPath, JSON.stringify(snapshotPayload, null, 2), 'utf8');

    // Also build XLSX export for convenient direct download in Excel
    const schema: SheetColumnDefinition[] = Array.isArray(source.column_schema)
      ? source.column_schema
      : [];
    const headers = schema.map((c) => c.header || c.key);
    const keys = schema.map((c) => c.key);

    const sheetAoA: unknown[][] = [
      headers,
      ...rows.map((r) => keys.map((k) => (r.data && r.data[k] !== undefined ? r.data[k] : ''))),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetAoA);
    XLSX.utils.book_append_sheet(wb, ws, (source.sheet_name || 'Data').slice(0, 31));
    XLSX.writeFile(wb, xlsxFullPath);

    const { sizeBytes, checksum } = sha256File(jsonFullPath);

    const [updated] = await sql<CicBackupRow[]>`
      UPDATE public.cic_backups
      SET status = 'success',
          file_path = ${jsonRelPath},
          remote_ref = ${xlsxRelPath},
          size_bytes = ${sizeBytes},
          checksum_sha256 = ${checksum},
          finished_at = now()
      WHERE id = ${record.id}
      RETURNING *
    `;

    await logPlatformActivity({
      actorId: createdBy,
      actorLabel: createdBy ? `User #${createdBy}` : 'BackupRunner',
      actionCode: 'backup.create_sheet_source',
      category: 'backups',
      entityType: 'cic_backups',
      entityId: String(record.id),
      entityTitle: `${source.name} (${rows.length} dòng)`,
      module: 'backups',
      result: 'success',
      resultMessage: `Sao lưu nguồn Sheet ${source.code} (${rows.length} dòng) ra JSON & XLSX`,
      sourceApp: trigger === 'schedule' ? 'sync-worker' : 'data-hub',
    });

    return updated;
  } catch (err: any) {
    const msg = err?.message || 'Lỗi sao lưu nguồn Sheet';
    const [failed] = await sql<CicBackupRow[]>`
      UPDATE public.cic_backups
      SET status = 'failed',
          error_message = ${msg},
          finished_at = now()
      WHERE id = ${record.id}
      RETURNING *
    `;
    return failed;
  }
}

export async function createSiteContentBackup(
  siteId: string | number,
  trigger: 'schedule' | 'manual' | 'pre_restore' = 'manual',
  createdBy: number | null = null
): Promise<CicBackupRow> {
  const sql = getDb();
  const [site] = await sql<{ id: string; code: string; name: string }[]>`
    SELECT id, code, name FROM public.cic_sites WHERE id = ${siteId} LIMIT 1
  `;
  if (!site) throw new Error(`Không tìm thấy site #${siteId}`);

  const baseDir = getBackupBaseDir();
  const sitesSubDir = path.join(baseDir, 'sites');
  if (!fs.existsSync(sitesSubDir)) fs.mkdirSync(sitesSubDir, { recursive: true });

  const relPath = `sites/${site.code}_${timestampSlug()}.json`;
  const fullPath = path.join(baseDir, relPath);

  const [record] = await sql<CicBackupRow[]>`
    INSERT INTO public.cic_backups (
      scope, scope_ref_id, trigger, status, expires_at, created_by
    ) VALUES (
      'site_content', ${site.id}, ${trigger}, 'running', now() + interval '30 days', ${createdBy}
    )
    RETURNING *
  `;

  try {
    const [siteRow] = await sql`SELECT * FROM public.cic_sites WHERE id = ${site.id}`;
    const pages = await sql`SELECT * FROM public.cic_content_pages WHERE site_id = ${site.id}`;
    const pageIds = pages.map((p) => p.id);
    const revisions =
      pageIds.length > 0
        ? await sql`SELECT * FROM public.cic_content_page_revisions WHERE page_id IN ${sql(pageIds)}`
        : [];
    const revIds = revisions.map((r) => r.id);
    const sections =
      revIds.length > 0
        ? await sql`SELECT * FROM public.cic_content_page_sections WHERE revision_id IN ${sql(revIds)}`
        : [];

    const payload = {
      exportedAt: new Date().toISOString(),
      site: siteRow,
      pages,
      revisions,
      sections,
    };

    fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2), 'utf8');
    const { sizeBytes, checksum } = sha256File(fullPath);

    const [updated] = await sql<CicBackupRow[]>`
      UPDATE public.cic_backups
      SET status = 'success',
          file_path = ${relPath},
          size_bytes = ${sizeBytes},
          checksum_sha256 = ${checksum},
          finished_at = now()
      WHERE id = ${record.id}
      RETURNING *
    `;

    return updated;
  } catch (err: any) {
    const msg = err?.message || 'Lỗi sao lưu nội dung site';
    const [failed] = await sql<CicBackupRow[]>`
      UPDATE public.cic_backups
      SET status = 'failed',
          error_message = ${msg},
          finished_at = now()
      WHERE id = ${record.id}
      RETURNING *
    `;
    return failed;
  }
}

export async function restoreSheetSourceBackup(
  backupId: string | number,
  actorId: number | null = null
): Promise<{ restoredRows: number }> {
  const sql = getDb();
  const [backup] = await sql<CicBackupRow[]>`
    SELECT * FROM public.cic_backups WHERE id = ${backupId} AND scope = 'sheet_source' LIMIT 1
  `;
  if (!backup || !backup.file_path || !backup.scope_ref_id) {
    throw new Error('Bản sao lưu nguồn Sheet không hợp lệ.');
  }

  const fullPath = path.join(getBackupBaseDir(), backup.file_path);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Không tìm thấy file sao lưu trên ổ đĩa: ${backup.file_path}`);
  }

  // Always create a pre_restore backup before restoring
  await createSheetSourceBackup(backup.scope_ref_id, 'pre_restore', actorId);

  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const snapshotRows: Array<{
    row_key: string;
    row_number: number | null;
    data: Record<string, unknown>;
    data_hash: string;
  }> = parsed.rows || [];

  await sql.begin(async (tx) => {
    const [run] = await tx<{ id: string }[]>`
      INSERT INTO public.cic_sheet_sync_runs (
        source_id, trigger, status, rows_read, rows_updated, finished_at, triggered_by
      ) VALUES (
        ${backup.scope_ref_id}, 'restore', 'success', ${snapshotRows.length}, ${snapshotRows.length}, now(), ${actorId}
      )
      RETURNING id
    `;

    // Mark current rows as removed first
    await tx`
      UPDATE public.cic_sheet_rows
      SET removed_at = now(), updated_at = now()
      WHERE source_id = ${backup.scope_ref_id} AND removed_at IS NULL
    `;

    for (const r of snapshotRows) {
      const [upserted] = await tx<{ id: string }[]>`
        INSERT INTO public.cic_sheet_rows (
          source_id, row_key, row_number, data, data_hash, first_seen_at, last_seen_at, updated_at, removed_at
        ) VALUES (
          ${backup.scope_ref_id},
          ${r.row_key},
          ${r.row_number ?? null},
          ${tx.json(r.data as never)},
          ${r.data_hash},
          now(),
          now(),
          now(),
          NULL
        )
        ON CONFLICT (source_id, row_key) DO UPDATE SET
          row_number = EXCLUDED.row_number,
          data = EXCLUDED.data,
          data_hash = EXCLUDED.data_hash,
          last_seen_at = now(),
          updated_at = now(),
          removed_at = NULL
        RETURNING id
      `;

      await tx`
        INSERT INTO public.cic_sheet_row_changes (
          row_id, run_id, change_type, old_data, new_data
        ) VALUES (
          ${upserted.id},
          ${run.id},
          'restore',
          NULL,
          ${tx.json(r.data as never)}
        )
      `;
    }
  });

  await logPlatformActivity({
    actorId,
    actorLabel: actorId ? `User #${actorId}` : 'RestoreRunner',
    actionCode: 'backup.restore_sheet_source',
    category: 'backups',
    severity: 'medium',
    entityType: 'cic_backups',
    entityId: String(backup.id),
    entityTitle: backup.file_path,
    module: 'backups',
    result: 'success',
    resultMessage: `Khôi phục ${snapshotRows.length} dòng từ bản sao lưu #${backup.id}`,
    sourceApp: 'data-hub',
  });

  return { restoredRows: snapshotRows.length };
}
