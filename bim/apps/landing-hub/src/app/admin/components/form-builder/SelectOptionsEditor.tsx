'use client';

import React from 'react';
import type { FormSelectOption } from '@/lib/formWorkflow';

interface SelectOptionsEditorProps {
  options: FormSelectOption[];
  onChangeOptions: (next: FormSelectOption[]) => void;
}

export function SelectOptionsEditor({
  options,
  onChangeOptions,
}: SelectOptionsEditorProps) {
  const handleAdd = () => {
    const num = options.length + 1;
    onChangeOptions([
      ...options,
      { label: `Phương án ${num}`, value: `option_${num}` },
    ]);
  };

  const handleUpdate = (
    idx: number,
    key: 'label' | 'value',
    val: string
  ) => {
    const next = [...options];
    next[idx] = { ...next[idx], [key]: val };
    onChangeOptions(next);
  };

  const handleRemove = (idx: number) => {
    onChangeOptions(options.filter((_, i) => i !== idx));
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= options.length) return;
    const next = [...options];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onChangeOptions(next);
  };

  return (
    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50/40 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#9a3412]">
            Danh sách Phương án Lựa chọn ({options.length} phương án)
          </span>
          <p className="text-[11px] text-slate-600">
            Hiển thị trực tiếp trong ô chọn trên Landing Page & dùng để xét điều kiện ẩn/hiện hoặc tải file.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="cursor-pointer rounded-lg bg-[#ea580c] px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-[#c2410c]"
        >
          + Thêm phương án
        </button>
      </div>

      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div
            key={idx}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-orange-200/80 bg-white p-2"
          >
            <span className="w-6 text-center font-mono text-[11px] font-bold text-slate-400">
              #{idx + 1}
            </span>
            <div className="min-w-[180px] flex-1">
              <input
                type="text"
                value={opt.label}
                onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                placeholder="Nhãn hiển thị (VD: Dùng thử 30 ngày)"
                className="w-full rounded border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-900"
              />
            </div>
            <div className="w-48">
              <input
                type="text"
                value={opt.value}
                onChange={(e) => handleUpdate(idx, 'value', e.target.value)}
                placeholder="Mã giá trị (VD: trial_30_days)"
                className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0}
                className="cursor-pointer whitespace-nowrap rounded border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                Lên
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, 1)}
                disabled={idx === options.length - 1}
                className="cursor-pointer whitespace-nowrap rounded border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                Xuống
              </button>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="cursor-pointer whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
