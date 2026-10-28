'use client';

import React from 'react';

interface FaqFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
}

export function FaqForm({ payload, onChange }: FaqFormProps) {
  const update = (key: string, value: any) => onChange({ ...payload, [key]: value });

  const items = Array.isArray(payload.items) ? payload.items : [];

  const updateItem = (index: number, field: string, val: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    update('items', next);
  };

  const addItem = () => {
    update('items', [
      ...items,
      { question: 'Câu hỏi mới?', answer: 'Nội dung giải đáp thắc mắc...' },
    ]);
  };

  const removeItem = (index: number) => {
    update('items', items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700">Tiêu Đề Khu Hỏi Đáp</label>
        <input
          type="text"
          value={payload.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Câu hỏi thường gặp"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700">Mô Tả</label>
        <textarea
          rows={2}
          value={payload.description || ''}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Những câu hỏi phổ biến từ khách hàng và nhà thầu"
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">
            Danh Sách Câu Hỏi ({items.length})
          </label>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-200"
          >
            + Thêm câu hỏi
          </button>
        </div>

        {items.map((it: any, idx: number) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900">Câu hỏi #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                Xóa
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500">Câu hỏi</label>
              <input
                type="text"
                value={it.question || it.q || ''}
                onChange={(e) => {
                  updateItem(idx, 'question', e.target.value);
                  updateItem(idx, 'q', e.target.value);
                }}
                className="w-full rounded border border-slate-300 p-1.5 bg-white font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500">Câu trả lời</label>
              <textarea
                rows={3}
                value={it.answer || it.a || ''}
                onChange={(e) => {
                  updateItem(idx, 'answer', e.target.value);
                  updateItem(idx, 'a', e.target.value);
                }}
                className="w-full rounded border border-slate-300 p-1.5 bg-white leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
