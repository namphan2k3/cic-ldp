export interface ExistingSheetRowSnapshot {
  id: string;
  row_key: string;
  row_number: number | null;
  data: Record<string, unknown>;
  data_hash: string;
  removed_at: Date | string | null;
}

export interface IncomingSheetRowSnapshot {
  row_key: string;
  row_number: number;
  data: Record<string, unknown>;
  data_hash: string;
}

export interface SheetRowDiffResult {
  toInsert: IncomingSheetRowSnapshot[];
  toUpdate: Array<{
    existingId: string;
    row_key: string;
    row_number: number;
    old_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
    data_hash: string;
  }>;
  toRestore: Array<{
    existingId: string;
    row_key: string;
    row_number: number;
    old_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
    data_hash: string;
  }>;
  toRemove: Array<{
    existingId: string;
    row_key: string;
    old_data: Record<string, unknown>;
  }>;
  toTouchRowNumber: Array<{
    existingId: string;
    row_number: number;
  }>;
  unchangedCount: number;
}

/**
 * Pure diff engine comparing current DB rows of a sheet source against newly read Google Sheet rows.
 * Never hard-deletes: missing active rows are placed in `toRemove` (soft mark `removed_at = now()`),
 * and previously removed rows that reappear on the sheet are placed in `toRestore`.
 */
export function diffSheetRows(
  existingRows: ExistingSheetRowSnapshot[],
  incomingRows: IncomingSheetRowSnapshot[]
): SheetRowDiffResult {
  const existingByKey = new Map<string, ExistingSheetRowSnapshot>();
  for (const row of existingRows) {
    existingByKey.set(row.row_key, row);
  }

  // Deduplicate incoming rows by row_key (last occurrence wins if sheet has duplicate keys)
  const dedupedIncoming = new Map<string, IncomingSheetRowSnapshot>();
  for (const inc of incomingRows) {
    dedupedIncoming.set(inc.row_key, inc);
  }

  const toInsert: SheetRowDiffResult['toInsert'] = [];
  const toUpdate: SheetRowDiffResult['toUpdate'] = [];
  const toRestore: SheetRowDiffResult['toRestore'] = [];
  const toRemove: SheetRowDiffResult['toRemove'] = [];
  const toTouchRowNumber: SheetRowDiffResult['toTouchRowNumber'] = [];
  let unchangedCount = 0;

  const seenKeys = new Set<string>();

  for (const [rowKey, inc] of dedupedIncoming.entries()) {
    seenKeys.add(rowKey);
    const existing = existingByKey.get(rowKey);

    if (!existing) {
      toInsert.push(inc);
      continue;
    }

    if (existing.removed_at !== null && existing.removed_at !== undefined) {
      toRestore.push({
        existingId: existing.id,
        row_key: rowKey,
        row_number: inc.row_number,
        old_data: existing.data,
        new_data: inc.data,
        data_hash: inc.data_hash,
      });
      continue;
    }

    if (existing.data_hash !== inc.data_hash) {
      toUpdate.push({
        existingId: existing.id,
        row_key: rowKey,
        row_number: inc.row_number,
        old_data: existing.data,
        new_data: inc.data,
        data_hash: inc.data_hash,
      });
    } else {
      unchangedCount++;
      if (existing.row_number !== inc.row_number) {
        toTouchRowNumber.push({
          existingId: existing.id,
          row_number: inc.row_number,
        });
      }
    }
  }

  for (const existing of existingRows) {
    if (!seenKeys.has(existing.row_key) && (existing.removed_at === null || existing.removed_at === undefined)) {
      toRemove.push({
        existingId: existing.id,
        row_key: existing.row_key,
        old_data: existing.data,
      });
    }
  }

  return {
    toInsert,
    toUpdate,
    toRestore,
    toRemove,
    toTouchRowNumber,
    unchangedCount,
  };
}
