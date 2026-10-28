'use client';

import React, { useState } from 'react';
import { createLandingSiteAction, updateSiteConfigAction } from '../../actions';
import type { SiteSummaryItem } from './SitesDirectoryTab';

export function SiteInlineConfigForm({
  site,
  onCancel,
  onSaved,
}: {
  site: SiteSummaryItem;
  onCancel: () => void;
  onSaved: (msg: string) => void;
}) {
  return (
    <form
      action={async (fd) => {
        await updateSiteConfigAction(site.id, {
          primary_domain: String(fd.get('primary_domain') || ''),
          site_status: String(fd.get('site_status') || 'active') as any,
          hotline: String(fd.get('hotline') || ''),
          ga4_id: String(fd.get('ga4_id') || ''),
          gtm_id: String(fd.get('gtm_id') || ''),
          fb_pixel_id: String(fd.get('fb_pixel_id') || ''),
          seo_title: String(fd.get('seo_title') || ''),
          seo_description: String(fd.get('seo_description') || ''),
          seo_keywords: String(fd.get('seo_keywords') || ''),
          admin_username: String(fd.get('admin_username') || ''),
          admin_password: String(fd.get('admin_password') || ''),
        });
        onSaved(`Đã lưu cấu hình SEO, tên miền & tài khoản quản trị cho ${site.name}`);
      }}
      className="mt-4 space-y-3 rounded-lg border border-orange-200 bg-[#fff7ed]/60 p-3.5 text-xs"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block font-bold text-slate-700">
          Tên miền chính (Primary Domain)
          <input
            type="text"
            name="primary_domain"
            defaultValue={site.domain || ''}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono"
          />
        </label>
        <label className="block font-bold text-slate-700">
          Trạng thái vận hành
          <select
            name="site_status"
            defaultValue={site.status}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
          >
            <option value="active">Đang hoạt động (Active)</option>
            <option value="maintenance">Bảo trì (Maintenance)</option>
            <option value="archived">Lưu trữ (Archived)</option>
          </select>
        </label>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5">
        <div className="font-bold text-[#0b1b36]">Cấu hình Chuẩn SEO (Meta Title &amp; Description)</div>
        <label className="block font-semibold text-slate-700">
          Tiêu đề trang (Meta Title)
          <input
            type="text"
            name="seo_title"
            defaultValue={site.seoMeta?.title || `${site.name} — Giải pháp chính hãng CIC`}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
          />
        </label>
        <label className="block font-semibold text-slate-700">
          Mô tả tìm kiếm Google (Meta Description)
          <textarea
            name="seo_description"
            rows={2}
            defaultValue={site.seoMeta?.description || ''}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
          />
        </label>
        <label className="block font-semibold text-slate-700">
          Từ khóa SEO (Keywords, cách nhau dấu phẩy)
          <input
            type="text"
            name="seo_keywords"
            defaultValue={site.seoMeta?.keywords || ''}
            placeholder="vd: cms intellicad, phần mềm cad bản quyền, cic vietnam"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
        <label className="block font-bold text-[#0b1b36]">
          Tài khoản Admin riêng của trang
          <input
            type="text"
            name="admin_username"
            defaultValue={site.adminUsername || `${site.code}_admin`}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono"
          />
        </label>
        <label className="block font-bold text-[#0b1b36]">
          Đổi mật khẩu mới (để trống nếu giữ nguyên)
          <input
            type="password"
            name="admin_password"
            placeholder="Nhập mật khẩu mới..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="block font-bold text-slate-700">
          Google Analytics 4
          <input
            type="text"
            name="ga4_id"
            defaultValue={site.trackingConfig?.ga4_id || ''}
            placeholder="G-XXXXXXXX"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono"
          />
        </label>
        <label className="block font-bold text-slate-700">
          Google Tag Manager
          <input
            type="text"
            name="gtm_id"
            defaultValue={site.trackingConfig?.gtm_id || ''}
            placeholder="GTM-XXXXXX"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono"
          />
        </label>
        <label className="block font-bold text-slate-700">
          Facebook Pixel ID
          <input
            type="text"
            name="fb_pixel_id"
            defaultValue={site.trackingConfig?.fb_pixel_id || ''}
            placeholder="FB Pixel ID"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono"
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-600"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-[#ea580c] px-3.5 py-1.5 font-bold text-white hover:bg-[#c2410c]"
        >
          Lưu cấu hình
        </button>
      </div>
    </form>
  );
}

export function CreateSiteModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [hotline, setHotline] = useState('0988 026 858');
  const [ga4Id, setGa4Id] = useState('');
  const [gtmId, setGtmId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await createLandingSiteAction({
      code,
      name,
      primary_domain: domain,
      hotline,
      ga4_id: ga4Id,
      gtm_id: gtmId,
    });
    setSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Không thể khởi tạo trang mới.');
      return;
    }
    onSuccess(`Đã khởi tạo tên miền độc lập "${name}" (${res.siteCode}) trong PostgreSQL!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0b1b36]">
              Khởi Tạo Tên Miền & Landing Page Độc Lập Mới
            </h3>
            <p className="text-xs text-slate-500">
              Tự động phân vùng dữ liệu mới trong PostgreSQL <code>cic_landing</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block font-bold text-slate-700">
              Mã định danh (Site Code) *
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="vd: idea-statica"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
              />
            </label>
            <label className="block font-bold text-slate-700">
              Tên miền chính (Primary Domain) *
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="vd: ideastatica.cic.com.vn"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
              />
            </label>
          </div>
          <label className="block font-bold text-slate-700">
            Tên hiển thị dự án / sản phẩm *
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vd: IDEA StatiCa Vietnam — Kết cấu Thép & Bê tông"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-900"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block font-bold text-slate-700">
              Hotline tư vấn
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </label>
            <label className="block font-bold text-slate-700">
              Mã GA4
              <input
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                placeholder="G-XXXXXXXX"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </label>
            <label className="block font-bold text-slate-700">
              Mã GTM
              <input
                type="text"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXX"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-lg bg-[#ea580c] px-4 py-2 font-semibold text-white shadow-xs hover:bg-[#c2410c] disabled:opacity-50"
            >
              {submitting ? 'Đang khởi tạo DB...' : 'Khởi tạo vào PostgreSQL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
