'use client';

import React from 'react';

interface FooterFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
  onOpenMediaDrawer: (slotKey: string) => void;
}

export function FooterForm({ payload, onChange, onOpenMediaDrawer }: FooterFormProps) {
  const update = (key: string, value: any) => onChange({ ...payload, [key]: value });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-700">Tên Doanh Nghiệp</label>
        <input
          type="text"
          value={payload.company || ''}
          onChange={(e) => update('company', e.target.value)}
          placeholder="Công ty Cổ phần Công nghệ và Tư vấn CIC"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Địa Chỉ Trụ Sở</label>
        <textarea
          rows={2}
          value={payload.address || ''}
          onChange={(e) => update('address', e.target.value)}
          placeholder="Số 37 Lê Thanh Nghị, Hai Bà Trưng, Hà Nội"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700">Hotline</label>
          <input
            type="text"
            value={payload.hotline || ''}
            onChange={(e) => update('hotline', e.target.value)}
            placeholder="0866 059 659"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">Email</label>
          <input
            type="text"
            value={payload.email || ''}
            onChange={(e) => update('email', e.target.value)}
            placeholder="info@cic.com.vn"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Dòng Bản Quyền (Copyright)</label>
        <input
          type="text"
          value={payload.copyright || ''}
          onChange={(e) => update('copyright', e.target.value)}
          placeholder="© 2026 CIC. Tất cả quyền được bảo lưu."
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Ảnh Banner Chân Trang (Footer Background)</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            value={payload.banner_footer_url || ''}
            onChange={(e) => update('banner_footer_url', e.target.value)}
            placeholder="/api/landing/media/..."
            className="flex-1 rounded-lg border border-slate-300 p-2 text-xs"
          />
          <button
            type="button"
            onClick={() => onOpenMediaDrawer('banner_footer_url')}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            Chọn ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
