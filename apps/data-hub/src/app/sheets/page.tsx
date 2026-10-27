import Link from 'next/link';
import { ExternalLink, FileSpreadsheet, RefreshCw, Trash2 } from 'lucide-react';
import { getDb, type CicSheetSourceRow, type CicSiteRow } from '@cic/db';
import { loadAllServiceAccountCredentials } from '@cic/sheets';
import {
  createBackupNowAction,
  deleteSheetSourceAction,
  syncAllSheetSourcesAction,
  syncSingleSheetSourceAction,
  updateSheetSourceSettingsAction,
} from '../actions';
import { SheetOnboardingForm } from './SheetOnboardingForm';

export const dynamic = 'force-dynamic';

export default async function SheetSourcesPage() {
  const sql = getDb();
  const creds = loadAllServiceAccountCredentials();
  const serviceAccountEmails = creds.map((c) => c.clientEmail);

  const sites = await sql<Pick<CicSiteRow, 'id' | 'code' | 'name'>[]>`
    SELECT id, code, name FROM public.cic_sites ORDER BY id ASC
  `;

  const sources = await sql<
    (CicSheetSourceRow & {
      site_code: string | null;
      site_name: string | null;
      active_rows: number;
      removed_rows: number;
    })[]
  >`
    SELECT
      s.*,
      st.code AS site_code,
      st.name AS site_name,
      (SELECT count(*)::int FROM public.cic_sheet_rows r WHERE r.source_id = s.id AND r.removed_at IS NULL) AS active_rows,
      (SELECT count(*)::int FROM public.cic_sheet_rows r WHERE r.source_id = s.id AND r.removed_at IS NOT NULL) AS removed_rows
    FROM public.cic_sheet_sources s
    LEFT JOIN public.cic_sites st ON st.id = s.site_id
    WHERE s.deleted_at IS NULL
    ORDER BY s.id ASC
  `;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Cài Đặt Nguồn Google Sheets Kéo Về Database ({sources.length} bảng)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Thêm hoặc chỉnh sửa trực tiếp các bảng Google Sheet cần tự động đồng bộ về Database (`Sheet &rarr; DB`).
          </p>
        </div>

        <form action={syncAllSheetSourcesAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Kéo mới tất cả các Sheet ngay
          </button>
        </form>
      </div>

      {/* Add new Sheet Form */}
      <SheetOnboardingForm sites={sites} serviceAccountEmails={serviceAccountEmails} />

      {/* Existing Sheet Sources */}
      <div className="space-y-4">
        {sources.map((src) => {
          const schema = Array.isArray(src.column_schema) ? src.column_schema : [];

          return (
            <div
              key={src.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{src.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        {src.active_rows.toLocaleString('vi-VN')} dòng trong DB
                      </span>
                      {src.site_name && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                          Trang: {src.site_name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>
                        Cập nhật cuối:{' '}
                        <strong>
                          {src.last_synced_at
                            ? new Date(src.last_synced_at).toLocaleString('vi-VN')
                            : 'Chưa chạy'}
                        </strong>
                      </span>
                      <span>&bull;</span>
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${src.spreadsheet_id}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        Mở file Google Sheet gốc <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/data?source=${src.code}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                  >
                    Xem Bảng Dữ Liệu ({src.active_rows}) &rarr;
                  </Link>

                  <a
                    href={`/api/export/sheets/${src.id}?format=xlsx`}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold"
                  >
                    Xuất Excel (.xlsx)
                  </a>

                  <form action={createBackupNowAction}>
                    <input type="hidden" name="scope" value="sheet_source" />
                    <input type="hidden" name="scope_ref_id" value={src.id} />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold cursor-pointer"
                    >
                      Sao lưu bảng này
                    </button>
                  </form>

                  <form action={syncSingleSheetSourceAction}>
                    <input type="hidden" name="source_id" value={src.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Kéo mới từ Sheet ngay
                    </button>
                  </form>

                  <form action={deleteSheetSourceAction}>
                    <input type="hidden" name="source_id" value={src.id} />
                    <button
                      type="submit"
                      title="Xóa nguồn Sheet này"
                      className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Dynamic Columns Badge List */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Các cột trên Sheet đang được lưu trong Database ({schema.length} cột):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {schema.map((col) => (
                      <span
                        key={col.key}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs border border-slate-200 font-medium"
                      >
                        {col.header}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Web Configuration Form for this Sheet Source */}
                <form
                  action={updateSheetSourceSettingsAction}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-3 border-t border-slate-100"
                >
                  <input type="hidden" name="source_id" value={src.id} />

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên hiển thị của bảng
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={src.name}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link hoặc ID Google Sheet
                    </label>
                    <input
                      type="text"
                      name="spreadsheet_id"
                      defaultValue={src.spreadsheet_id}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên Tab (Sheet)
                    </label>
                    <input
                      type="text"
                      name="sheet_name"
                      defaultValue={src.sheet_name}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dòng tiêu đề
                    </label>
                    <input
                      type="number"
                      name="header_row"
                      min={1}
                      max={10}
                      defaultValue={src.header_row}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chu kỳ (phút)
                    </label>
                    <input
                      type="number"
                      name="interval_minutes"
                      min={1}
                      max={1440}
                      defaultValue={src.interval_minutes}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tự động
                    </label>
                    <select
                      name="is_enabled"
                      defaultValue={src.is_enabled ? 'true' : 'false'}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="true">Bật</option>
                      <option value="false">Tạm dừng</option>
                    </select>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="submit"
                      className="w-full px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
