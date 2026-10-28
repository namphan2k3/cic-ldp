'use client';

import React from 'react';

interface IntroFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
}

export function IntroForm({ payload, onChange }: IntroFormProps) {
  const update = (key: string, value: any) => onChange({ ...payload, [key]: value });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-700">Thẻ Phụ (Eyebrow)</label>
        <input
          type="text"
          value={payload.eyebrow || ''}
          onChange={(e) => update('eyebrow', e.target.value)}
          placeholder="Giới thiệu"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Chủ Đề (Topic Tag)</label>
        <input
          type="text"
          value={payload.topic || ''}
          onChange={(e) => update('topic', e.target.value)}
          placeholder="Robot xây dựng:"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Tiêu Đề Section (Title)</label>
        <textarea
          rows={2}
          value={payload.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Đầu tư vào <em>kết quả,</em> không chỉ đầu tư thiết bị"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Tuyên Bố Cốt Lõi (Core Statement)</label>
        <textarea
          rows={3}
          value={payload.statement || ''}
          onChange={(e) => update('statement', e.target.value)}
          placeholder="Giá trị lớn nhất của robot xây dựng không nằm ở..."
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700">Mô Tả 1 (Bên trái)</label>
          <textarea
            rows={3}
            value={payload.description || ''}
            onChange={(e) => update('description', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700">Mô Tả 2 (Bên phải)</label>
          <textarea
            rows={3}
            value={payload.description_2 || ''}
            onChange={(e) => update('description_2', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <label className="block text-xs font-bold text-slate-800 mb-2">3 Tiêu Chí Phù Hợp (Fit Badges)</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={payload.fit_1 || ''}
            onChange={(e) => update('fit_1', e.target.value)}
            placeholder="Đúng công việc"
            className="rounded border border-slate-300 p-1.5 text-xs bg-white"
          />
          <input
            type="text"
            value={payload.fit_2 || ''}
            onChange={(e) => update('fit_2', e.target.value)}
            placeholder="Phù hợp mặt bằng"
            className="rounded border border-slate-300 p-1.5 text-xs bg-white"
          />
          <input
            type="text"
            value={payload.fit_3 || ''}
            onChange={(e) => update('fit_3', e.target.value)}
            placeholder="Gắn với nhu cầu"
            className="rounded border border-slate-300 p-1.5 text-xs bg-white"
          />
        </div>
      </div>
    </div>
  );
}
