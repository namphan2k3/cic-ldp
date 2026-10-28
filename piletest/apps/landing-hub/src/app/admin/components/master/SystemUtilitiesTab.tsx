'use client';

import React from 'react';
import Link from 'next/link';
import type { SiteSummaryItem } from './SitesDirectoryTab';

export interface GlobalRevisionItem {
  id: string;
  siteCode: string;
  siteName: string;
  revisionNumber: number;
  summary: string | null;
  createdBy: string;
  createdAt: string;
}

interface SystemUtilitiesTabProps {
  sites: SiteSummaryItem[];
  revisions: GlobalRevisionItem[];
}

export function SystemUtilitiesTab({ sites, revisions }: SystemUtilitiesTabProps) {
  return (
    <div className="space-y-5">
      {/* 1. Factual Technical & SEO Configuration Table per Website (No arbitrary 98/100 score, No UTM Builder) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h2 className="text-base font-bold text-[#0b1b36]">
          Thông số Cấu hình Kỹ thuật &amp; Đo lường Website
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Chi tiết tên miền, mã theo dõi Google Analytics 4, Google Tag Manager, Facebook Pixel và
          quy mô nội dung của từng trang
        </p>

        <div className="mt-4 space-y-3">
          {sites.map((s) => {
            const ga4 = s.trackingConfig?.ga4_id || 'Chưa cấu hình';
            const gtm = s.trackingConfig?.gtm_id || 'Chưa cấu hình';
            const pixel = s.trackingConfig?.fb_pixel_id || 'Không sử dụng';
            return (
              <div
                key={s.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0b1b36]">{s.name}</span>
                    <span className="font-mono font-bold text-[#ea580c]">
                      (https://{s.domain || `${s.code}.vn`})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/${s.code}?tab=edit`}
                      className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Chỉnh sửa SEO &amp; Nội dung
                    </Link>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <div className="text-slate-500">Mã GA4</div>
                    <div className="mt-0.5 font-mono font-bold text-[#0b1b36]">{ga4}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Mã GTM</div>
                    <div className="mt-0.5 font-mono font-bold text-[#0b1b36]">{gtm}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Facebook Pixel</div>
                    <div className="mt-0.5 font-mono font-bold text-slate-700">{pixel}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Mục nội dung</div>
                    <div className="mt-0.5 font-bold text-emerald-700">{s.sectionsCount} mục</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Thư viện ảnh</div>
                    <div className="mt-0.5 font-bold text-emerald-700">{s.mediaCount} tệp</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Ngôn ngữ</div>
                    <div className="mt-0.5 font-bold text-slate-800 uppercase">
                      {s.locales.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Global Revision & Audit Log */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="border-b border-slate-200 px-5 py-3.5">
          <h3 className="text-sm font-bold text-[#0b1b36]">
            Nhật ký Xuất bản &amp; Lịch sử Phiên bản ({revisions.length})
          </h3>
        </div>
        <table className="cms-data-table w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th>Thời gian xuất bản</th>
              <th>Website</th>
              <th>Phiên bản</th>
              <th>Nội dung cập nhật</th>
              <th>Người thực hiện</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {revisions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Chưa có bản ghi lịch sử xuất bản nào.
                </td>
              </tr>
            ) : (
              revisions.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap font-mono text-[11px] text-slate-600">
                    {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="font-bold text-[#0b1b36]">{r.siteName}</td>
                  <td>
                    <span className="rounded border border-orange-200 bg-[#fff7ed] px-2 py-0.5 font-mono font-bold text-[#ea580c]">
                      v{r.revisionNumber}
                    </span>
                  </td>
                  <td className="text-slate-700">
                    {r.summary || 'Xuất bản nội dung lên website'}
                  </td>
                  <td className="font-medium text-slate-600">{r.createdBy}</td>
                  <td className="whitespace-nowrap text-right">
                    <Link
                      href={`/admin/${r.siteCode}?tab=revisions`}
                      className="whitespace-nowrap font-bold text-[#ea580c] hover:underline"
                    >
                      Xem &amp; Khôi phục
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
