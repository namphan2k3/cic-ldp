'use client';

import React, { useState, useEffect } from 'react';
import { CmsIcon } from './CmsIcon';

interface FloatingCtaProps {
  payload: Record<string, unknown>;
  locale: string;
  hotline?: string;
}

export function FloatingCta({ payload, locale, hotline = '0866 059 659' }: FloatingCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  const floating = payload as Record<string, any>;
  const rawPhone = hotline.replace(/\s+/g, '');

  return (
    <div
      id="floating-cta"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md transition-all duration-300 sm:p-4 animate-in slide-in-from-bottom-5"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-extrabold text-white shadow-xs">
            CMS 14.1
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              {floating.title || 'Giải pháp CAD vĩnh viễn thay thế AutoCAD tối ưu chi phí'}
            </div>
            <div className="text-[11px] font-medium text-slate-600">
              {floating.description || 'Chỉ từ 7.500.000 VNĐ / License trọn đời. Hỗ trợ đầy đủ LISP & DWG.'}
            </div>
          </div>
        </div>

        <div className="flex w-full items-center gap-2.5 md:w-auto">
          <a
            href={`tel:${rawPhone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-900 transition-colors hover:bg-blue-100 md:flex-none"
          >
            <CmsIcon name="phone" className="h-4 w-4 text-blue-700" />
            <span>{floating.call || `Gọi ${hotline}`}</span>
          </a>
          <a
            href="#dang-ky"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-transform hover:bg-blue-900 active:scale-95 md:flex-none"
          >
            <CmsIcon name="download" className="h-4 w-4" />
            <span>{floating.quote || 'ĐĂNG KÝ BÁO GIÁ'}</span>
          </a>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="hidden cursor-pointer rounded-lg p-2 text-slate-400 hover:text-slate-700 lg:block"
            aria-label="Đóng"
          >
            <CmsIcon name="x" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
