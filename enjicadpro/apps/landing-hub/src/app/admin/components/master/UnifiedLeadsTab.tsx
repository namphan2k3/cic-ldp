'use client';

import React, { useState } from 'react';
import { syncGoogleSheetsLeadsAction } from '../../actions';
import { buildLeadsExcelXml } from '@/lib/excelExporter';

export interface UnifiedLeadItem {
  id: string;
  siteCode: string;
  siteName: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  companyName: string | null;
  jobTitle: string | null;
  leadPayload: Record<string, any>;
  utmJson: Record<string, any>;
  leadStatus: string;
  googleSheetSyncStatus: string;
  submittedAt: string;
}

export function UnifiedLeadsTab({
  leads,
  sites,
}: {
  leads: UnifiedLeadItem[];
  sites: { code: string; name: string }[];
}) {
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const filtered = leads.filter((l) => {
    if (siteFilter !== 'ALL' && l.siteCode !== siteFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (l.fullName && l.fullName.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.companyName && l.companyName.toLowerCase().includes(q))
    );
  });

  const handlePullFromSheets = async () => {
    setSyncing(true);
    setSyncMsg('Đang đồng bộ dữ liệu từ Google Sheets...');
    const targetCode = siteFilter === 'ALL' ? undefined : siteFilter;
    const res = await syncGoogleSheetsLeadsAction(targetCode);
    setSyncing(false);
    setSyncMsg(
      `Đã đồng bộ ${res.totalRead} bản ghi (+${res.inserted} mới, cập nhật ${res.updated}).`
    );
    setTimeout(() => setSyncMsg(null), 5000);
  };

  const handleExportExcel = async () => {
    const scopeName =
      siteFilter === 'ALL'
        ? 'Tất cả Website'
        : sites.find((s) => s.code === siteFilter)?.name || siteFilter;
    const xmlContent = buildLeadsExcelXml(filtered, scopeName);
    const defaultFileName = `Bao-cao-khach-hang-${siteFilter.toLowerCase()}-${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    const win = window as unknown as {
      showSaveFilePicker?: (opts: unknown) => Promise<{
        createWritable: () => Promise<{
          write: (data: Blob) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    };

    const blob = new Blob(['\uFEFF' + xmlContent], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });

    if (typeof win.showSaveFilePicker === 'function') {
      try {
        const handle = await win.showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [
            {
              description: 'Microsoft Excel Workbook (.xls)',
              accept: { 'application/vnd.ms-excel': ['.xls'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#0b1b36]">
            Danh sách Khách hàng Đăng ký ({filtered.length})
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Ghi nhận trực tiếp từ máy chủ khi khách gửi biểu mẫu; hỗ trợ nhập dữ liệu lịch sử ban đầu từ Google Sheets
          </p>
          {syncMsg && (
            <div className="mt-2 inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              {syncMsg}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sites.length > 1 && (
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="ALL">Tất cả website ({leads.length})</option>
              {sites.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm họ tên, SĐT, email, đơn vị..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800"
          />

          <button
            type="button"
            disabled={syncing}
            onClick={handlePullFromSheets}
            className="cursor-pointer rounded-lg bg-[#0b1b36] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
          >
            {syncing ? 'Đang nhập dữ liệu...' : 'Nhập lịch sử Google Sheets'}
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="cursor-pointer rounded-lg bg-[#ea580c] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#c2410c]"
          >
            Xuất báo cáo Excel (.xls)
          </button>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="cms-data-table w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th>Thời gian</th>
              <th>Website</th>
              <th>Khách hàng</th>
              <th>Liên hệ</th>
              <th>Đơn vị</th>
              <th>Nhu cầu đăng ký</th>
              <th>Trạng thái chăm sóc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap font-mono text-[11px] text-slate-600">
                  {new Date(l.submittedAt).toLocaleString('vi-VN')}
                </td>
                <td>
                  <span className="rounded-full border border-orange-200 bg-[#fff7ed] px-2.5 py-0.5 text-[11px] font-bold text-[#c2410c]">
                    {l.siteName}
                  </span>
                </td>
                <td className="font-bold text-[#0b1b36]">{l.fullName || '—'}</td>
                <td>
                  <div className="font-mono font-bold text-[#ea580c]">{l.phone || '—'}</div>
                  <div className="text-[11px] text-slate-500">{l.email || ''}</div>
                </td>
                <td className="font-semibold text-slate-800">{l.companyName || '—'}</td>
                <td className="max-w-xs text-[11px] text-slate-600">
                  {l.leadPayload?.primary_need && (
                    <div>
                      <strong className="text-slate-900">Nhu cầu:</strong>{' '}
                      {String(l.leadPayload.primary_need)}
                    </div>
                  )}
                  {l.leadPayload?.product_version && (
                    <div>
                      <strong className="text-slate-900">Phiên bản:</strong>{' '}
                      {String(l.leadPayload.product_version)} ({l.leadPayload.device_quantity || 1}{' '}
                      máy)
                    </div>
                  )}
                  {l.leadPayload?.requirements && (
                    <div
                      className="truncate text-slate-500"
                      title={String(l.leadPayload.requirements)}
                    >
                      {String(l.leadPayload.requirements)}
                    </div>
                  )}
                </td>
                <td className="max-w-xs text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
                      {l.leadPayload?.care_status || 'Mới tiếp nhận'}
                    </span>
                    {l.leadPayload?.pic && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-[#0b1b36]">
                        {l.leadPayload.pic}
                      </span>
                    )}
                  </div>
                  {l.leadPayload?.care_note && (
                    <div className="mt-1 text-slate-500">{String(l.leadPayload.care_note)}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
