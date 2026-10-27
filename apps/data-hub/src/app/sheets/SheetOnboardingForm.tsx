'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Copy, Loader2, PlusCircle, Search } from 'lucide-react';
import type { CicSiteRow } from '@cic/db';
import { createSheetSourceAction, inspectSheetUrlAction } from '../actions';

interface Props {
  sites: Array<Pick<CicSiteRow, 'id' | 'code' | 'name'>>;
  serviceAccountEmails: string[];
}

export function SheetOnboardingForm({ sites, serviceAccountEmails }: Props) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [headerRow, setHeaderRow] = useState(1);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [inspectResult, setInspectResult] = useState<Awaited<
    ReturnType<typeof inspectSheetUrlAction>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleInspect = () => {
    if (!spreadsheetUrl.trim()) {
      setError('Vui lòng dán đường dẫn (URL) của Google Sheet.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await inspectSheetUrlAction({
          spreadsheetUrl,
          sheetName: sheetName.trim() || undefined,
          headerRow,
        });
        setInspectResult(res);
        setSheetName(res.activeTab);
        if (!name) {
          setName(`${res.spreadsheetTitle} — ${res.activeTab}`);
        }
        if (!code) {
          const autoCode = `${res.spreadsheetTitle}_${res.activeTab}`
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 48);
          setCode(autoCode || 'sheet_moi');
        }
      } catch (err: any) {
        setError(
          err?.message ||
            'Không thể đọc Google Sheet. Hãy kiểm tra lại đã bấm Chia sẻ (Share) quyền Xem cho email bên dưới chưa.'
        );
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Thêm Bảng Google Sheet Mới Để Tự Động Kéo Về Database
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Mỗi Google Sheet có thể có các cột hoàn toàn khác nhau — hệ thống sẽ tự động đọc dòng tiêu đề và lưu đầy đủ các trường vào Database.
          </p>
        </div>

        <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5 text-xs space-y-1">
          <div className="font-semibold text-blue-900">
            Email dùng để Chia sẻ (Share quyền Xem) trên Google Sheet:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {serviceAccountEmails.map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => handleCopyEmail(email)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-200 font-mono text-[11px] text-blue-900 hover:bg-blue-100 cursor-pointer"
                title="Bấm để sao chép email"
              >
                <span>{email}</span>
                <Copy className="w-3 h-3 text-blue-600" />
                {copiedEmail === email && (
                  <span className="text-emerald-600 font-sans font-bold">Đã copy!</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Paste URL & Inspect */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            1. Dán Link (URL) Google Sheet vào đây
          </label>
          <input
            type="text"
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/189b2.../edit"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Dòng tiêu đề cột
          </label>
          <select
            value={headerRow}
            onChange={(e) => setHeaderRow(Number(e.target.value) || 1)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
          >
            <option value={1}>Dòng 1 (Tự nhận diện)</option>
            <option value={2}>Dòng 2 (Có dòng tiêu đề gộp ở trên)</option>
            <option value={3}>Dòng 3</option>
          </select>
        </div>

        <div className="md:col-span-4">
          <button
            type="button"
            onClick={handleInspect}
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Kiểm tra kết nối &amp; Đọc danh sách cột
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Step 2: Save & Sync */}
      {inspectResult && (
        <form
          action={createSheetSourceAction}
          className="space-y-4 pt-4 border-t border-slate-200 bg-slate-50/70 p-4 rounded-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-lg">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Kết nối thành công tới file: <strong>{inspectResult.spreadsheetTitle}</strong> ({inspectResult.inferredSchema.length} cột)
              </span>
            </div>
          </div>

          <input type="hidden" name="spreadsheet_id" value={inspectResult.spreadsheetId} />
          <input type="hidden" name="header_row" value={headerRow} />
          <input type="hidden" name="code" value={code} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên bảng hiển thị trên Web
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn Tab (Sheet) cần lấy dữ liệu
              </label>
              <select
                name="sheet_name"
                value={sheetName}
                onChange={(e) => {
                  setSheetName(e.target.value);
                  startTransition(async () => {
                    const res = await inspectSheetUrlAction({
                      spreadsheetUrl,
                      sheetName: e.target.value,
                      headerRow,
                    });
                    setInspectResult(res);
                  });
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                {inspectResult.tabs.map((t) => (
                  <option key={t.title} value={t.title}>
                    {t.title} ({t.rowCount} dòng)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gắn với Trang Web (tùy chọn)
              </label>
              <select
                name="site_id"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- Dùng chung / Không cố định --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tự động kéo về DB mỗi
              </label>
              <select
                name="interval_minutes"
                defaultValue={5}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value={1}>Mỗi 1 phút</option>
                <option value={5}>Mỗi 5 phút (Khuyên dùng)</option>
                <option value={15}>Mỗi 15 phút</option>
                <option value={30}>Mỗi 30 phút</option>
                <option value={60}>Mỗi 60 phút</option>
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1.5">
              Các cột phát hiện được trên Sheet ({inspectResult.inferredSchema.length} cột):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inspectResult.inferredSchema.map((col) => (
                <span
                  key={col.key}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-800"
                >
                  {col.header}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs cursor-pointer"
            >
              Lưu &amp; Kéo Dữ Liệu Về Database Ngay
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
