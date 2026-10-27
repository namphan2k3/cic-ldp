import { NextRequest, NextResponse } from 'next/server';
import XLSX from 'xlsx-js-style';
import { getDb } from '@cic/db';

export async function GET(request: NextRequest) {
  const formId = request.nextUrl.searchParams.get('formId');
  const format = (request.nextUrl.searchParams.get('format') || 'xlsx').toLowerCase();
  const sql = getDb();

  const rows = await sql<
    {
      id: string;
      form_code: string;
      form_title: string;
      site_code: string | null;
      source_path: string | null;
      submitted_at: Date;
      values_json: Array<{ key: string; label: string; value: string }>;
    }[]
  >`
    SELECT
      sub.id,
      f.code AS form_code,
      f.title AS form_title,
      st.code AS site_code,
      sub.source_path,
      sub.submitted_at,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'key', v.field_key,
              'label', COALESCE(ff.label, v.field_key),
              'value', COALESCE(v.value_text, v.value_json::text, '')
            ) ORDER BY v.id ASC
          )
          FROM public.cic_form_submission_values v
          LEFT JOIN public.cic_form_fields ff ON ff.id = v.field_id
          WHERE v.submission_id = sub.id
        ),
        '[]'::json
      ) AS values_json
    FROM public.cic_form_submissions sub
    JOIN public.cic_forms f ON f.id = sub.form_id
    LEFT JOIN public.cic_sites st ON st.id = f.site_id
    WHERE 1=1
      ${formId ? sql`AND sub.form_id = ${Number(formId)}` : sql``}
    ORDER BY sub.submitted_at DESC
    LIMIT 5000
  `;

  // Collect all unique dynamic field keys in order of appearance
  const dynamicKeys: Array<{ key: string; label: string }> = [];
  const seenKeys = new Set<string>();
  for (const r of rows) {
    for (const v of r.values_json || []) {
      if (!seenKeys.has(v.key)) {
        seenKeys.add(v.key);
        dynamicKeys.push({ key: v.key, label: v.label || v.key });
      }
    }
  }

  const headers = [
    'ID',
    'Thời gian gửi',
    'Site',
    'Biểu mẫu',
    ...dynamicKeys.map((k) => k.label),
    'Đường dẫn nguồn',
  ];

  const aoa: unknown[][] = [
    headers,
    ...rows.map((r) => {
      const valMap = new Map<string, string>();
      for (const v of r.values_json || []) {
        valMap.set(v.key, v.value);
      }
      return [
        r.id,
        new Date(r.submitted_at).toLocaleString('vi-VN'),
        r.site_code || 'cic-web',
        r.form_title,
        ...dynamicKeys.map((k) => valMap.get(k.key) ?? ''),
        r.source_path || '',
      ];
    }),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

  if (format === 'csv') {
    const csv = '\uFEFF' + XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cic_form_submissions.csv"',
      },
    });
  }

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new NextResponse(buf, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="cic_form_submissions.xlsx"',
    },
  });
}
