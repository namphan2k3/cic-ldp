'use client';

import React from 'react';

interface CmsSeoGoogleCardProps {
  publicUrl: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  onChangeSeo: (title: string, description: string) => void;
}

export function CmsSeoGoogleCard({
  publicUrl,
  locale,
  seoTitle,
  seoDescription,
  onChangeSeo,
}: CmsSeoGoogleCardProps) {
  return (
    <section className="mb-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black tracking-wider text-blue-700 uppercase">
            SEO Google
          </div>
          <h2 className="mt-1 text-lg font-black text-slate-950">
            Tiêu đề và mô tả tìm kiếm
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Phần này không hiển thị trực tiếp trong header, nhưng được dùng cho tiêu đề tab trình duyệt, Google Search và chia sẻ mạng xã hội (Zalo/Facebook).
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-black text-slate-500 uppercase">
          {locale}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.85fr)]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
              <span>Tiêu đề SEO (Meta Title)</span>
              <span className="font-medium text-slate-400">
                {seoTitle.length}/60 ký tự khuyến nghị
              </span>
            </span>
            <input
              type="text"
              value={seoTitle}
              maxLength={200}
              onChange={(e) => onChangeSeo(e.target.value, seoDescription)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
              <span>Mô tả SEO (Meta Description)</span>
              <span className="font-medium text-slate-400">
                {seoDescription.length}/160 ký tự khuyến nghị
              </span>
            </span>
            <textarea
              rows={3}
              value={seoDescription}
              maxLength={500}
              onChange={(e) => onChangeSeo(seoTitle, e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-relaxed focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        {/* Live Google Search Result Preview */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">
            Xem trước kết quả tìm kiếm Google
          </div>
          <div className="text-xs font-medium text-emerald-700">
            {publicUrl}
          </div>
          <div className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-blue-800">
            {seoTitle || 'Chưa có tiêu đề SEO'}
          </div>
          <div className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
            {seoDescription || 'Chưa có mô tả SEO cho trang này...'}
          </div>
        </div>
      </div>
    </section>
  );
}
