'use client';

import React from 'react';

interface CatalogFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
  onOpenMediaDrawer: (slotKey: string) => void;
}

export function CatalogForm({ payload, onChange, onOpenMediaDrawer }: CatalogFormProps) {
  const update = (key: string, value: any) => onChange({ ...payload, [key]: value });

  const items = Array.isArray(payload.items) ? payload.items : [];

  const updateItem = (index: number, field: string, val: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    update('items', next);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700">Tiêu Đề Danh Mục</label>
        <input
          type="text"
          value={payload.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Danh mục thiết bị và robot xây dựng"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Mô Tả Tổng Quan</label>
        <textarea
          rows={2}
          value={payload.description || ''}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Các dòng robot phục vụ công tác sàn, hoàn thiện tường và lát gạch..."
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          Danh Sách Thiết Bị / Robot ({items.length})
        </label>
        {items.map((it: any, idx: number) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 font-bold text-blue-900">
              <span>{idx + 1}. {it.title || it.model}</span>
              <span className="text-amber-600">{it.price}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500">Tên hiển thị</label>
                <input
                  type="text"
                  value={it.title || ''}
                  onChange={(e) => updateItem(idx, 'title', e.target.value)}
                  className="w-full rounded border border-slate-300 p-1.5 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Mã Model</label>
                <input
                  type="text"
                  value={it.model || ''}
                  onChange={(e) => updateItem(idx, 'model', e.target.value)}
                  className="w-full rounded border border-slate-300 p-1.5 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500">Mức giá</label>
                <input
                  type="text"
                  value={it.price || ''}
                  onChange={(e) => updateItem(idx, 'price', e.target.value)}
                  className="w-full rounded border border-slate-300 p-1.5 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Nhãn thẻ (Tag)</label>
                <input
                  type="text"
                  value={it.tag || ''}
                  onChange={(e) => updateItem(idx, 'tag', e.target.value)}
                  className="w-full rounded border border-slate-300 p-1.5 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500">Mô tả công năng</label>
              <textarea
                rows={2}
                value={it.description || ''}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                className="w-full rounded border border-slate-300 p-1.5 bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500">Ảnh thiết bị</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={it.image_url || ''}
                  onChange={(e) => updateItem(idx, 'image_url', e.target.value)}
                  className="flex-1 rounded border border-slate-300 p-1.5 bg-white"
                />
                <button
                  type="button"
                  onClick={() => onOpenMediaDrawer(`catalog_item_${idx}`)}
                  className="rounded bg-blue-100 px-2.5 py-1.5 text-[11px] font-bold text-blue-800"
                >
                  Đổi ảnh
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
