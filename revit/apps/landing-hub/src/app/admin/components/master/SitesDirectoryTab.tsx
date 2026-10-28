'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreateSiteModal, SiteInlineConfigForm } from './CreateSiteModal';
import { ExportDeployModal, type ExportDeployResult } from './ExportDeployModal';

export interface SiteSummaryItem {
  id: string;
  code: string;
  name: string;
  domain: string | null;
  status: string;
  locales: string[];
  leadsCount: number;
  mediaCount: number;
  sectionsCount: number;
  views7d?: number;
  views30d?: number;
  trackingConfig: Record<string, any>;
  brandConfig?: Record<string, any>;
  seoMeta?: Record<string, any>;
  adminUsername?: string;
}

const HOSTING_ORIGIN_MAP: Record<string, { label: 'Host Mắt Bão' | 'LadiPage'; badgeClass: string }> = {
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

export function SitesDirectoryTab({ sites }: { sites: SiteSummaryItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [exportModalTarget, setExportModalTarget] = useState<{
    code: string;
    name: string;
  } | null>(null);
  const [exportResult, setExportResult] = useState<ExportDeployResult | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0b1b36]">
              {sites.length === 1
                ? `Thông tin Website & Tên miền: ${sites[0].name}`
                : `Danh sách Website & Tên miền (${sites.length})`}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Quản lý tên miền, mã đo lường, biên tập nội dung và đóng gói thư mục triển khai lên Host
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toast && (
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                {toast}
              </span>
            )}
            {sites.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setExportModalTarget({ code: 'ALL', name: 'Toàn bộ hệ thống Landing Page' })
                  }
                  className="cursor-pointer whitespace-nowrap rounded-lg bg-[#0b1b36] px-3.5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800"
                >
                  Xuất gói Deploy (Tất cả)
                </button>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="cursor-pointer whitespace-nowrap rounded-lg bg-[#ea580c] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#c2410c]"
                >
                  Thêm Website mới
                </button>
              </>
            )}
          </div>
        </div>

        {exportResult && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-950">
            <div>
              <div className="font-bold text-emerald-900">
                Đã xuất thành công gói triển khai: <code className="font-mono">{exportResult.packageName}</code>
              </div>
              <div className="mt-1 text-[11px] text-emerald-800">
                Thư mục: <code className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-[#0b1b36]">{exportResult.outputPath}</code>
                {' '}• Đã đóng gói <strong>{exportResult.sitesCount}</strong> website,{' '}
                <strong>{exportResult.sectionsCount}</strong> mục nội dung,{' '}
                <strong>{exportResult.formsCount}</strong> biểu mẫu,{' '}
                <strong>{exportResult.mediaCount}</strong> tệp media kèm script tự động nạp DB (<code>start.sh</code> / <code>start.bat</code>).
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExportResult(null)}
              className="cursor-pointer rounded border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Đóng
            </button>
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {sites.map((site) => {
          const isEditing = editingId === site.id;
          const domainUrl = site.domain || `${site.code}.vn`;
          const hostMeta = HOSTING_ORIGIN_MAP[site.code] || {
            label: (site.brandConfig?.hosting_origin as string) || 'LadiPage',
            badgeClass: 'border-purple-200 bg-purple-50 text-purple-700',
          };
          const hasOriginInName =
            site.name.includes('Mắt Bão') || site.name.includes('LadiPage');
          return (
            <div
              key={site.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src="/LOGO - 1990-08.png"
                      alt={site.name}
                      className="h-10 w-14 rounded-lg border border-slate-200 bg-slate-50 p-1 object-contain"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                          Đang hoạt động
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${hostMeta.badgeClass}`}
                        >
                          {hostMeta.label}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-[#0b1b36]">
                        {site.name}{' '}
                        {!hasOriginInName && (
                          <span className="text-xs font-semibold text-[#ea580c]">
                            ({hostMeta.label})
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {site.locales.map((loc) => (
                      <span
                        key={loc}
                        className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Nguồn gốc hạ tầng (Host):</span>
                    <span className="font-bold text-[#0b1b36]">{hostMeta.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Tên miền chính:</span>
                    <span className="font-mono font-bold text-[#0b1b36]">https://{domainUrl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Đường dẫn quản trị riêng:</span>
                    <span className="font-mono font-bold text-[#ea580c]">
                      https://{domainUrl}/cms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Tài khoản quản trị riêng:</span>
                    <span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-[#0b1b36]">
                      {site.adminUsername || `${site.code}_admin`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Mật khẩu mặc định:</span>
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                      {site.code === 'cms-intellicad'
                        ? 'cad@2026'
                        : site.code === 'robot-cong-trinh'
                        ? 'robot@2026'
                        : 'CicAdmin@2026'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Mã GA4 / GTM:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {site.trackingConfig?.ga4_id || site.trackingConfig?.gtm_id || 'Chưa cấu hình'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <div className="text-base font-bold text-[#0b1b36] tabular-nums">
                      {site.sectionsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Mục nội dung</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <div className="text-base font-bold text-[#0b1b36] tabular-nums">
                      {site.mediaCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Tệp Media</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <div className="text-base font-bold text-[#ea580c] tabular-nums">
                      {site.leadsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Khách đăng ký</div>
                  </div>
                </div>

                {isEditing && (
                  <SiteInlineConfigForm
                    site={site}
                    onCancel={() => setEditingId(null)}
                    onSaved={(msg) => {
                      setEditingId(null);
                      showToast(msg);
                    }}
                  />
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                <Link
                  href={`/admin/${site.code}`}
                  className="whitespace-nowrap rounded-lg bg-[#ea580c] px-3.5 py-2 text-center text-xs font-semibold text-white shadow-2xs transition hover:bg-[#c2410c]"
                >
                  Quản trị nội dung
                </Link>
                <button
                  type="button"
                  onClick={() => setExportModalTarget({ code: site.code, name: site.name })}
                  className="cursor-pointer whitespace-nowrap rounded-lg bg-[#0b1b36] px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Xuất gói Deploy
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(isEditing ? null : site.id)}
                  className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cấu hình
                </button>
                <a
                  href={sites.length <= 1 ? '/' : `/s/${site.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#0b1b36] hover:bg-slate-50"
                >
                  Xem trang
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <CreateSiteModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={showToast}
      />

      <ExportDeployModal
        isOpen={Boolean(exportModalTarget)}
        targetSiteCode={exportModalTarget?.code || 'ALL'}
        targetSiteName={exportModalTarget?.name || ''}
        onClose={() => setExportModalTarget(null)}
        onExportSuccess={(res) => setExportResult(res)}
      />
    </div>
  );
}
