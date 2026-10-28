'use client';

import React from 'react';

interface GenericFallbackFormProps {
  payload: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
  onOpenMediaDrawer: (slotKey: string) => void;
}

export function GenericFallbackForm({
  payload,
  onChange,
  onOpenMediaDrawer,
}: GenericFallbackFormProps) {
  const update = (key: string, value: any) =>
    onChange({ ...payload, [key]: value });

  const renderField = (
    key: string,
    value: any,
    onUpdate: (newVal: any) => void,
    pathPrefix = ''
  ): React.ReactNode => {
    const fullKey = pathPrefix ? `${pathPrefix}.${key}` : key;
    const labelText = key.replace(/_/g, ' ');

    if (typeof value === 'string') {
      const isLong = value.length > 60 || key.includes('description') || key.includes('note') || key.includes('answer');
      const isImage =
        key.includes('image') ||
        key.includes('visual') ||
        key.includes('logo') ||
        key.includes('icon') ||
        key.endsWith('_url') ||
        key.endsWith('_file');

      return (
        <div key={fullKey} className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 capitalize">
            {labelText}
          </label>
          {isImage ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => onUpdate(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 p-2 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={() => onOpenMediaDrawer(key)}
                className="cursor-pointer rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                Chọn File/Ảnh
              </button>
            </div>
          ) : isLong ? (
            <textarea
              rows={3}
              value={value}
              onChange={(e) => onUpdate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onUpdate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800"
            />
          )}
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={fullKey} className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 capitalize">
            {labelText}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => onUpdate(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800"
          />
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <label
          key={fullKey}
          className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-700 capitalize"
        >
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onUpdate(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          <span>{labelText}</span>
        </label>
      );
    }

    if (Array.isArray(value)) {
      const handleAddItem = () => {
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          const templateObj: Record<string, any> = {};
          for (const k of Object.keys(value[0])) {
            templateObj[k] = typeof value[0][k] === 'boolean' ? false : '';
          }
          onUpdate([...value, templateObj]);
        } else {
          onUpdate([...value, 'Mục mới']);
        }
      };

      return (
        <div
          key={fullKey}
          className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0b1b36] capitalize">
              Danh sách: {labelText} ({value.length} mục)
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="cursor-pointer rounded-lg bg-[#0b1b36] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
            >
              + Thêm mục
            </button>
          </div>

          <div className="space-y-2">
            {value.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    Mục #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdate(value.filter((_, i) => i !== idx))}
                    className="cursor-pointer text-[11px] font-bold text-rose-600 hover:text-rose-800"
                  >
                    Xóa
                  </button>
                </div>

                {typeof item === 'object' && item !== null ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(item).map(([subK, subV]) =>
                      renderField(
                        subK,
                        subV,
                        (newSubVal) => {
                          const nextArr = [...value];
                          nextArr[idx] = { ...item, [subK]: newSubVal };
                          onUpdate(nextArr);
                        },
                        `${fullKey}[${idx}]`
                      )
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={String(item ?? '')}
                    onChange={(e) => {
                      const nextArr = [...value];
                      nextArr[idx] = e.target.value;
                      onUpdate(nextArr);
                    }}
                    className="w-full rounded border border-slate-300 p-1.5 text-xs text-slate-800"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div
          key={fullKey}
          className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5"
        >
          <div className="text-xs font-bold text-[#0b1b36] uppercase">
            Nhóm cấu hình: {labelText}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(value).map(([subK, subV]) =>
              renderField(
                subK,
                subV,
                (newSubVal) => onUpdate({ ...value, [subK]: newSubVal }),
                fullKey
              )
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {Object.entries(payload).map(([k, v]) =>
        renderField(k, v, (newVal) => update(k, newVal))
      )}
    </div>
  );
}
