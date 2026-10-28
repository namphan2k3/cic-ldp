'use client';

import React from 'react';

interface VideoSliderFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
}

export function VideoSliderForm({ payload, onChange }: VideoSliderFormProps) {
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
        <label className="block text-xs font-bold text-slate-700">Tiêu Đề Khu Video</label>
        <input
          type="text"
          value={payload.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Video thực tế tại công trình"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Mô Tả Phụ</label>
        <textarea
          rows={2}
          value={payload.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
          placeholder="Theo dõi các robot vận hành trực tiếp trên các đại dự án thi công"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          Danh Sách Video YouTube ({items.length})
        </label>
        {items.map((vid: any, idx: number) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-2">
            <span className="font-bold text-blue-900">Video #{idx + 1}</span>

            <div>
              <label className="text-[10px] text-slate-500">Mã YouTube ID (hoặc link xem)</label>
              <input
                type="text"
                value={vid.youtube_id || vid.url || ''}
                onChange={(e) => {
                  let raw = e.target.value.trim();
                  // Normalize full URL if pasted
                  if (raw.includes('v=')) {
                    raw = raw.split('v=')[1]?.split('&')[0] || raw;
                  } else if (raw.includes('youtu.be/')) {
                    raw = raw.split('youtu.be/')[1]?.split('?')[0] || raw;
                  }
                  updateItem(idx, 'youtube_id', raw);
                  updateItem(idx, 'url', `https://www.youtube.com/watch?v=${raw}`);
                }}
                placeholder="Ví dụ: ZsjXqYKYeYw"
                className="w-full rounded border border-slate-300 p-1.5 bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500">Tiêu đề / Chú thích video</label>
              <input
                type="text"
                value={vid.title || vid.caption || ''}
                onChange={(e) => {
                  updateItem(idx, 'title', e.target.value);
                  updateItem(idx, 'caption', e.target.value);
                }}
                className="w-full rounded border border-slate-300 p-1.5 bg-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
