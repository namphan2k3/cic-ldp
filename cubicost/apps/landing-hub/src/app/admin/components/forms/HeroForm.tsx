'use client';

import React from 'react';

interface HeroFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
  onOpenMediaDrawer: (slotKey: string) => void;
}

export function HeroForm({ payload, onChange, onOpenMediaDrawer }: HeroFormProps) {
  const update = (key: string, value: any) => onChange({ ...payload, [key]: value });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-700">Thẻ Phụ (Eyebrow)</label>
        <input
          type="text"
          value={payload.eyebrow || payload.badge || ''}
          onChange={(e) => update(payload.eyebrow !== undefined ? 'eyebrow' : 'badge', e.target.value)}
          placeholder="CIC · GIẢI PHÁP ROBOT CÔNG TRÌNH"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Tiêu Đề Lớn (Hero Title)</label>
        <textarea
          rows={2}
          value={payload.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Công nghệ tiên tiến.<br>Thi công <em>thông minh.</em>"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
        <span className="text-[10px] text-slate-400">Dùng &lt;em&gt;chữ cam&lt;/em&gt; và &lt;br&gt; để xuống hàng</span>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Đoạn Văn Giới Thiệu (Description)</label>
        <textarea
          rows={3}
          value={payload.description || payload.description_1 || ''}
          onChange={(e) => update(payload.description !== undefined ? 'description' : 'description_1', e.target.value)}
          placeholder="Mô tả tóm tắt điểm nổi bật..."
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700">Nút Chính (Primary CTA)</label>
          <input
            type="text"
            value={payload.primary_cta || ''}
            onChange={(e) => update('primary_cta', e.target.value)}
            placeholder="Khám phá robot"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">Nút Phụ (Secondary CTA)</label>
          <input
            type="text"
            value={payload.secondary_cta || ''}
            onChange={(e) => update('secondary_cta', e.target.value)}
            placeholder="Tư vấn cho công trình"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Dòng Ghi Chú Đáy Hero (Strapline)</label>
        <input
          type="text"
          value={payload.strapline || ''}
          onChange={(e) => update('strapline', e.target.value)}
          placeholder="XÂY DỰNG · ĐO LƯỜNG · HẠ TẦNG"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Ảnh Nền Hero (Background / Mockup)</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            value={payload.visual_url_1 || payload.hero_visual_url || ''}
            onChange={(e) => update(payload.visual_url_1 ? 'visual_url_1' : 'hero_visual_url', e.target.value)}
            placeholder="/api/landing/media/..."
            className="flex-1 rounded-lg border border-slate-300 p-2 text-xs"
          />
          <button
            type="button"
            onClick={() => onOpenMediaDrawer(payload.visual_url_1 ? 'visual_url_1' : 'hero_visual_url')}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            Chọn ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
