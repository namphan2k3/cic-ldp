import React from 'react';
import { CmsIcon } from './CmsIcon';

interface FooterProps {
  payload: Record<string, unknown> & {
    company_logo_url?: string;
    logo_url?: string;
  };
  locale: string;
}

export function Footer({ payload, locale }: FooterProps) {
  const footer = payload as Record<string, any>;
  const companyLogoSrc =
    payload.company_logo_url ||
    payload.logo_url ||
    '/api/landing/media/cms-intellicad/images/company_logo.png';

  return (
    <footer
      id="footer"
      className="border-t border-slate-200 bg-slate-100 py-10 text-xs text-slate-600"
    >
      <span id="page-footer" className="sr-only" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
          {/* Left Column: Company & Community */}
          <div className="space-y-4 lg:col-span-6">
            <div className="flex items-center gap-3">
              <img
                src={companyLogoSrc}
                alt="TechAZ Logo"
                className="h-10 w-10 shrink-0 object-contain"
                loading="lazy"
              />
              <div className="text-base font-extrabold text-slate-900">
                {footer.company || 'Công ty Cổ phần Giải pháp Công nghệ TechAZ'}
              </div>
            </div>
            <p className="max-w-lg text-xs font-medium leading-relaxed text-slate-600">
              {footer.description ||
                'Đơn vị phân phối và hỗ trợ kỹ thuật chính thức phần mềm CMS IntelliCAD tại thị trường Việt Nam.'}
            </p>
            <div className="pt-2">
              <a
                href="https://www.facebook.com/techazcompany"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-blue-600 bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2.5 text-xs font-black text-white shadow-md transition-all hover:scale-105 hover:from-blue-600 hover:to-blue-700 active:scale-95"
              >
                <CmsIcon name="users" className="h-4 w-4 text-amber-300" />
                <span>
                  {footer.community ||
                    'Cộng Đồng Người Dùng IntelliCAD Việt Nam'}
                </span>
                <CmsIcon
                  name="external-link"
                  className="h-3.5 w-3.5 text-blue-200 group-hover:text-white"
                />
              </a>
            </div>
          </div>

          {/* Right Column: Contact Info */}
          <div className="space-y-3 font-medium lg:col-span-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              {footer.contact_title || 'Thông Tin Liên Hệ'}
            </div>
            <div className="flex items-start gap-2.5">
              <CmsIcon
                name="map-pin"
                className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
              />
              <span className="font-bold text-slate-900">
                {footer.address ||
                  'Tầng 3, Tòa nhà CIC, 37 Lê Văn Thiêm, Thanh Xuân, Hà Nội'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CmsIcon name="phone" className="h-4 w-4 shrink-0 text-blue-700" />
              <strong className="font-bold text-slate-900">
                {footer.phone || '0979 596 954'}
              </strong>
            </div>
            <div className="flex items-center gap-2.5">
              <CmsIcon name="mail" className="h-4 w-4 shrink-0 text-blue-700" />
              <strong className="font-bold text-slate-900">
                {footer.email || 'info@techaz.com.vn'}
              </strong>
            </div>
            <div className="flex items-center gap-2.5">
              <CmsIcon name="globe" className="h-4 w-4 shrink-0 text-blue-700" />
              <a
                href={footer.website || 'https://techaz.com.vn'}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 hover:underline"
              >
                {footer.website || 'https://techaz.com.vn'}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <CmsIcon name="clock" className="h-4 w-4 shrink-0 text-blue-700" />
              <span className="font-bold text-slate-900">
                {footer.hours || '8:00 - 17:30 (Thứ 2 - Thứ 6)'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-center text-[11px] font-medium text-slate-500 sm:flex-row sm:text-left">
          <div>
            {footer.copyright ||
              '© 2026 TechAZ Solutions. Bản quyền phần mềm thuộc CMS, Inc.'}
          </div>
          <div className="flex items-center gap-4">
            <a href="#home" className="hover:text-slate-900">
              {footer.back_to_top || 'Về đầu trang ↑'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
