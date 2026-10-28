'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutAdminAction } from '../../actions';
import { ExportDeployModal } from '../master/ExportDeployModal';

interface SiteOption {
  code: string;
  name: string;
}

interface SiteCmsHeaderProps {
  siteCode: string;
  siteName: string;
  logoUrl: string;
  locale: string;
  activeTab: string;
  allSites: SiteOption[];
}

const SITE_HOSTING_ORIGIN: Record<string, { label: 'Host Mắt Bão' | 'LadiPage'; badgeClass: string }> = {
  'cms-intellicad': { label: 'Host Mắt Bão', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' },
  'robot-cong-trinh': { label: 'Host Mắt Bão', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' },
  allplan: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  bim: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  enjicad: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  escon: { label: 'Host Mắt Bão', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' },
  revit: { label: 'Host Mắt Bão', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' },
  autocad: { label: 'Host Mắt Bão', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' },
  cubicost: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  enjicadpro: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  piletest: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  foxit: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  maydocapngam: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
  cabinetvision: { label: 'LadiPage', badgeClass: 'border-orange-200 bg-orange-50 text-[#ea580c]' },
};

export function SiteCmsHeader({
  siteCode,
  siteName,
  logoUrl,
  locale,
  activeTab,
  allSites,
}: SiteCmsHeaderProps) {
  const router = useRouter();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan & Lưu lượng', href: `/admin?tab=dashboard&site=${siteCode}` },
    { id: 'leads', label: 'Khách hàng đăng ký', href: `/admin?tab=leads&site=${siteCode}` },
    { id: 'edit', label: 'Chỉnh sửa Giao diện', href: `/admin/${siteCode}?lang=${locale}&tab=edit` },
    { id: 'media', label: 'Thư viện Media', href: `/admin/${siteCode}?lang=${locale}&tab=media` },
    { id: 'forms', label: 'Cấu hình Form & Sheets', href: `/admin/${siteCode}?lang=${locale}&tab=forms` },
    { id: 'revisions', label: 'Lịch sử Phiên bản', href: `/admin/${siteCode}?lang=${locale}&tab=revisions` },
    { id: 'guide', label: 'Hướng dẫn Vận hành', href: `/admin/${siteCode}?lang=${locale}&tab=guide` },
  ];

  const adminTitle =
    siteCode === 'robot-cong-trinh'
      ? 'CMS CIC Robot Admin'
      : siteCode === 'cms-intellicad'
      ? 'CMS IntelliCAD Admin'
      : `CMS ${siteName}`;

  const hostOrigin = SITE_HOSTING_ORIGIN[siteCode] || {
    label: 'LadiPage',
    badgeClass: 'border-purple-200 bg-purple-50 text-purple-700',
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-2xs backdrop-blur-md">
      <div className="mx-auto flex max-w-[1900px] flex-wrap items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        {/* Left: Back to Master Hub + Site Brand Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1b36] transition hover:bg-slate-50"
            title="Xem Thống kê Lượt xem & Danh sách Khách hàng đăng ký"
          >
            {allSites.length <= 1 ? 'Thống kê & Khách hàng' : 'Quản trị Tổng'}
          </Link>

          <Link
            href={`/admin/${siteCode}?lang=${locale}&tab=edit`}
            className="flex items-center gap-3"
          >
            <img
              src={logoUrl}
              alt={siteName}
              className="h-9 w-auto max-w-[92px] shrink-0 object-contain"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#0b1b36]">{adminTitle}</span>
                <span className="whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  CMS Độc lập
                </span>
                <span
                  className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-bold ${hostOrigin.badgeClass}`}
                >
                  {hostOrigin.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Mã định danh: <code className="font-mono font-semibold text-slate-700">{siteCode}</code> • Nguồn gốc: <strong>{hostOrigin.label}</strong>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: CMS Navigation Tabs */}
        <nav
          className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1"
          aria-label="Chức năng quản trị trang"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#ea580c] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-white hover:text-[#ea580c]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Scalable Quick Site Switcher & View Live Website */}
        <div className="flex items-center gap-2">
          {allSites.length > 1 && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <label
                htmlFor="cms-quick-site-select"
                className="whitespace-nowrap text-[11px] font-bold text-slate-500 uppercase"
              >
                Chuyển trang ({allSites.length}):
              </label>
              <select
                id="cms-quick-site-select"
                value={siteCode}
                onChange={(e) => router.push(`/admin/${e.target.value}?tab=${activeTab}`)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
              >
                {allSites.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#0b1b36] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Xuất gói Deploy
          </button>

          <a
            href={
              allSites.length <= 1
                ? locale !== 'vi'
                  ? `/?lang=${locale}`
                  : '/'
                : `/s/${siteCode}${locale !== 'vi' ? `?lang=${locale}` : ''}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Xem Website
          </a>

          <button
            type="button"
            onClick={async () => {
              await logoutAdminAction();
              router.push('/admin/login');
              router.refresh();
            }}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </div>
      {exportNotice && (
        <div className="border-t border-emerald-200 bg-emerald-50 px-6 py-1.5 text-center text-xs font-bold text-emerald-900">
          {exportNotice}
        </div>
      )}
      <ExportDeployModal
        isOpen={exportModalOpen}
        targetSiteCode={siteCode}
        targetSiteName={siteName}
        onClose={() => setExportModalOpen(false)}
        onExportSuccess={(res) => {
          setExportNotice(`Đã xuất thành công gói triển khai tại: ${res.outputPath}`);
          setTimeout(() => setExportNotice(null), 8000);
        }}
      />
    </header>
  );
}
