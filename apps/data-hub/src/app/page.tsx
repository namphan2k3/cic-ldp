import Link from 'next/link';
import {
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  HardDriveDownload,
  PlusCircle,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { getDb, type CicSheetSourceRow, type CicSiteRow } from '@cic/db';
import { loadAllServiceAccountCredentials } from '@cic/sheets';
import {
  createBackupNowAction,
  syncAllSheetSourcesAction,
  syncSingleSheetSourceAction,
} from './actions';

export const dynamic = 'force-dynamic';

export default async function DataHubDashboardPage() {
  const sql = getDb();
  const creds = loadAllServiceAccountCredentials();

  const sources = await sql<
    (CicSheetSourceRow & {
      site_code: string | null;
      site_name: string | null;
      active_rows: number;
    })[]
  >`
    SELECT
      s.*,
      st.code AS site_code,
      st.name AS site_name,
      (SELECT count(*)::int FROM public.cic_sheet_rows r WHERE r.source_id = s.id AND r.removed_at IS NULL) AS active_rows
    FROM public.cic_sheet_sources s
    LEFT JOIN public.cic_sites st ON st.id = s.site_id
    WHERE s.deleted_at IS NULL
    ORDER BY s.id ASC
  `;

  const sites = await sql<CicSiteRow[]>`
    SELECT * FROM public.cic_sites WHERE site_type = 'landing' ORDER BY id ASC
  `;

  const totalRows = sources.reduce((acc, s) => acc + Number(s.active_rows || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Trung Tâm Đồng Bộ Google Sheets &rarr; Database (CIC)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tự động lấy dữ liệu mới nhất từ các file Google Sheet (dù mỗi Sheet có các cột khác nhau) lưu về chung 1 Database PostgreSQL nội bộ và sao lưu an toàn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <form action={syncAllSheetSourcesAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Kéo dữ liệu mới nhất từ tất cả Sheet ngay
              </button>
            </form>

            <Link
              href="/sheets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Thêm bảng Google Sheet mới
            </Link>

            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
            >
              <Settings className="w-4 h-4" />
              Cài đặt trên Web
            </Link>
          </div>
        </div>

        {/* 3-Step Visual Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="font-bold text-blue-700 mb-1">
              Bước 1: Cấp quyền Xem trên Google Sheet
            </div>
            <p className="text-slate-600 leading-relaxed">
              Mở file Google Sheet &rarr; bấm nút <strong>Chia sẻ (Share)</strong> quyền <strong>Người xem (Viewer)</strong> cho email bot:{' '}
              <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-900">
                {creds[0]?.clientEmail || 'cms-intellicad-form@n8n-docs-automation-485708.iam.gserviceaccount.com'}
              </code>
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="font-bold text-blue-700 mb-1">
              Bước 2: Dán link Sheet vào mục &ldquo;Cài Đặt Nguồn Sheet&rdquo;
            </div>
            <p className="text-slate-600 leading-relaxed">
              Hệ thống tự động đọc tiêu đề tiếng Việt, tự nhận diện các cột linh hoạt của riêng Sheet đó và kéo toàn bộ dữ liệu về Database.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="font-bold text-blue-700 mb-1">
              Bước 3: Tự động cập nhật &amp; Xuất Excel / Backup
            </div>
            <p className="text-slate-600 leading-relaxed">
              Định kỳ mỗi vài phút hệ thống tự quét Sheet để lấy dòng mới / dòng vừa sửa về DB, lưu lịch sử biến động và cho phép tải file Excel bất kỳ lúc nào.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Active Google Sheets Synced to DB */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">
              1. Các Bảng Google Sheet Đang Đồng Bộ Về Database ({sources.length} bảng &bull; Tổng {totalRows} dòng)
            </h2>
          </div>
          <Link
            href="/sheets"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + Thêm hoặc chỉnh sửa cấu hình Sheet &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-200">
          {sources.map((src) => {
            const cols = Array.isArray(src.column_schema) ? src.column_schema : [];
            return (
              <div
                key={src.id}
                className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 min-w-[280px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/data?source=${src.code}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-600"
                    >
                      {src.name}
                    </Link>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      {src.active_rows} dòng trong DB
                    </span>
                    {src.site_name && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                        Trang: {src.site_name}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                      Tự động kéo mỗi {src.interval_minutes} phút
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>
                      Tab trên Sheet: <strong className="text-slate-700">{src.sheet_name}</strong> (Tiêu đề ở dòng {src.header_row})
                    </span>
                    <span>&bull;</span>
                    <span>
                      Cập nhật lần cuối:{' '}
                      <strong className="text-slate-700">
                        {src.last_synced_at
                          ? new Date(src.last_synced_at).toLocaleString('vi-VN')
                          : 'Chưa đồng bộ'}
                      </strong>
                    </span>
                    <span>&bull;</span>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${src.spreadsheet_id}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Mở file Google Sheet gốc <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {cols.slice(0, 10).map((c) => (
                      <span
                        key={c.key}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {c.header}
                      </span>
                    ))}
                    {cols.length > 10 && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px]">
                        +{cols.length - 10} cột khác
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/data?source=${src.code}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs"
                  >
                    <Database className="w-3.5 h-3.5" />
                    Xem Bảng Dữ Liệu ({src.active_rows})
                  </Link>

                  <a
                    href={`/api/export/sheets/${src.id}?format=xlsx`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Xuất Excel (.xlsx)
                  </a>

                  <form action={syncSingleSheetSourceAction}>
                    <input type="hidden" name="source_id" value={src.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Kéo mới ngay
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: 7 Unified Landing Pages */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">
              2. Danh Sách 7 Trang Landing Page Hợp Nhất (Giữ nguyên 100% giao diện gốc)
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <form action={createBackupNowAction}>
              <input type="hidden" name="scope" value="database" />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold cursor-pointer"
              >
                <HardDriveDownload className="w-3.5 h-3.5" />
                Sao lưu toàn bộ Database ngay
              </button>
            </form>
            <Link href="/sites" className="font-semibold text-blue-600 hover:underline">
              Cấu hình Hotline / Domain / GTM &rarr;
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {sites.map((site) => (
            <div
              key={site.id}
              className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-3 hover:border-blue-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold">
                    {site.code}
                  </span>
                  <span className="text-emerald-600 font-semibold">● Đang chạy</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{site.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tên miền: <strong>{site.primary_domain || 'local'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <a
                  href={`http://localhost:4301/_sites/${site.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Mở xem trang &#8599;
                </a>
                {site.render_mode === 'sections' && (
                  <a
                    href={`http://localhost:4301/admin?site=${site.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Sửa chữ
                  </a>
                )}
                <Link
                  href="/sites"
                  className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cài đặt
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
