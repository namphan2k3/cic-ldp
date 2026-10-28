import { describe, expect, it } from 'vitest';
import {
  buildColumnSchema,
  computeDataHash,
  computeRowKey,
  normalizeCellValue,
  normalizeHeaderKey,
} from '../normalizer.ts';
import { diffSheetRows } from '../diff.ts';

describe('@cic/sheets normalizer & diff engine', () => {
  it('normalizes Vietnamese headers with diacritics and special characters into stable snake_case keys', () => {
    const used = new Set<string>();
    expect(normalizeHeaderKey('Họ và Tên *', 0, used)).toBe('ho_va_ten');
    expect(normalizeHeaderKey('Số điện thoại (Zalo)', 1, used)).toBe('so_dien_thoai_zalo');
    expect(normalizeHeaderKey('Đơn vị / Công ty', 2, used)).toBe('don_vi_cong_ty');
    expect(normalizeHeaderKey('Họ và Tên *', 3, used)).toBe('ho_va_ten_2');
    expect(normalizeHeaderKey('   ', 4, used)).toBe('col_5');
  });

  it('infers dynamic column schema and detects schema changes when columns are added', () => {
    const headers1 = ['Thời gian', 'Họ và tên', 'Số điện thoại', 'Email'];
    const sample1 = [['22/10/2026 09:00', 'Nguyễn Văn A', '0912345678', 'a@cic.com.vn']];
    const res1 = buildColumnSchema(headers1, sample1, []);

    expect(res1.schemaChanged).toBe(false);
    expect(res1.schema.map((c) => ({ key: c.key, type: c.type }))).toEqual([
      { key: 'thoi_gian', type: 'datetime' },
      { key: 'ho_va_ten', type: 'text' },
      { key: 'so_dien_thoai', type: 'phone' },
      { key: 'email', type: 'email' },
    ]);

    // Add a new column "Ghi chú"
    const headers2 = [...headers1, 'Ghi chú'];
    const res2 = buildColumnSchema(headers2, sample1, res1.schema);
    expect(res2.schemaChanged).toBe(true);
    expect(res2.schema).toHaveLength(5);
    expect(res2.schema[4].key).toBe('ghi_chu');
  });

  it('preserves leading zero on phone numbers even if Google Sheets unformatted value stripped it', () => {
    expect(normalizeCellValue(912345678, '912345678', 'phone')).toBe('0912345678');
    expect(normalizeCellValue('0987654321', "'0987654321", 'phone')).toBe('0987654321');
    expect(normalizeCellValue('+84905112233', '+84 905 112 233', 'phone')).toBe('0905112233');
  });

  it('computes deterministic data_hash and row_key from key_columns or content hash fallback', () => {
    const rowA = { ho_va_ten: 'Trần B', so_dien_thoai: '0909123456', email: 'b@cic.vn' };
    const rowB = { email: 'b@cic.vn', so_dien_thoai: '0909123456', ho_va_ten: 'Trần B' };
    expect(computeDataHash(rowA)).toBe(computeDataHash(rowB));
    expect(computeRowKey(rowA, ['so_dien_thoai', 'email'])).toBe('0909123456|b@cic.vn');
    expect(computeRowKey(rowA, [])).toBe(computeDataHash(rowA));
  });

  it('accurately diffs insert, update, soft-remove, and restore without hard-deleting', () => {
    const hash1 = computeDataHash({ so_dien_thoai: '0901112222', ten: 'User 1' });
    const hash2Old = computeDataHash({ so_dien_thoai: '0902223333', ten: 'User 2 Old' });
    const hash2New = computeDataHash({ so_dien_thoai: '0902223333', ten: 'User 2 Updated' });
    const hash3 = computeDataHash({ so_dien_thoai: '0903334444', ten: 'User 3 Removed' });
    const hash4 = computeDataHash({ so_dien_thoai: '0904445555', ten: 'User 4 Restored' });
    const hash5 = computeDataHash({ so_dien_thoai: '0905556666', ten: 'User 5 New' });

    const existing = [
      { id: '1', row_key: '0901112222', row_number: 2, data: { so_dien_thoai: '0901112222', ten: 'User 1' }, data_hash: hash1, removed_at: null },
      { id: '2', row_key: '0902223333', row_number: 3, data: { so_dien_thoai: '0902223333', ten: 'User 2 Old' }, data_hash: hash2Old, removed_at: null },
      { id: '3', row_key: '0903334444', row_number: 4, data: { so_dien_thoai: '0903334444', ten: 'User 3 Removed' }, data_hash: hash3, removed_at: null },
      { id: '4', row_key: '0904445555', row_number: 5, data: { so_dien_thoai: '0904445555', ten: 'User 4 Restored' }, data_hash: hash4, removed_at: '2026-10-20T00:00:00Z' },
    ];

    const incoming = [
      { row_key: '0901112222', row_number: 2, data: { so_dien_thoai: '0901112222', ten: 'User 1' }, data_hash: hash1 },
      { row_key: '0902223333', row_number: 3, data: { so_dien_thoai: '0902223333', ten: 'User 2 Updated' }, data_hash: hash2New },
      { row_key: '0904445555', row_number: 4, data: { so_dien_thoai: '0904445555', ten: 'User 4 Restored' }, data_hash: hash4 },
      { row_key: '0905556666', row_number: 5, data: { so_dien_thoai: '0905556666', ten: 'User 5 New' }, data_hash: hash5 },
    ];

    const diff = diffSheetRows(existing, incoming);
    expect(diff.unchangedCount).toBe(1);
    expect(diff.toInsert).toHaveLength(1);
    expect(diff.toInsert[0].row_key).toBe('0905556666');
    expect(diff.toUpdate).toHaveLength(1);
    expect(diff.toUpdate[0].existingId).toBe('2');
    expect(diff.toRemove).toHaveLength(1);
    expect(diff.toRemove[0].existingId).toBe('3');
    expect(diff.toRestore).toHaveLength(1);
    expect(diff.toRestore[0].existingId).toBe('4');
  });
});
