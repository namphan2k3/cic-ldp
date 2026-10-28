'use client';

import React, { useEffect, useState } from 'react';
import { CmsIcon } from './CmsIcon';
import type { HeaderPayload } from '../types';

interface HeaderProps {
  payload: HeaderPayload & { logo_url?: string };
  locale: string;
  hotline?: string;
}

export function Header({
  payload,
  locale,
  hotline = '0866 059 659',
}: HeaderProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 50);

      const sectionIds = [
        'home',
        'uu-diem',
        'so-sanh-autocad',
        'yeu-cau-he-thong',
        'thu-vien',
        'hoi-dap',
        'dang-ky',
      ];
      for (const id of sectionIds.reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveNav(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: locale === 'en' ? 'Home' : 'Trang chủ' },
    { id: 'uu-diem', label: locale === 'en' ? 'Advantages' : 'Ưu điểm' },
    {
      id: 'so-sanh-autocad',
      label: locale === 'en' ? 'Comparison' : 'So sánh AutoCAD',
    },
    {
      id: 'yeu-cau-he-thong',
      label: locale === 'en' ? 'Requirements' : 'Yêu cầu hệ thống',
    },
    {
      id: 'thu-vien',
      label: locale === 'en' ? 'Resources' : 'Thư viện & Tải về',
    },
    { id: 'hoi-dap', label: locale === 'en' ? 'FAQ' : 'Hỏi đáp' },
    {
      id: 'dang-ky',
      label: locale === 'en' ? 'Consultation' : 'Đăng ký tư vấn',
    },
  ];

  const rawPhone = hotline.replace(/\s+/g, '');
  const logoSrc =
    payload.logo_url ||
    '/api/landing/media/cms-intellicad/images/logo.png';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 py-3 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between gap-2 overflow-hidden transition-all duration-300 sm:gap-4 ${
            isCompact ? 'max-h-0 opacity-0 py-0' : 'max-h-16 opacity-100'
          }`}
        >
          <a
            href="#home"
            className="group flex shrink-0 items-center gap-1.5 sm:gap-3"
          >
            <img
              src={logoSrc}
              width={40}
              height={40}
              alt="CMS IntelliCAD Logo"
              className="h-8 w-8 object-contain transition-transform group-hover:scale-105 sm:h-10 sm:w-10"
            />
            <div className="flex flex-col">
              <span className="whitespace-nowrap text-sm font-black tracking-tight text-slate-950 sm:text-lg">
                CMS <span className="text-blue-700">IntelliCAD</span>
              </span>
              <span className="hidden whitespace-nowrap text-[11px] font-medium text-slate-500 sm:block">
                {payload.subtitle ||
                  (locale === 'en'
                    ? 'Perpetual 2D/3D CAD Software'
                    : 'Phần mềm CAD 2D/3D Bản Quyền Vĩnh Viễn')}
              </span>
            </div>
          </a>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2.5">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
              <a
                href="?lang=vi"
                title="Tiếng Việt"
                className={`flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-bold transition-all sm:px-2 ${
                  locale === 'vi'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇻🇳</span>
                <span className="hidden sm:inline">VN</span>
              </a>
              <a
                href="?lang=en"
                title="English"
                className={`flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-bold transition-all sm:px-2 ${
                  locale === 'en'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇬🇧</span>
                <span className="hidden sm:inline">EN</span>
              </a>
            </div>

            <a
              href={`tel:${rawPhone}`}
              className="hidden items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-700 xl:flex"
            >
              <CmsIcon name="phone" className="h-3.5 w-3.5 text-blue-700" />
              <span>{hotline}</span>
            </a>

            <a
              href="#dang-ky"
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-2 text-[10px] font-bold whitespace-nowrap text-white shadow-sm transition-all hover:scale-105 hover:bg-blue-900 active:scale-95 sm:gap-2 sm:px-4 sm:text-xs"
            >
              <CmsIcon
                name="download"
                className="h-3.5 w-3.5 shrink-0 text-amber-400"
              />
              <span>
                {payload.quote ||
                  (locale === 'en' ? 'REQUEST A QUOTE' : 'ĐĂNG KÝ NHẬN BÁO GIÁ')}
              </span>
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          {isCompact && (
            <a
              href="#home"
              className="flex shrink-0 items-center gap-1.5 pr-3 text-slate-950 transition-all hover:opacity-80"
            >
              <img
                src={logoSrc}
                width={24}
                height={24}
                alt="Logo"
                className="h-6 w-6 object-contain"
              />
              <span className="hidden text-xs font-black tracking-tight lg:inline">
                CMS <span className="text-blue-700">IntelliCAD</span>
              </span>
            </a>
          )}
          <nav className="no-scrollbar mt-1.5 flex flex-1 items-center justify-start gap-0.5 overflow-x-auto border-t border-slate-200/60 pt-1.5 md:justify-center md:gap-1 lg:gap-1.5">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold whitespace-nowrap transition-all sm:text-[10px] md:px-2 md:text-[11px] lg:px-2.5 lg:text-[13px] ${
                  activeNav === link.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
