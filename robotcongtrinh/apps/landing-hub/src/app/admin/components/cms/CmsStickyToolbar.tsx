'use client';

import React from 'react';

export interface FocusedElementInfo {
  text: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  fontFamily?: string;
  href?: string;
}

interface CmsStickyToolbarProps {
  device: 'mobile' | 'tablet' | 'pc';
  onChangeDevice: (device: 'mobile' | 'tablet' | 'pc') => void;
  saveState: 'saved' | 'dirty' | 'saving' | 'error';
  onSaveDraft: () => void;
  focusedElement: FocusedElementInfo | null;
  onFormatCommand: (command: string, value?: string | number) => void;
  showFormPanel: boolean;
  onToggleFormPanel: () => void;
  showModalEditor?: boolean;
  onToggleModalEditor?: () => void;
  onOpenMediaDrawer: () => void;
}

export function CmsStickyToolbar({
  device,
  onChangeDevice,
  saveState,
  onSaveDraft,
  focusedElement,
  onFormatCommand,
  showFormPanel,
  onToggleFormPanel,
  showModalEditor = false,
  onToggleModalEditor,
  onOpenMediaDrawer,
}: CmsStickyToolbarProps) {
  const stateDisplay = {
    saved: { label: 'Đã lưu bản nháp', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    dirty: { label: 'Chưa lưu thay đổi', cls: 'text-amber-800 bg-amber-50 border-amber-300' },
    saving: { label: 'Đang lưu...', cls: 'text-blue-800 bg-blue-50 border-blue-200' },
    error: { label: 'Lưu thất bại', cls: 'text-red-700 bg-red-50 border-red-200' },
  }[saveState];

  return (
    <div className="sticky top-16 z-30 mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-300 bg-white/95 p-3 shadow-xl backdrop-blur">
      {/* 1. Device Tabs (Mobile 430 / Tablet 768 / PC Full) */}
      <div className="flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onChangeDevice('mobile')}
          className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${
            device === 'mobile' ? 'bg-[#0b1b36] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Mobile
        </button>
        <button
          type="button"
          onClick={() => onChangeDevice('tablet')}
          className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${
            device === 'tablet' ? 'bg-[#0b1b36] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tablet
        </button>
        <button
          type="button"
          onClick={() => onChangeDevice('pc')}
          className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${
            device === 'pc' ? 'bg-[#0b1b36] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          PC
        </button>
      </div>

      {/* 2. Quick Triggers for Media & Structured Form */}
      <button
        type="button"
        onClick={onOpenMediaDrawer}
        className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        Thư viện Media
      </button>

      <button
        type="button"
        onClick={onToggleFormPanel}
        className={`cursor-pointer whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition ${
          showFormPanel
            ? 'border-[#ea580c] bg-[#fff7ed] text-[#c2410c]'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        {showFormPanel ? 'Đóng biểu mẫu dữ liệu' : 'Mở biểu mẫu dữ liệu'}
      </button>

      {onToggleModalEditor && (
        <button
          type="button"
          onClick={onToggleModalEditor}
          className={`cursor-pointer whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            showModalEditor
              ? 'border-[#0b1b36] bg-[#0b1b36] text-white shadow-2xs'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {showModalEditor ? 'Đóng Sửa Popup / Modal' : 'Sửa Popup / Modal (PDF & Tải file)'}
        </button>
      )}

      {/* 3. Save Status & Save Draft Button */}
      <span
        className={`ml-auto whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${stateDisplay.cls}`}
      >
        {stateDisplay.label}
      </span>

      <button
        type="button"
        onClick={onSaveDraft}
        disabled={saveState === 'saving'}
        className="cursor-pointer whitespace-nowrap rounded-lg bg-[#0b1b36] px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {saveState === 'saving' ? 'Đang lưu...' : 'Lưu bản nháp'}
      </button>

      {/* 4. Rich Text & Typography Direct Toolbar (Always accessible, highlights focused text) */}
      <div
        role="toolbar"
        aria-label="Định dạng chữ và kiểu chữ"
        className="order-last flex w-full basis-full flex-wrap items-center gap-2 border-t border-slate-200 pt-2.5"
      >
        <span className="mr-1 text-xs font-black text-slate-800">Khối chữ:</span>
        <span className="max-w-xs truncate rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">
          {focusedElement?.text
            ? `Đang chọn: "${focusedElement.text.slice(0, 42)}"`
            : 'Click vào bất kỳ chữ nào bên dưới để sửa trực tiếp'}
        </span>

        <button
          type="button"
          onClick={() => onFormatCommand('bold')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-black hover:bg-slate-100"
          title="In đậm (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => onFormatCommand('italic')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs italic font-bold hover:bg-slate-100"
          title="In nghiêng (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => onFormatCommand('underline')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs underline font-bold hover:bg-slate-100"
          title="Gạch chân (Ctrl+U)"
        >
          U
        </button>

        <select
          aria-label="Chọn Font"
          onChange={(e) => onFormatCommand('fontFamily', e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="Arial, Helvetica, sans-serif">Font: Arial</option>
          <option value="ui-sans-serif, system-ui, sans-serif">Font: System UI</option>
          <option value="Inter, Arial, sans-serif">Font: Inter</option>
          <option value="Roboto, Arial, sans-serif">Font: Roboto</option>
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={10}
            max={96}
            step={0.5}
            placeholder={focusedElement?.fontSize ? String(focusedElement.fontSize) : 'Cỡ px'}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val >= 10 && val <= 96) onFormatCommand('fontSize', val);
            }}
            className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
            title="Cỡ chữ (px) cho thiết bị đang chọn"
          />
          <span className="text-[10px] font-bold text-slate-400">px</span>
        </div>

        <select
          aria-label="Độ đậm chữ"
          value={focusedElement?.fontWeight || '700'}
          onChange={(e) => onFormatCommand('fontWeight', e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="400">Độ đậm: 400 (Thường)</option>
          <option value="500">Độ đậm: 500 (Vừa)</option>
          <option value="600">Độ đậm: 600 (Hơi đậm)</option>
          <option value="700">Độ đậm: 700 (Đậm)</option>
          <option value="800">Độ đậm: 800 (Rất đậm)</option>
        </select>

        <button
          type="button"
          onClick={() => onFormatCommand('textAlign', 'left')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-100"
        >
          Trái
        </button>
        <button
          type="button"
          onClick={() => onFormatCommand('textAlign', 'center')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-100"
        >
          Giữa
        </button>
        <button
          type="button"
          onClick={() => onFormatCommand('textAlign', 'right')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-100"
        >
          Phải
        </button>

        <button
          type="button"
          onClick={() => onFormatCommand('clear')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Xóa định dạng
        </button>
        <button
          type="button"
          onClick={() => onFormatCommand('undo')}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          title="Ctrl+Z"
        >
          Hoàn tác
        </button>
      </div>
    </div>
  );
}
