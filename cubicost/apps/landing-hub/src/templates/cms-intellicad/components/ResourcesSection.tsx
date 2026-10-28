import React from 'react';
import { CmsIcon } from './CmsIcon';

interface ResourcesSectionProps {
  payload: Record<string, unknown>;
  locale: string;
}

export function ResourcesSection({ payload, locale }: ResourcesSectionProps) {
  const res = payload as Record<string, any>;
  const visualSrc =
    (res.visual_image_url as string) ||
    '/api/landing/media/cms-intellicad/images/cms_box_monitor_1785990083366.jpg';

  return (
    <section
      id="resources"
      className="scroll-mt-32 border-t border-slate-200 bg-slate-50 py-12 sm:py-16 lg:scroll-mt-36"
    >
      <span id="thu-vien" className="sr-only" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-6 text-white shadow-2xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-700/60 bg-blue-900/80 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                <CmsIcon name="folder-down" className="h-4 w-4 text-amber-400" />
                <span>
                  {res.eyebrow ||
                    (locale === 'en'
                      ? 'Technical Resources Library'
                      : 'Thư Viện & Tài Nguyên Kỹ Thuật')}
                </span>
              </div>

              <h2 className="mb-4 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {res.title ||
                  (locale === 'en'
                    ? 'EXPERIENCE CMS INTELLICAD FREE'
                    : 'TRẢI NGHIỆM MIỄN PHÍ CMS INTELLICAD')}
              </h2>
              <p className="mb-6 text-sm font-medium leading-relaxed text-slate-200 sm:text-base">
                {res.description ||
                  'Tải bộ cài đặt đầy đủ tính năng và nhận trọn bộ thư viện LISP hữu ích cho công việc thiết kế của bạn.'}
              </p>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <a
                  href="#dang-ky"
                  className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105 hover:from-orange-600 hover:to-amber-600 active:scale-95 sm:text-sm"
                >
                  <CmsIcon name="calendar-check" className="h-4 w-4 text-white" />
                  <span>
                    {res.button ||
                      (locale === 'en'
                        ? '30-DAY FREE TRIAL'
                        : 'ĐĂNG KÝ DÙNG THỬ 30 NGÀY')}
                  </span>
                </a>
                <a
                  href="#dang-ky"
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-amber-400/70 bg-slate-950/60 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-amber-300 shadow-lg transition-all hover:scale-105 hover:border-amber-300 hover:bg-slate-950 hover:text-amber-200 active:scale-95 sm:text-sm"
                >
                  <CmsIcon name="download" className="h-4 w-4 text-amber-400" />
                  <span>
                    {res.lisp_button ||
                      (locale === 'en'
                        ? 'GET FREE LISP PACK'
                        : 'NHẬN BỘ LISP MIỄN PHÍ')}
                  </span>
                </a>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-800/80 pt-4 text-xs font-medium text-slate-300">
                <CmsIcon
                  name="sparkles"
                  className="h-4 w-4 shrink-0 text-amber-400"
                />
                <span>
                  {res.note ||
                    'Hỗ trợ cài đặt từ xa và hướng dẫn kỹ thuật 1-1 bởi chuyên gia giải pháp CIC.'}
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-5">
              <div className="group relative w-full max-w-sm sm:max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-amber-500 opacity-40 blur-md transition duration-500 group-hover:opacity-75"></div>
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 p-3 shadow-2xl">
                  <img
                    src={visualSrc}
                    width={600}
                    height={450}
                    alt="CMS IntelliCAD Box & Monitor"
                    className="w-full rounded-xl object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
