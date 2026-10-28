'use client';

import React from 'react';
import Link from 'next/link';
import type { SiteSummaryItem } from './SitesDirectoryTab';
import { TrafficChartsSection, type DailyTrafficPoint } from './TrafficChartsSection';

export type { DailyTrafficPoint };

interface TrafficAnalyticsTabProps {
  sites: SiteSummaryItem[];
  scopeLabel: string;
  totalLeads: number;
  totalMedia: number;
  utmBreakdown: Array<{ source: string; count: number }>;
  needBreakdown: Array<{ label: string; siteName: string; count: number }>;
  dailySeries: DailyTrafficPoint[];
}

export function TrafficAnalyticsTab({
  sites,
  scopeLabel,
  totalLeads,
  totalMedia,
  utmBreakdown,
  needBreakdown,
  dailySeries,
}: TrafficAnalyticsTabProps) {
  const totalViews30d = sites.reduce((acc, s) => acc + (s.views30d || 0), 0);
  const totalViews7d = sites.reduce((acc, s) => acc + (s.views7d || 0), 0);
  const totalSections = sites.reduce((acc, s) => acc + s.sectionsCount, 0);

  return (
    <div className="space-y-5">
      {/* 4 Core KPIs */}
      <div className="grid grid-cols-1 divide-y rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-slate-100">
        <div className="p-3">
          <span className="text-[11px] font-bold tracking-wider text-[#0b1b36] uppercase">
            Lượt xem trang (30 ngày)
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#0b1b36] tabular-nums sm:text-3xl">
            {totalViews30d.toLocaleString('vi-VN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            7 ngày gần nhất: <strong className="text-slate-800">{totalViews7d.toLocaleString('vi-VN')} lượt</strong>
          </div>
        </div>

        <div className="p-3">
          <span className="text-[11px] font-bold tracking-wider text-[#ea580c] uppercase">
            Khách hàng đăng ký
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#ea580c] tabular-nums sm:text-3xl">
            {totalLeads.toLocaleString('vi-VN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Tổng số biểu mẫu tư vấn đã nhận</div>
        </div>

        <div className="p-3">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Phạm vi hiển thị
          </span>
          <div className="mt-2 truncate text-xl font-bold tracking-tight text-[#0b1b36] tabular-nums sm:text-2xl">
            {sites.length === 1 ? sites[0].name : `${sites.length} Website`}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {totalSections.toLocaleString('vi-VN')} mục nội dung đã xuất bản
          </div>
        </div>

        <div className="p-3">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Thư viện Media
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#0b1b36] tabular-nums sm:text-3xl">
            {totalMedia.toLocaleString('vi-VN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Hình ảnh và tài liệu lưu trữ</div>
        </div>
      </div>

      {/* Daily Views + Unique Visitors + Leads Interactive Chart & Daily Table */}
      <TrafficChartsSection dailySeries={dailySeries} scopeLabel={scopeLabel} />

      {/* Registration Need Breakdown + Source Breakdown */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0b1b36]">Nhu cầu đăng ký tư vấn</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Phân nhóm theo nội dung khách hàng lựa chọn trên biểu mẫu ({scopeLabel})
              </p>
            </div>
            <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-700">
              {totalLeads} lượt
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {needBreakdown.map((item) => {
              const pct = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
              return (
                <div key={`${item.siteName}-${item.label}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {item.siteName}
                      </span>
                      <span className="font-bold text-slate-800">{item.label}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0b1b36]"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0b1b36]">Nguồn khách hàng</h3>
              <p className="mt-0.5 text-xs text-slate-500">Phân bổ theo kênh tiếp nhận</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {utmBreakdown.map((u) => {
              const pct = totalLeads > 0 ? Math.round((u.count / totalLeads) * 100) : 0;
              return (
                <div key={u.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{u.source}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-600">
                      {u.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#ea580c]"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-Domain Summary & Credentials Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-bold text-[#0b1b36]">
              Bảng chỉ số &amp; Tài khoản Quản trị theo Website
            </h3>
            <span className="whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-800">
              Super Admin: admin / cic@2026
            </span>
          </div>
          <Link
            href="/admin?tab=sites"
            className="whitespace-nowrap text-xs font-bold text-[#ea580c] hover:underline"
          >
            Quản lý tên miền &amp; Đổi mật khẩu
          </Link>
        </div>
        <table className="cms-data-table w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="whitespace-nowrap">Tên miền</th>
              <th className="whitespace-nowrap">Tên website</th>
              <th className="whitespace-nowrap">Tài khoản</th>
              <th className="whitespace-nowrap">Mật khẩu mặc định</th>
              <th className="whitespace-nowrap text-right">Lượt xem (30 ngày)</th>
              <th className="whitespace-nowrap text-right">Mục nội dung</th>
              <th className="whitespace-nowrap text-right">Media</th>
              <th className="whitespace-nowrap text-right">Khách đăng ký</th>
              <th className="whitespace-nowrap text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sites.map((s) => {
              const defaultPwd =
                s.code === 'cms-intellicad'
                  ? 'cad@2026'
                  : s.code === 'robot-cong-trinh'
                  ? 'robot@2026'
                  : 'CicAdmin@2026';
              return (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap font-mono font-bold text-[#0b1b36]">
                    https://{s.domain || `${s.code}.vn`}
                  </td>
                  <td className="font-bold text-slate-900">{s.name}</td>
                  <td className="whitespace-nowrap">
                    <code className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-[#0b1b36]">
                      {s.adminUsername || `${s.code}_admin`}
                    </code>
                  </td>
                  <td className="whitespace-nowrap">
                    <code className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800">
                      {defaultPwd}
                    </code>
                  </td>
                  <td className="whitespace-nowrap text-right font-mono font-bold text-[#0b1b36]">
                    {(s.views30d || 0).toLocaleString('vi-VN')}
                  </td>
                  <td className="whitespace-nowrap text-right font-mono font-bold">{s.sectionsCount}</td>
                  <td className="whitespace-nowrap text-right font-mono font-bold">{s.mediaCount}</td>
                  <td className="whitespace-nowrap text-right font-mono font-bold text-[#ea580c]">{s.leadsCount}</td>
                  <td className="whitespace-nowrap text-right">
                    <Link
                      href={`/admin/${s.code}`}
                      className="inline-block whitespace-nowrap rounded-lg bg-[#ea580c] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#c2410c]"
                    >
                      Quản trị nội dung
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
