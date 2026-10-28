'use client';

import React, { useState, useEffect } from 'react';

interface CmsLinkContactToolbarProps {
  sectionCode: string;
  payload: Record<string, any>;
  focusedHref?: string;
  focusedText?: string;
  onUpdatePayloadField: (key: string, value: string) => void;
  onApplyIframeLink: (href: string, text: string) => void;
}

interface ContactPillDef {
  key: string;
  label: string;
  type: 'tel' | 'zalo' | 'mailto' | 'url' | 'anchor';
}

const SECTION_PILS: Record<string, ContactPillDef[]> = {
  header: [
    { key: 'cta', label: 'Nút Tư vấn Header', type: 'anchor' },
    { key: 'hotline', label: 'Hotline Header', type: 'tel' },
  ],
  hero: [
    { key: 'primary_cta', label: 'Nút Hero Chính', type: 'anchor' },
    { key: 'secondary_cta', label: 'Nút Hero Phụ', type: 'anchor' },
  ],
  consultation_form: [
    { key: 'phone', label: 'SĐT / Zalo 1', type: 'zalo' },
    { key: 'phone_2', label: 'SĐT / Zalo 2', type: 'zalo' },
    { key: 'email', label: 'Email Tư vấn 1', type: 'mailto' },
    { key: 'email_2', label: 'Email Tư vấn 2', type: 'mailto' },
  ],
  footer: [
    { key: 'hotline', label: 'Hotline 1', type: 'tel' },
    { key: 'hotline_2', label: 'Hotline 2', type: 'tel' },
    { key: 'email', label: 'Email 1', type: 'mailto' },
    { key: 'website', label: 'Website CIC', type: 'url' },
  ],
  floating_cta: [
    { key: 'phone', label: 'Hotline Nổi', type: 'tel' },
    { key: 'zalo', label: 'Link Zalo Nổi', type: 'zalo' },
  ],
};

const PREFIXES: Record<string, string> = {
  tel: 'tel:',
  zalo: 'https://zalo.me/',
  mailto: 'mailto:',
  url: '',
  anchor: '#',
};

export function CmsLinkContactToolbar({
  sectionCode,
  payload,
  focusedHref,
  focusedText,
  onUpdatePayloadField,
  onApplyIframeLink,
}: CmsLinkContactToolbarProps) {
  const pills = SECTION_PILS[sectionCode] || [];
  const [isOpen, setIsOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('');
  const [activeBadge, setActiveBadge] = useState<string>('Liên kết');
  const [linkType, setLinkType] = useState<'tel' | 'zalo' | 'mailto' | 'url' | 'anchor'>('tel');
  const [inputValue, setInputValue] = useState<string>('');
  const [appliedToast, setAppliedToast] = useState(false);

  useEffect(() => {
    if (focusedHref) {
      setIsOpen(true);
      setActiveKey('');
      setActiveBadge(focusedText ? `"${focusedText.slice(0, 24)}"` : 'Liên kết đang chọn');
      if (focusedHref.startsWith('tel:')) {
        setLinkType('tel');
        setInputValue(focusedHref.slice(4));
      } else if (focusedHref.includes('zalo.me/')) {
        setLinkType('zalo');
        setInputValue(focusedHref.split('zalo.me/')[1] || '');
      } else if (focusedHref.startsWith('mailto:')) {
        setLinkType('mailto');
        setInputValue(focusedHref.slice(7));
      } else if (focusedHref.startsWith('#')) {
        setLinkType('anchor');
        setInputValue(focusedHref.slice(1));
      } else {
        setLinkType('url');
        setInputValue(focusedHref);
      }
    }
  }, [focusedHref, focusedText]);

  const handleSelectPill = (pill: ContactPillDef) => {
    const currentVal = String(payload[pill.key] || '');
    setIsOpen(true);
    setActiveKey(pill.key);
    setActiveBadge(pill.label);
    setLinkType(pill.type);
    setInputValue(currentVal);
  };

  const handleApply = () => {
    const clean = inputValue.trim();
    const prefix = PREFIXES[linkType] || '';
    const fullHref =
      linkType === 'zalo'
        ? `${prefix}${clean.replace(/[^0-9]/g, '')}`
        : `${prefix}${clean}`;

    if (activeKey) {
      onUpdatePayloadField(activeKey, clean);
    }
    onApplyIframeLink(fullHref, clean);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2000);
  };

  if (!pills.length && !isOpen) return null;

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
      {/* 1. Quick Contact Pills Row */}
      {pills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="mr-1 font-bold text-slate-500">Mục liên hệ & Link nhanh:</span>
          {pills.map((pill) => {
            const val = payload[pill.key];
            const isSelected = activeKey === pill.key && isOpen;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => handleSelectPill(pill)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-200'
                    : val
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400 hover:bg-white'
                    : 'border-dashed border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>{val ? `${pill.label}: ${val}` : `+ Thiết lập ${pill.label}`}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Link Editor Bar */}
      {isOpen && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="font-bold text-slate-900">Sửa liên kết:</span>
            <span className="rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800">
              {activeBadge}
            </span>
          </div>

          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-semibold text-slate-700"
          >
            <option value="tel">Điện thoại (tel:)</option>
            <option value="zalo">Zalo (zalo.me/)</option>
            <option value="mailto">Email (mailto:)</option>
            <option value="url">Web URL (https://)</option>
            <option value="anchor">Neo trang (#)</option>
          </select>

          <div className="flex min-w-[220px] max-w-md flex-1 items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1 focus-within:border-blue-600">
            <span className="select-none font-mono text-[11px] font-bold text-slate-400">
              {PREFIXES[linkType]}
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập số điện thoại, email hoặc URL..."
              className="w-full min-w-0 border-0 bg-transparent px-1.5 py-0.5 text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-black text-white transition hover:bg-blue-800"
          >
            Áp dụng link
          </button>

          {appliedToast && (
            <span className="whitespace-nowrap text-[11px] font-bold text-emerald-700">Đã áp dụng</span>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="ml-auto whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title="Đóng thanh liên kết"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
