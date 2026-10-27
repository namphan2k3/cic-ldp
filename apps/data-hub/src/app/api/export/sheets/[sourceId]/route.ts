import { NextRequest, NextResponse } from 'next/server';
import XLSX from 'xlsx-js-style';
import {
  getDb,
  type CicSheetRowRecord,
  type CicSheetSourceRow,
  type SheetColumnDefinition,
} from '@cic/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await context.params;
  const format = (request.nextUrl.searchParams.get('format') || 'xlsx').toLowerCase();
  const sql = getDb();

  const [source] = await sql<CicSheetSourceRow[]>`
    SELECT * FROM public.cic_sheet_sources WHERE id = ${Number(sourceId)} LIMIT 1
  `;
  if (!source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 });
  }

  const rows = await sql<CicSheetRowRecord[]>`
    SELECT *
    FROM public.cic_sheet_rows
    WHERE source_id = ${source.id} AND removed_at IS NULL
    ORDER BY COALESCE(row_number, 999999) ASC, id ASC
  `;

  const schema: SheetColumnDefinition[] = Array.isArray(source.column_schema)
    ? source.column_schema.filter((c) => !c.hidden)
    : [];

  const headers = ['Dòng Sheet', ...schema.map((c) => c.header || c.key), 'Cập nhật cuối'];
  const aoa: unknown[][] = [
    headers,
    ...rows.map((r) => [
      r.row_number ?? '',
      ...schema.map((c) => (r.data && r.data[c.key] !== undefined ? r.data[c.key] : '')),
      new Date(r.updated_at).toLocaleString('vi-VN'),
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, (source.sheet_name || 'Data').slice(0, 31));

  if (format === 'csv') {
    const csv = '\uFEFF' + XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${source.code}.csv"`,
      },
    });
  }

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new NextResponse(buf, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${source.code}.xlsx"`,
    },
  });
}
