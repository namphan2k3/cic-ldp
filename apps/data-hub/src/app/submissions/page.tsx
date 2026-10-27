import { Download, RefreshCw } from 'lucide-react';
import { getDb } from '@cic/db';
import { retryFormDeliveriesAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function FormSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; form?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sql = getDb();

  const forms = await sql<
    {
      id: string;
      code: string;
      title: string;
      site_id: string | null;
      site_code: string | null;
      site_name: string | null;
      submission_count: number;
    }[]
  >`
    SELECT
      f.id,
      f.code,
      f.title,
      f.site_id,
      s.code AS site_code,
      s.name AS site_name,
      (SELECT count(*)::int FROM public.cic_form_submissions sub WHERE sub.form_id = f.id) AS submission_count
    FROM public.cic_forms f
    LEFT JOIN public.cic_sites s ON s.id = f.site_id
    WHERE f.deleted_at IS NULL
    ORDER BY f.site_id NULLS LAST, f.id ASC
  `;

  const selectedFormId = params.form ? Number(params.form) : null;
  const searchQuery = (params.q || '').trim();

  const submissions = await sql<
    {
      id: string;
      form_id: string;
      form_code: string;
      form_title: string;
      site_code: string | null;
      source_path: string | null;
      submitted_at: Date;
      values_json: Array<{ key: string; label: string; value: string }>;
      deliveries_json: Array<{ type: string; status: string; error: string | null }>;
    }[]
  >`
    SELECT
      sub.id,
      sub.form_id,
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
      ) AS values_json,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'type', d.destination_type,
              'status', d.status,
              'error', d.last_error
            ) ORDER BY d.id ASC
          )
          FROM public.cic_form_submission_deliveries d
          WHERE d.submission_id = sub.id
        ),
        '[]'::json
      ) AS deliveries_json
    FROM public.cic_form_submissions sub
    JOIN public.cic_forms f ON f.id = sub.form_id
    LEFT JOIN public.cic_sites st ON st.id = f.site_id
    WHERE 1=1
      ${selectedFormId ? sql`AND sub.form_id = ${selectedFormId}` : sql``}
      ${
        searchQuery
          ? sql`AND EXISTS (
              SELECT 1 FROM public.cic_form_submission_values v2
              WHERE v2.submission_id = sub.id AND v2.value_text ILIKE ${'%' + searchQuery + '%'}
            )`
          : sql``
      }
    ORDER BY sub.submitted_at DESC
    LIMIT 100
  `;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Lượt gửi Biểu mẫu từ Website &amp; Landing Page
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Lưu trữ tập trung vào <code className="font-mono text-xs">cic_form_submissions</code> +{' '}
            <code className="font-mono text-xs">cic_form_submission_values</code> và tự động đẩy sang Google Sheets / Email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/export/submissions?${selectedFormId ? `formId=${selectedFormId}&` : ''}format=xlsx`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel (.xlsx)
          </a>

          <form action={retryFormDeliveriesAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Đẩy lại lượt gửi chờ / lỗi lên Sheet
            </button>
          </form>
        </div>
      </div>

      {/* Filters */}
      <form
        method="GET"
        action="/submissions"
        className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3"
      >
        <select
          name="form"
          defaultValue={selectedFormId ? String(selectedFormId) : ''}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
        >
          <option value="">-- Tất cả Biểu mẫu ({forms.length}) --</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              [{f.site_code || 'cic-web'}] {f.title} ({f.submission_count})
            </option>
          ))}
        </select>

        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Tìm theo họ tên, SĐT, email, công ty..."
          className="flex-1 min-w-[240px] px-3.5 py-2 text-sm rounded-lg border border-slate-300"
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium cursor-pointer"
        >
          Lọc lượt gửi
        </button>
      </form>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Site / Biểu mẫu</th>
                <th className="px-4 py-3">Dữ liệu khách điền (Trường động)</th>
                <th className="px-4 py-3">Trạng thái đẩy Sheet / Email</th>
                <th className="px-4 py-3">Thời gian gửi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Chưa có lượt gửi biểu mẫu nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">#{sub.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{sub.form_title}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {sub.site_code || 'cic-web'} &bull; {sub.form_code}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {(sub.values_json || []).map((v, i) => (
                          <span key={i} className="text-slate-700">
                            <strong className="text-slate-900">{v.label}:</strong> {v.value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(sub.deliveries_json || []).length === 0 ? (
                          <span className="text-slate-400">Chỉ lưu DB</span>
                        ) : (
                          sub.deliveries_json.map((d, i) => (
                            <span
                              key={i}
                              title={d.error || ''}
                              className={`px-2 py-0.5 rounded font-medium ${
                                d.status === 'success'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : d.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {d.type}: {d.status}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(sub.submitted_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
