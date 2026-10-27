import { KeyRound, Mail, RefreshCw, Settings } from 'lucide-react';
import { getDb, type CicSiteRow } from '@cic/db';
import { loadAllServiceAccountCredentials } from '@cic/sheets';
import {
  createBackupNowAction,
  savePlatformSettingsAction,
  syncAllSheetSourcesAction,
  uploadServiceAccountJsonAction,
} from '../actions';

export const dynamic = 'force-dynamic';

export default async function PlatformWebSettingsPage() {
  const sql = getDb();
  const creds = loadAllServiceAccountCredentials();

  const [portalSite] = await sql<CicSiteRow[]>`
    SELECT * FROM public.cic_sites WHERE code = 'cic' LIMIT 1
  `;

  const cfg = ((portalSite?.settings?.platform_config as Record<string, unknown>) || {}) as {
    auto_sync_enabled?: boolean;
    default_interval_minutes?: number;
    auto_backup_enabled?: boolean;
    backup_retention_days?: number;
    smtp_host?: string;
    smtp_port?: number;
    smtp_user?: string;
    smtp_pass?: string;
    notify_email?: string;
    updated_at?: string;
  };

  const autoSyncEnabled = cfg.auto_sync_enabled !== false;
  const defaultInterval = Number(cfg.default_interval_minutes || 5);
  const autoBackupEnabled = cfg.auto_backup_enabled !== false;
  const backupRetentionDays = Number(cfg.backup_retention_days || 30);
  const smtpHost = cfg.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(cfg.smtp_port || process.env.SMTP_PORT || 587);
  const smtpUser = cfg.smtp_user || process.env.SMTP_USER || 'nampt@cic.com.vn';
  const notifyEmail =
    cfg.notify_email || process.env.ADMIN_NOTIFICATION_EMAIL || 'nampt@cic.com.vn';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-600" />
            Cài Đặt Hệ Thống Trực Tiếp Trên Web
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Thiết lập chu kỳ tự động kéo dữ liệu từ Google Sheets về Database, tài khoản đọc Sheet (Service Account JSON), lịch sao lưu và cấu hình Email ngay trên giao diện Web.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={syncAllSheetSourcesAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Kéo tất cả Sheet về DB ngay
            </button>
          </form>

          <form action={createBackupNowAction}>
            <input type="hidden" name="scope" value="database" />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
            >
              Tạo bản Backup Database ngay
            </button>
          </form>
        </div>
      </div>

      {/* 1. Sync & Backup & SMTP Settings Form */}
      <form
        action={savePlatformSettingsAction}
        className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs"
      >
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900">
            1. Cấu Hình Đồng Bộ Tự Động (Google Sheet &rarr; Database) &amp; Sao Lưu
          </h2>
          {cfg.updated_at && (
            <span className="text-xs text-slate-500">
              Lưu lần cuối: {new Date(cfg.updated_at).toLocaleString('vi-VN')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tự động kéo dữ liệu từ Google Sheets về DB
            </label>
            <select
              name="auto_sync_enabled"
              defaultValue={autoSyncEnabled ? 'true' : 'false'}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value="true">Đang bật (Tự động cập nhật liên tục)</option>
              <option value="false">Tạm dừng (Chỉ kéo khi bấm nút)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chu kỳ quét Google Sheet mặc định (phút)
            </label>
            <select
              name="default_interval_minutes"
              defaultValue={defaultInterval}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value={1}>Mỗi 1 phút</option>
              <option value={5}>Mỗi 5 phút (Khuyên dùng)</option>
              <option value={10}>Mỗi 10 phút</option>
              <option value={15}>Mỗi 15 phút</option>
              <option value={30}>Mỗi 30 phút</option>
              <option value={60}>Mỗi 60 phút</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Áp dụng chu kỳ này cho các Sheet hiện có?
            </label>
            <select
              name="apply_interval_to_all"
              defaultValue="true"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value="true">Có — Áp dụng cho tất cả bảng Sheet</option>
              <option value="false">Không — Giữ nguyên chu kỳ riêng từng bảng</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tự động sao lưu (Backup) Database &amp; dữ liệu Sheet hàng ngày
            </label>
            <select
              name="auto_backup_enabled"
              defaultValue={autoBackupEnabled ? 'true' : 'false'}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value="true">Đang bật (Tự động tạo bản sao lưu mỗi ngày)</option>
              <option value="false">Tắt tự động sao lưu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thời gian giữ các bản sao lưu cũ (số ngày)
            </label>
            <input
              type="number"
              name="backup_retention_days"
              min={1}
              max={365}
              defaultValue={backupRetentionDays}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Email SMTP Settings */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Cấu hình Email gửi/nhận thông báo (SMTP)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Máy chủ SMTP (Host)
              </label>
              <input
                type="text"
                name="smtp_host"
                defaultValue={smtpHost}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cổng SMTP (Port)
              </label>
              <input
                type="number"
                name="smtp_port"
                defaultValue={smtpPort}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tài khoản Email gửi (SMTP User)
              </label>
              <input
                type="text"
                name="smtp_user"
                defaultValue={smtpUser}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu ứng dụng (Để trống nếu giữ nguyên)
              </label>
              <input
                type="password"
                name="smtp_pass"
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email nhận thông báo mặc định (cách nhau dấu phẩy nếu nhiều email)
            </label>
            <input
              type="text"
              name="notify_email"
              defaultValue={notifyEmail}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs cursor-pointer"
          >
            Lưu Toàn Bộ Cấu Hình Hệ Thống
          </button>
        </div>
      </form>

      {/* 2. Google Service Account JSON Configuration right on Web */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            2. Quản Lý Tài Khoản Đọc Google Sheet (Google Service Account JSON)
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Khi thêm một Google Sheet mới, anh chỉ cần bấm nút <strong>Share (Chia sẻ)</strong> trên Google Sheet cho 1 trong các địa chỉ email dưới đây (quyền <strong>Viewer / Người xem</strong>) là hệ thống tự động đọc và đồng bộ về Database.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Các tài khoản Google Service Account đang hoạt động ({creds.length}):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {creds.map((c) => (
              <div
                key={c.clientEmail}
                className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-mono font-bold text-emerald-950">{c.clientEmail}</div>
                  <div className="text-emerald-700 mt-0.5">
                    Project: {c.projectId || 'N/A'} &bull; Nguồn: {c.sourceFile || 'credentials'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                  Đang hoạt động
                </span>
              </div>
            ))}
          </div>
        </div>

        <form action={uploadServiceAccountJsonAction} className="space-y-3 pt-3 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            Thêm / Cập nhật Google Service Account Key mới ngay trên Web (Dán nội dung file `.json` vào đây):
          </label>
          <textarea
            name="service_account_json"
            rows={5}
            placeholder='{"type": "service_account", "project_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\n...", "client_email": "...@...iam.gserviceaccount.com"}'
            className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Lưu &amp; Kích Hoạt Tài Khoản Service Account Này
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
