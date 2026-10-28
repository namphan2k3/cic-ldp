'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutAdminAction } from '../../actions';

export interface HeaderSiteOption {
  code: string;
  name: string;
  domain: string | null;
  status: string;
}

interface MasterHeaderProps {
  activeTab: string;
  selectedSite: string;
  sites: HeaderSiteOption[];
  totalLeadsCount: number;
  totalFormsCount: number;
  totalRevisionsCount: number;
  currentUser?: {
    username: string;
    displayName: string;
    role: string;
  };
}

export function MasterHeader({
  activeTab,
  selectedSite,
  sites,
  totalLeadsCount,
  totalFormsCount,
  totalRevisionsCount,
  currentUser,
}: MasterHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
    router.refresh();
  };

  const isSingleSiteMode = sites.length === 1;
  const singleSite = isSingleSiteMode ? sites[0] : null;

  const targetCmsCode = selectedSite === 'ALL' ? sites[0]?.code || 'cms-intellicad' : selectedSite;

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan & Lưu lượng', count: undefined, href: `/admin?tab=dashboard&site=${selectedSite}` },
    { id: 'leads', label: 'Khách hàng đăng ký', count: totalLeadsCount, href: `/admin?tab=leads&site=${selectedSite}` },
    { id: 'visual-builder', label: 'Chỉnh sửa Giao diện', count: undefined, href: `/admin/${targetCmsCode}?tab=edit` },
    { id: 'media-library', label: 'Thư viện Media', count: undefined, href: `/admin/${targetCmsCode}?tab=media` },
    {
      id: 'sites',
      label: isSingleSiteMode ? 'Thông tin & Tên miền' : 'Danh sách Website',
      count: isSingleSiteMode ? undefined : sites.length,
      href: `/admin?tab=sites&site=${selectedSite}`,
    },
    { id: 'forms', label: 'Biểu mẫu & Google Sheets', count: totalFormsCount, href: `/admin?tab=forms&site=${selectedSite}` },
    { id: 'utilities', label: 'Cấu hình SEO & Lịch sử', count: totalRevisionsCount, href: `/admin?tab=utilities&site=${selectedSite}` },
  ];

  const handleSiteChange = (newSiteCode: string) => {
    router.push(`/admin?tab=${activeTab}&site=${newSiteCode}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-2xs backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3.5">
          <Link href={`/admin?tab=dashboard&site=${selectedSite}`} className="flex items-center gap-3">
            <img
              src="/LOGO - 1990-08.png"
              alt="CIC Logo"
              className="h-9 w-auto shrink-0 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#0b1b36]">
                {singleSite
                  ? `QUẢN TRỊ WEBSITE: ${singleSite.name.toUpperCase()}`
                  : 'HỆ THỐNG QUẢN TRỊ LANDING PAGE CIC'}
              </span>
              <span className="text-[11px] text-slate-500">
                Quản lý nội dung website, lưu lượng truy cập và dữ liệu khách hàng
              </span>
            </div>
          </Link>
        </div>

        {/* Global Website Scope Selector */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 p-1.5">
          {!isSingleSiteMode ? (
            <>
              <label
                htmlFor="master-header-site-switcher"
                className="whitespace-nowrap pl-2 text-[11px] font-bold text-slate-600 uppercase"
              >
                Phạm vi:
              </label>

              <select
                id="master-header-site-switcher"
                value={selectedSite}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="min-w-[240px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-[#0b1b36] shadow-2xs"
              >
                <option value="ALL">Tất cả website ({sites.length} trang)</option>
                {sites.map((site) => (
                  <option key={site.code} value={site.code}>
                    {site.name} ({site.domain || `${site.code}.vn`})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <span className="whitespace-nowrap px-2.5 py-1 text-xs font-bold text-[#0b1b36]">
              {singleSite?.domain || `${singleSite?.code}.vn`}
            </span>
          )}

          <Link
            href={`/admin/${targetCmsCode}`}
            className="whitespace-nowrap rounded-lg border border-[#ea580c] bg-[#ea580c] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:border-[#c2410c] hover:bg-[#c2410c]"
          >
            Chỉnh sửa Giao diện
          </Link>

          <a
            href={isSingleSiteMode ? '/' : `/s/${targetCmsCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Xem trang
          </a>

          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              title={`Đang đăng nhập: ${currentUser.displayName} (${currentUser.username})`}
              className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
            >
              Đăng xuất ({currentUser.username})
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200/80 bg-white">
        <div
          role="tablist"
          aria-label="Phân hệ quản trị"
          className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto px-4 sm:px-6"
        >
          {tabs.map((item) => {
            const active = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                role="tab"
                aria-selected={active}
                className={`inline-flex min-h-10 shrink-0 whitespace-nowrap items-center gap-2 rounded-t-lg border-b-2 px-3.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? 'border-[#ea580c] bg-[#fff7ed] text-[#c2410c]'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.count === 'number' && (
                  <span
                    className={`min-w-5 rounded-md px-1.5 py-0.5 text-center font-mono text-[11px] leading-4 font-bold ${
                      active ? 'bg-[#ea580c] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
