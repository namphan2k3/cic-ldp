'use client';

import React, { useState } from 'react';
import { updateFormSchemaAction, syncGoogleSheetsLeadsAction } from '../actions';
import type { FormFieldSchema, FormOutcomeRule } from '@/lib/formWorkflow';
import { FieldVisibilityRuleEditor } from './form-builder/FieldVisibilityRuleEditor';
import { SelectOptionsEditor } from './form-builder/SelectOptionsEditor';
import { ConditionalOutcomeRulesEditor } from './form-builder/ConditionalOutcomeRulesEditor';

interface FormBuilderTabProps {
  forms: Array<{
    landing_form_id: string;
    form_code: string;
    form_name: string;
    fields_schema_json: any[];
    google_sheet_config_json: Record<string, any>;
    success_action: string;
    success_payload_json: Record<string, any>;
  }>;
  siteId?: string;
}

type BuilderSectionTab = 'fields' | 'workflow' | 'sheets';

export function FormBuilderTab({ forms }: FormBuilderTabProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [subTab, setSubTab] = useState<BuilderSectionTab>('workflow');
  const activeForm = forms[activeIdx];

  const [fields, setFields] = useState<FormFieldSchema[]>(
    activeForm?.fields_schema_json || []
  );
  const [expandedFieldIdx, setExpandedFieldIdx] = useState<number | null>(() => {
    const firstSelect = (activeForm?.fields_schema_json || []).findIndex(
      (f: any) => f.type === 'select' || f.type === 'checkbox_group'
    );
    return firstSelect >= 0 ? firstSelect : 0;
  });
  const [outcomeRules, setOutcomeRules] = useState<FormOutcomeRule[]>(
    activeForm?.success_payload_json?.outcome_rules || []
  );
  const [spreadsheetId, setSpreadsheetId] = useState(
    activeForm?.google_sheet_config_json?.spreadsheet_id || ''
  );
  const [sheetName, setSheetName] = useState(
    activeForm?.google_sheet_config_json?.sheet_name || ''
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectForm = (idx: number) => {
    const f = forms[idx];
    setActiveIdx(idx);
    setFields(f?.fields_schema_json || []);
    setOutcomeRules(f?.success_payload_json?.outcome_rules || []);
    setSpreadsheetId(f?.google_sheet_config_json?.spreadsheet_id || '');
    setSheetName(f?.google_sheet_config_json?.sheet_name || '');
  };

  const handleAddField = () => {
    setFields((prev) => {
      const next: FormFieldSchema[] = [
        ...prev,
        {
          name: `custom_field_${Date.now().toString().slice(-4)}`,
          label: 'Trường thông tin mới',
          type: 'text',
          placeholder: 'Nhập thông tin...',
          required: false,
          options: [],
          visibility_rule: { operator: 'always' },
        },
      ];
      setExpandedFieldIdx(next.length - 1);
      return next;
    });
  };

  const handleRemoveField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
    if (expandedFieldIdx === idx) setExpandedFieldIdx(null);
  };

  const handleMoveField = (idx: number, dir: -1 | 1) => {
    setFields((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      setExpandedFieldIdx(target);
      return next;
    });
  };

  const handleFieldChange = (
    idx: number,
    key: keyof FormFieldSchema,
    val: any
  ) => {
    setFields((prev) => {
      const next = [...prev];
      const updated: FormFieldSchema = { ...next[idx], [key]: val };
      if (
        (val === 'select' || val === 'checkbox_group' || val === 'radio') &&
        key === 'type' &&
        (!updated.options || updated.options.length === 0)
      ) {
        updated.options = [
          { label: 'Phương án 1', value: 'option_1' },
          { label: 'Phương án 2', value: 'option_2' },
        ];
        setExpandedFieldIdx(idx);
      }
      next[idx] = updated;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Đang lưu cấu hình vào Database...');
    const formData = new FormData();
    formData.append('form_id', activeForm.landing_form_id);
    formData.append('fields_schema_json', JSON.stringify(fields));
    formData.append(
      'sheet_config_json',
      JSON.stringify({
        ...activeForm.google_sheet_config_json,
        spreadsheet_id: spreadsheetId.trim(),
        sheet_name: sheetName.trim(),
      })
    );
    formData.append(
      'success_payload_json',
      JSON.stringify({
        ...activeForm.success_payload_json,
        outcome_rules: outcomeRules,
      })
    );

    await updateFormSchemaAction(formData);
    setStatusMessage('Đã lưu toàn bộ Cấu hình Form & Luồng Điều Kiện thành công.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  if (!activeForm) {
    return <div className="p-4 text-xs text-slate-500">Chưa có form nào cho site này.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sticky Top Control Bar */}
      <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-2xs backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          {forms.length > 1 && (
            <select
              value={activeIdx}
              onChange={(e) => selectForm(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-[#0b1b36]"
            >
              {forms.map((f, idx) => (
                <option key={f.landing_form_id} value={idx}>
                  {f.form_name}
                </option>
              ))}
            </select>
          )}

          {/* 3 Direct Mode Tabs */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSubTab('workflow')}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                subTab === 'workflow'
                  ? 'bg-[#0b1b36] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Luồng Điều Kiện &amp; Tải File ({outcomeRules.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('fields')}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                subTab === 'fields'
                  ? 'bg-[#0b1b36] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Các Trường &amp; Phương án ({fields.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('sheets')}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                subTab === 'sheets'
                  ? 'bg-[#0b1b36] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Kết Nối Google Sheets
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="whitespace-nowrap text-xs font-bold text-emerald-700">{statusMessage}</span>
          )}
          <button
            type="submit"
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#c2410c]"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>

      {/* TAB 1: WORKFLOW & CONDITIONAL OUTCOMES */}
      {subTab === 'workflow' && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ConditionalOutcomeRulesEditor
              rules={outcomeRules}
              fields={fields}
              onChangeRules={setOutcomeRules}
            />
          </div>

          {/* Right 4 Cols: Quick Field Visibility Rules Matrix */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="border-b border-slate-200 pb-2.5">
                <h3 className="text-sm font-bold text-[#0b1b36]">
                  Bảng Điều Kiện Ẩn / Hiện Trường
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Chọn nhanh trường nào luôn hiện hoặc chỉ hiện theo điều kiện mà không cần mở từng trường.
                </p>
              </div>

              <div className="mt-3 space-y-2.5">
                {fields.map((f, idx) => (
                  <div
                    key={f.name}
                    className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {idx + 1}. {f.label.replace(/\s*\*$/, '')}
                      </span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                        {f.name}
                      </span>
                    </div>
                    <FieldVisibilityRuleEditor
                      field={f}
                      allFields={fields}
                      onChangeRule={(rule) =>
                        handleFieldChange(idx, 'visibility_rule', rule)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPACT COLLAPSIBLE FIELDS & SELECT OPTIONS */}
      {subTab === 'fields' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0b1b36]">
                Danh sách Trường & Phương án Lựa chọn ({fields.length} trường)
              </h3>
              <p className="text-xs text-slate-500">
                Bấm vào nút <strong>Tùy chỉnh Options / Điều kiện</strong> ở dòng bất kỳ để mở chi tiết mà không làm dài trang.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddField}
              className="cursor-pointer rounded-lg bg-[#0b1b36] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
            >
              + Thêm Trường Mới
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((f, idx) => {
              const hasOptions =
                f.type === 'select' ||
                f.type === 'checkbox_group' ||
                f.type === 'radio';
              const isExpanded = expandedFieldIdx === idx;
              const hasCond =
                f.visibility_rule?.operator &&
                f.visibility_rule.operator !== 'always';

              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition ${
                    isExpanded
                      ? 'border-orange-300 bg-orange-50/10 p-3.5 shadow-xs'
                      : 'border-slate-200 bg-white px-3.5 py-2.5 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, -1)}
                        disabled={idx === 0}
                        className="cursor-pointer rounded px-1 text-[10px] font-bold text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 font-mono text-[11px] font-bold text-slate-600">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 1)}
                        disabled={idx === fields.length - 1}
                        className="cursor-pointer rounded px-1 text-[10px] font-bold text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>

                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                      className="min-w-[160px] flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                      placeholder="Nhãn hiển thị"
                    />

                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) =>
                        handleFieldChange(
                          idx,
                          'name',
                          e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                        )
                      }
                      className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-700"
                      placeholder="Mã trường"
                    />

                    <select
                      value={f.type}
                      onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                      className="w-40 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-800"
                    >
                      <option value="text">Chữ (Text)</option>
                      <option value="tel">SĐT (Validate)</option>
                      <option value="email">Email (Validate)</option>
                      <option value="select">Danh sách (Select)</option>
                      <option value="checkbox_group">Nhóm chọn (Multi)</option>
                      <option value="checkbox">Tích đơn (Checkbox)</option>
                      <option value="textarea">Đoạn văn (Textarea)</option>
                      <option value="number">Số lượng (Number)</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={f.required || false}
                        onChange={(e) =>
                          handleFieldChange(idx, 'required', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span>Bắt buộc</span>
                    </label>

                    {hasCond && (
                      <span className="whitespace-nowrap rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Có điều kiện ẩn/hiện
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFieldIdx(isExpanded ? null : idx)
                      }
                      className={`cursor-pointer whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        isExpanded
                          ? 'border-orange-300 bg-[#ea580c] text-white'
                          : hasOptions
                          ? 'border-orange-200 bg-orange-50 text-[#c2410c] hover:bg-orange-100'
                          : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {hasOptions
                        ? `Tùy chọn (${(f.options || []).length}) & Điều kiện`
                        : 'Điều kiện & Gợi ý'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="cursor-pointer whitespace-nowrap px-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800"
                      title="Xóa trường"
                    >
                      Xóa
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600">
                          Gợi ý (Placeholder):
                        </span>
                        <input
                          type="text"
                          value={f.placeholder || ''}
                          onChange={(e) =>
                            handleFieldChange(idx, 'placeholder', e.target.value)
                          }
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700"
                          placeholder="Nhập văn bản gợi ý trong ô..."
                        />
                      </div>

                      <FieldVisibilityRuleEditor
                        field={f}
                        allFields={fields}
                        onChangeRule={(rule) =>
                          handleFieldChange(idx, 'visibility_rule', rule)
                        }
                      />

                      {hasOptions && (
                        <SelectOptionsEditor
                          options={f.options || []}
                          onChangeOptions={(opts) =>
                            handleFieldChange(idx, 'options', opts)
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE SHEETS SYNC */}
      {subTab === 'sheets' && (
        <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">
            Đồng bộ Google Sheets 2 Chiều
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Dữ liệu sau khi qua lớp kiểm duyệt bảo mật sẽ tự động lưu vào PostgreSQL và đẩy lên Google Sheets (hỗ trợ rẽ nhánh Sheet Tab theo từng kịch bản điều kiện ở Tab 1).
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Google Spreadsheet ID
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="16E6ZJb2P8L1_V123..."
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-mono text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Sheet Tab Name Mặc Định
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="LADIPAGE"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs font-bold text-slate-800"
              />
            </div>

            <div className="rounded-xl border border-orange-200 bg-[#fff7ed] p-4 text-xs text-[#9a3412]">
              <span className="font-bold">Đồng bộ dữ liệu lịch sử từ Google Sheets về Database:</span>
              <button
                type="button"
                onClick={async () => {
                  setStatusMessage('Đang kéo dữ liệu lịch sử từ Google Sheets về PostgreSQL...');
                  const res = await syncGoogleSheetsLeadsAction();
                  setStatusMessage(
                    `Đã đồng bộ ${res.totalRead} dòng từ Google Sheets (+${res.inserted} mới, cập nhật ${res.updated}).`
                  );
                }}
                className="mt-2.5 w-full cursor-pointer rounded-lg bg-[#0b1b36] px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Đồng bộ dữ liệu từ Sheet này về DB ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
