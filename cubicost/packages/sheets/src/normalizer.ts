import crypto from 'node:crypto';
import type { SheetColumnDefinition } from '@cic/db';

/**
 * Strips Vietnamese diacritics and converts a column header into a stable snake_case key.
 * E.g. "Số điện thoại" -> "so_dien_thoai", "Họ và Tên *" -> "ho_va_ten".
 */
export function normalizeHeaderKey(
  rawHeader: string,
  colIndex: number,
  usedKeys?: Set<string>
): string {
  const cleaned = String(rawHeader ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const baseKey = cleaned || `col_${colIndex + 1}`;
  if (!usedKeys) {
    return baseKey;
  }

  let candidate = baseKey;
  let suffix = 2;
  while (usedKeys.has(candidate)) {
    candidate = `${baseKey}_${suffix}`;
    suffix++;
  }
  usedKeys.add(candidate);
  return candidate;
}

export function inferColumnType(
  header: string,
  sampleValues: unknown[]
): SheetColumnDefinition['type'] {
  const h = normalizeHeaderKey(header, 0);
  if (
    h.includes('dien_thoai') ||
    h.includes('phone') ||
    h === 'sdt' ||
    h.startsWith('sdt_') ||
    h.endsWith('_sdt') ||
    h.includes('mobile') ||
    h.includes('tel')
  ) {
    return 'phone';
  }
  if (h.includes('email') || h.includes('mail')) {
    return 'email';
  }
  if (
    h.includes('thoi_gian') ||
    h.includes('ngay') ||
    h.includes('timestamp') ||
    h.includes('created') ||
    h.includes('date') ||
    h.includes('time')
  ) {
    return 'datetime';
  }
  if (h.includes('url') || h.includes('link') || h.includes('website')) {
    return 'url';
  }

  const nonEmpty = sampleValues
    .map((v) => String(v ?? '').trim())
    .filter((v) => v.length > 0)
    .slice(0, 25);

  if (nonEmpty.length === 0) {
    return 'text';
  }

  if (nonEmpty.every((v) => /^(\+?84|0)\d{8,11}$/.test(v.replace(/[\s.-]/g, '')))) {
    return 'phone';
  }
  if (nonEmpty.every((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) {
    return 'email';
  }
  if (nonEmpty.every((v) => /^https?:\/\//i.test(v))) {
    return 'url';
  }
  if (nonEmpty.every((v) => /^-?\d+(\.\d+)?$/.test(v) && !/^0\d+$/.test(v))) {
    return 'number';
  }

  return 'text';
}

export function buildColumnSchema(
  headers: string[],
  sampleRows: unknown[][],
  existingSchema: SheetColumnDefinition[] = []
): { schema: SheetColumnDefinition[]; schemaChanged: boolean } {
  const usedKeys = new Set<string>();
  const existingByKey = new Map<string, SheetColumnDefinition>();
  const existingByPos = new Map<number, SheetColumnDefinition>();

  for (const col of existingSchema) {
    existingByKey.set(col.key, col);
    existingByPos.set(col.position, col);
  }

  const nextSchema: SheetColumnDefinition[] = [];
  let schemaChanged = existingSchema.length > 0 && existingSchema.length !== headers.length;

  headers.forEach((rawHeader, idx) => {
    const position = idx + 1;
    const header = String(rawHeader ?? '').trim() || `Cột ${position}`;
    const generatedKey = normalizeHeaderKey(header, idx, usedKeys);
    const sampleValues = sampleRows.map((row) => (Array.isArray(row) ? row[idx] : undefined));
    const inferredType = inferColumnType(header, sampleValues);

    const prevByKey = existingByKey.get(generatedKey);
    const prevByPos = existingByPos.get(position);

    if (prevByKey) {
      if (prevByKey.position !== position || prevByKey.header !== header) {
        schemaChanged = true;
      }
      nextSchema.push({
        key: prevByKey.key,
        header,
        type: prevByKey.type || inferredType,
        position,
        hidden: Boolean(prevByKey.hidden),
      });
    } else if (prevByPos && !headers.some((h, i) => normalizeHeaderKey(h, i) === prevByPos.key)) {
      // Header text was renamed in place on the sheet: preserve stable key if not colliding, or record change
      schemaChanged = true;
      nextSchema.push({
        key: generatedKey,
        header,
        type: inferredType,
        position,
        hidden: Boolean(prevByPos.hidden),
      });
    } else {
      if (existingSchema.length > 0) {
        schemaChanged = true;
      }
      nextSchema.push({
        key: generatedKey,
        header,
        type: inferredType,
        position,
        hidden: false,
      });
    }
  });

  return { schema: nextSchema, schemaChanged };
}

export function normalizeCellValue(
  unformattedVal: unknown,
  formattedVal: unknown,
  colType: SheetColumnDefinition['type']
): string | number | boolean | null {
  const rawFormatted = formattedVal !== undefined && formattedVal !== null ? String(formattedVal).trim() : '';
  const rawUnformatted = unformattedVal;

  if (
    (rawUnformatted === undefined || rawUnformatted === null || String(rawUnformatted).trim() === '') &&
    rawFormatted === ''
  ) {
    return null;
  }

  if (colType === 'phone') {
    // Prefer formatted value to preserve leading zero, or restore leading '0' if numeric 9-digit VN mobile
    const candidate = (rawFormatted || String(rawUnformatted ?? '')).replace(/^'+/, '').trim();
    const digitsOnly = candidate.replace(/[\s().+-]/g, '');
    if (/^[35789]\d{8}$/.test(digitsOnly)) {
      return `0${digitsOnly}`;
    }
    if (/^84[35789]\d{8}$/.test(digitsOnly)) {
      return `0${digitsOnly.slice(2)}`;
    }
    return candidate || null;
  }

  if (colType === 'datetime') {
    // Prefer formatted string from Google Sheet so human-entered dates/timestamps remain exact and readable
    if (rawFormatted) {
      return rawFormatted;
    }
    return String(rawUnformatted).trim() || null;
  }

  if (colType === 'number' && typeof rawUnformatted === 'number' && Number.isFinite(rawUnformatted)) {
    return rawUnformatted;
  }

  const textVal = (rawFormatted || String(rawUnformatted ?? '')).replace(/^'+/, '').trim();
  return textVal === '' ? null : textVal;
}

export function canonicalizeRowData(data: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(data).sort()) {
    const val = data[key];
    if (val !== null && val !== undefined && val !== '') {
      sorted[key] = val;
    }
  }
  return sorted;
}

export function computeDataHash(data: Record<string, unknown>): string {
  const canonical = canonicalizeRowData(data);
  return crypto.createHash('sha256').update(JSON.stringify(canonical), 'utf8').digest('hex');
}

export function computeRowKey(
  data: Record<string, unknown>,
  keyColumns: string[],
  dataHashFallback?: string
): string {
  if (Array.isArray(keyColumns) && keyColumns.length > 0) {
    const parts = keyColumns
      .map((colKey) => String(data[colKey] ?? '').trim().toLowerCase())
      .filter((v) => v.length > 0);
    if (parts.length > 0) {
      const composite = parts.join('|');
      return composite.length <= 240
        ? composite
        : crypto.createHash('sha256').update(composite, 'utf8').digest('hex');
    }
  }
  return dataHashFallback || computeDataHash(data);
}
