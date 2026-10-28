'use client';

import React from 'react';

interface HeaderFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
  onOpenMediaDrawer: (slotKey: string) => void;
}

export function HeaderForm({ payload, onChange, onOpenMediaDrawer }: HeaderFormProps) {
  const update = (key: string, value: any) => onChange({ ...payload, [key]: value });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-700">Logo Website</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            value={payload.logo_url || ''}
            onChange={(e) => update('logo_url', e.target.value)}
            placeholder="/api/landing/media/..."
            className="flex-1 rounded-lg border border-slate-300 p-2 text-xs"
          />
          <button
            type="button"
            onClick={() => onOpenMediaDrawer('logo_url')}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            Chọn ảnh
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Khẩu Hiệu / Tagline</label>
        <textarea
          rows={2}
          value={payload.tagline || payload.subtitle || ''}
          onChange={(e) => update(payload.tagline !== undefined ? 'tagline' : 'subtitle', e.target.value)}
          placeholder="Ví dụ: CÔNG TY CP CÔNG NGHỆ<br>VÀ TƯ VẤN CIC"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
        <span className="text-[10px] text-slate-400">Hỗ trợ thẻ &lt;br&gt; để ngắt dòng</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700">Mục 1: Giới thiệu</label>
          <input
            type="text"
            value={payload.nav_intro || ''}
            onChange={(e) => update('nav_intro', e.target.value)}
            placeholder="Giới thiệu"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">Mục 2: Robot thi công</label>
          <input
            type="text"
            value={payload.nav_robot || ''}
            onChange={(e) => update('nav_robot', e.target.value)}
            placeholder="Robot xây dựng"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700">Mục 3: Robot hạ tầng</label>
          <input
            type="text"
            value={payload.nav_infrastructure || ''}
            onChange={(e) => update('nav_infrastructure', e.target.value)}
            placeholder="Robot Hạ tầng"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">Mục 4: Hỏi đáp</label>
          <input
            type="text"
            value={payload.nav_faq || ''}
            onChange={(e) => update('nav_faq', e.target.value)}
            placeholder="Câu hỏi thường gặp"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Nút Kêu Gọi Hành Động (CTA)</label>
        <input
          type="text"
          value={payload.cta || ''}
          onChange={(e) => update('cta', e.target.value)}
          placeholder="Đăng ký tư vấn"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>
    </div>
  );
}
