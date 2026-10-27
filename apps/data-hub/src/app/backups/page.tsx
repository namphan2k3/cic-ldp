import { HardDriveDownload, RotateCcw } from 'lucide-react';
import { getDb, type CicBackupRow, type CicSheetSourceRow, type CicSiteRow } from '@cic/db';
import { createBackupNowAction, restoreSheetBackupAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function BackupsManagementPage() {
  const sql = getDb();

  const backups = await sql<CicBackupRow[]>`
    SELECT * FROM public.cic_backups ORDER BY started_at DESC LIMIT 100
  `;

  const sheetSources = await sql<Pick<CicSheetSourceRow, 'id' | 'code' | 'name'>[]>`
    SELECT id, code, name FROM public.cic_sheet_sources WHERE deleted_at IS NULL ORDER BY id ASC
  `;

  const sites = await sql<Pick<CicSiteRow, 'id' | 'code' | 'name'>[]>`
    SELECT id, code, name FROM public.cic_sites ORDER BY id ASC
  `;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Sao lưu &amp; Khôi phục Dữ liệu (Backup &amp; Restore)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tạo bản sao lưu toàn bộ Database PostgreSQL (<code className="font-mono text-xs">pg_dump -Fc</code>), bản sao lưu từng nguồn Google Sheet (JSON + XLSX) và nội dung các trang Landing Page. Mọi thao tác khôi phục đều tự động tạo bản <code className="font-mono text-xs">pre_restore</code> trước khi ghi đè.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          {/* 1. Full DB Backup */}
          <form
            action={createBackupNowAction}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
          >
            <input type="hidden" name="scope" value="database" />
            <div>
              <div className="text-sm font-bold text-slate-900">
                1. Sao lưu toàn bộ PostgreSQL DB
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Chạy <code className="font-mono">pg_dump -Fc</code> toàn bộ 94 bảng (sản phẩm, tin tức, cấu hình, dữ liệu Sheet, biểu mẫu).
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
            >
              <HardDriveDownload className="w-4 h-4" />
              Tạo bản Backup Database (.dump)
            </button>
          </form>

          {/* 2. Sheet Source Snapshot */}
          <form
            action={createBackupNowAction}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
          >
            <input type="hidden" name="scope" value="sheet_source" />
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-900">
                2. Sao lưu 1 Nguồn Google Sheet
              </div>
              <select
                name="scope_ref_id"
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {sheetSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              <HardDriveDownload className="w-4 h-4" />
              Sao lưu Nguồn Sheet (JSON + XLSX)
            </button>
          </form>

          {/* 3. Site Content Snapshot */}
          <form
            action={createBackupNowAction}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
          >
            <input type="hidden" name="scope" value="site_content" />
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-900">
                3. Sao lưu Nội dung &amp; Cấu hình Site
              </div>
              <select
                name="scope_ref_id"
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
            >
              <HardDriveDownload className="w-4 h-4" />
              Sao lưu Nội dung Site (.json)
            </button>
          </form>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">
            Danh sách Bản sao lưu ({backups.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Phạm vi (Scope)</th>
                <th className="px-4 py-3">Kích hoạt</th>
                <th className="px-4 py-3">Đường dẫn tệp</th>
                <th className="px-4 py-3">Dung lượng / SHA-256</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Chưa có bản sao lưu nào. Hãy bấm nút tạo bản sao lưu ở trên.
                  </td>
                </tr>
              ) : (
                backups.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">#{bk.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-medium">
                        {bk.scope}
                        {bk.scope_ref_id ? ` #${bk.scope_ref_id}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{bk.trigger}</td>
                    <td className="px-4 py-3 font-mono text-slate-800">
                      {bk.file_path || bk.error_message || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {bk.size_bytes ? (
                        <div>
                          <strong>{(Number(bk.size_bytes) / 1024).toFixed(1)} KB</strong>
                          {bk.checksum_sha256 && (
                            <div className="text-[10px] font-mono text-slate-400">
                              sha256: {bk.checksum_sha256.slice(0, 16)}...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-rose-600">{bk.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(bk.started_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      {bk.status === 'success' && bk.file_path && (
                        <>
                          <a
                            href={`/api/backups/${bk.id}/download`}
                            className="inline-block px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium"
                          >
                            Tải file
                          </a>
                          {bk.remote_ref && (
                            <a
                              href={`/api/backups/${bk.id}/download?type=xlsx`}
                              className="inline-block px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium"
                            >
                              Tải XLSX
                            </a>
                          )}
                          {bk.scope === 'sheet_source' && (
                            <form action={restoreSheetBackupAction} className="inline-block">
                              <input type="hidden" name="backup_id" value={bk.id} />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Khôi phục
                              </button>
                            </form>
                          )}
                        </>
                      )}
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
