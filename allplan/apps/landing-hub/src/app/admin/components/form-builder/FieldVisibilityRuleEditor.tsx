'use client';

import React from 'react';
import type { FieldVisibilityRule, FormFieldSchema } from '@/lib/formWorkflow';

interface FieldVisibilityRuleEditorProps {
  field: FormFieldSchema;
  allFields: FormFieldSchema[];
  onChangeRule: (rule: FieldVisibilityRule) => void;
}

export function FieldVisibilityRuleEditor({
  field,
  allFields,
  onChangeRule,
}: FieldVisibilityRuleEditorProps) {
  const otherFields = allFields.filter((f) => f.name !== field.name);
  const currentRule: FieldVisibilityRule = field.visibility_rule || {
    operator: 'always',
    dependsOnField: otherFields[0]?.name || 'primary_need',
    value: '',
  };

  const depFieldObj = otherFields.find((f) => f.name === currentRule.dependsOnField);
  const depOptions = depFieldObj?.options || [];

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs">
      <span className="whitespace-nowrap font-bold text-slate-600">Điều kiện hiển thị:</span>

      <select
        value={currentRule.operator || 'always'}
        onChange={(e) => {
          const op = e.target.value as FieldVisibilityRule['operator'];
          onChangeRule({
            operator: op,
            dependsOnField: currentRule.dependsOnField || otherFields[0]?.name || 'primary_need',
            value:
              currentRule.value ||
              (depOptions[0]?.value ? String(depOptions[0].value) : ''),
          });
        }}
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
      >
        <option value="always">Luôn hiển thị trên Form</option>
        <option value="equals">Chỉ hiện khi trường khác BẰNG (=)</option>
        <option value="not_equals">Chỉ hiện khi trường khác KHÁC (≠)</option>
        <option value="in">Chỉ hiện khi thuộc danh sách (cách nhau dấu phẩy)</option>
      </select>

      {currentRule.operator && currentRule.operator !== 'always' && (
        <>
          <span className="text-slate-500">trường</span>
          <select
            value={currentRule.dependsOnField || ''}
            onChange={(e) => {
              const nextDep = otherFields.find((f) => f.name === e.target.value);
              onChangeRule({
                ...currentRule,
                dependsOnField: e.target.value,
                value: nextDep?.options?.[0]?.value || '',
              });
            }}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-[#0b1b36]"
          >
            {otherFields.map((of) => (
              <option key={of.name} value={of.name}>
                {of.label.replace(/\s*\*$/, '')} ({of.name})
              </option>
            ))}
          </select>

          <span className="text-slate-500">giá trị:</span>
          {depOptions.length > 0 && currentRule.operator !== 'in' ? (
            <select
              value={currentRule.value || ''}
              onChange={(e) =>
                onChangeRule({ ...currentRule, value: e.target.value })
              }
              className="rounded border border-orange-300 bg-[#fff7ed] px-2.5 py-1 text-xs font-bold text-[#c2410c]"
            >
              {depOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={currentRule.value || ''}
              onChange={(e) =>
                onChangeRule({ ...currentRule, value: e.target.value })
              }
              placeholder="Nhập giá trị (VD: receive_lisp)..."
              className="w-48 rounded border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs text-slate-800"
            />
          )}
        </>
      )}
    </div>
  );
}
