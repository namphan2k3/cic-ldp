'use client';

import React from 'react';
import type { FormFieldSchema, FormOutcomeRule } from '@/lib/formWorkflow';

interface ConditionalOutcomeRulesEditorProps {
  rules: FormOutcomeRule[];
  fields: FormFieldSchema[];
  onChangeRules: (next: FormOutcomeRule[]) => void;
}

export function ConditionalOutcomeRulesEditor({
  rules,
  fields,
  onChangeRules,
}: ConditionalOutcomeRulesEditorProps) {
  const selectFields = fields.filter(
    (f) => f.type === 'select' || f.type === 'checkbox_group' || f.type === 'radio'
  );
  const triggerCandidates = selectFields.length > 0 ? selectFields : fields;

  const handleAddRule = () => {
    const firstField = triggerCandidates[0];
    const firstOpt = firstField?.options?.[0];
    onChangeRules([
      ...rules,
      {
        id: `rule_${Date.now().toString().slice(-5)}`,
        whenField: firstField?.name || 'primary_need',
        operator: 'equals',
        whenValue: firstOpt?.value || '',
        actionType: 'message_only',
        title: 'Đăng Ký Tư Vấn Thành Công!',
        message:
          'Cảm ơn Quý khách! Chuyên viên kỹ thuật CIC sẽ liên hệ tư vấn sớm nhất.',
        downloadUrl: '',
        downloadLabel: 'Tải Tài Liệu Ngay',
        targetSheetName: '',
      },
    ]);
  };

  const handleUpdate = (
    idx: number,
    patch: Partial<FormOutcomeRule>
  ) => {
    const next = [...rules];
    next[idx] = { ...next[idx], ...patch };
    onChangeRules(next);
  };

  const handleRemove = (idx: number) => {
    onChangeRules(rules.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#0b1b36]">
            Kịch bản Kết quả &amp; Tải File theo Điều kiện ({rules.length} kịch bản)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Cấu hình phương án nào <strong>chỉ hiện thông báo thành công</strong>, phương án nào <strong>mở hộp thoại cho tải File/Bộ cài</strong> hoặc rẽ nhánh Sheet Tab riêng.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddRule}
          className="cursor-pointer whitespace-nowrap rounded-lg bg-[#0b1b36] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
        >
          Thêm Kịch Bản Điều Kiện
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {rules.map((rule, idx) => {
          const matchedField = fields.find((f) => f.name === rule.whenField);
          const fieldOptions = matchedField?.options || [];

          return (
            <div
              key={rule.id || idx}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded bg-[#0b1b36] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                    Kịch bản #{idx + 1}
                  </span>

                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      handleUpdate(idx, {
                        operator: e.target.value as 'equals' | 'always',
                      })
                    }
                    className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800"
                  >
                    <option value="equals">Nếu khách chọn phương án (=)</option>
                    <option value="always">Mặc định (Áp dụng cho các trường hợp còn lại)</option>
                  </select>

                  {rule.operator === 'equals' && (
                    <>
                      <select
                        value={rule.whenField}
                        onChange={(e) => {
                          const nf = fields.find((f) => f.name === e.target.value);
                          handleUpdate(idx, {
                            whenField: e.target.value,
                            whenValue: nf?.options?.[0]?.value || '',
                          });
                        }}
                        className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-[#0b1b36]"
                      >
                        {triggerCandidates.map((tf) => (
                          <option key={tf.name} value={tf.name}>
                            {tf.label.replace(/\s*\*$/, '')}
                          </option>
                        ))}
                      </select>

                      <span>=</span>

                      {fieldOptions.length > 0 ? (
                        <select
                          value={rule.whenValue}
                          onChange={(e) =>
                            handleUpdate(idx, { whenValue: e.target.value })
                          }
                          className="rounded border border-orange-300 bg-[#fff7ed] px-2.5 py-1 text-xs font-bold text-[#c2410c]"
                        >
                          {fieldOptions.map((opt, oIdx) => (
                            <option key={oIdx} value={opt.value}>
                              {opt.label} ({opt.value})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={rule.whenValue}
                          onChange={(e) =>
                            handleUpdate(idx, { whenValue: e.target.value })
                          }
                          placeholder="Giá trị điều kiện..."
                          className="rounded border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs"
                        />
                      )}
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="cursor-pointer whitespace-nowrap text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  Xóa kịch bản
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Hành động sau khi khách bấm Gửi
                  </label>
                  <select
                    value={rule.actionType}
                    onChange={(e) =>
                      handleUpdate(idx, {
                        actionType: e.target.value as
                          | 'message_only'
                          | 'download_modal',
                      })
                    }
                    className={`mt-1 w-full rounded-lg border p-2 text-xs font-bold ${
                      rule.actionType === 'download_modal'
                        ? 'border-blue-300 bg-blue-50 text-blue-900'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    }`}
                  >
                    <option value="message_only">
                      Chỉ hiện thông báo Thành công
                    </option>
                    <option value="download_modal">
                      Mở hộp thoại cho Tải File / Bộ cài
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Tiêu đề thông báo / Hộp thoại
                  </label>
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => handleUpdate(idx, { title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Sheet Tab Đích (Để trống = Mặc định)
                  </label>
                  <input
                    type="text"
                    value={rule.targetSheetName || ''}
                    onChange={(e) =>
                      handleUpdate(idx, { targetSheetName: e.target.value })
                    }
                    placeholder="VD: CMS INTELLICAD LISP"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 font-mono text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500">
                  Lời nhắn chi tiết gửi tới khách hàng
                </label>
                <input
                  type="text"
                  value={rule.message}
                  onChange={(e) => handleUpdate(idx, { message: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                />
              </div>

              {rule.actionType === 'download_modal' && (
                <div className="grid gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3 sm:grid-cols-12">
                  <div className="sm:col-span-8">
                    <label className="block text-[10px] font-bold text-blue-900">
                      Đường dẫn File tải về (từ kho Media DB hoặc Link Drive)
                    </label>
                    <input
                      type="text"
                      value={rule.downloadUrl || ''}
                      onChange={(e) =>
                        handleUpdate(idx, { downloadUrl: e.target.value })
                      }
                      placeholder="/api/landing/media/cms-intellicad/downloads/Lisp Intellicad.rar"
                      className="mt-1 w-full rounded border border-blue-300 bg-white p-1.5 font-mono text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-blue-900">
                      Chữ trên nút Tải về
                    </label>
                    <input
                      type="text"
                      value={rule.downloadLabel || ''}
                      onChange={(e) =>
                        handleUpdate(idx, { downloadLabel: e.target.value })
                      }
                      placeholder="Tải Về Ngay"
                      className="mt-1 w-full rounded border border-blue-300 bg-white p-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
