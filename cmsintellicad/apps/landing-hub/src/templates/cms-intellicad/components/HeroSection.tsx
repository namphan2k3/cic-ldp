import React from 'react';
import { CmsIcon } from './CmsIcon';
import type { HeroPayload } from '../types';

interface HeroSectionProps {
  payload: HeroPayload & {
    hero_visual_url?: string;
    logo_url?: string;
  };
  locale: string;
}

export function HeroSection({ payload, locale }: HeroSectionProps) {
  const pricing = payload.pricing || {};
  const visual = payload.visual || {};
  const options = pricing.options || [
    'Bản quyền vĩnh viễn',
    'Thuê bao theo năm',
    'Theo nhu cầu sử dụng',
  ];

  const specs = visual.specs || [
    { label: 'Tương thích', value: 'DWG Native' },
    { label: 'Công nghệ', value: '64-Bit Multi-Core' },
    { label: 'Lập trình', value: 'LISP, FAS, VLX, .NET' },
  ];

  const logoSrc =
    payload.logo_url ||
    '/api/landing/media/cms-intellicad/images/logo.png';
  const heroVisualSrc =
    payload.hero_visual_url ||
    '/api/landing/media/cms-intellicad/images/intellicad_3d_laptop_1785898332833.jpg';

  return (
    <section
      id="hero"
      className="relative scroll-mt-32 overflow-hidden bg-slate-50 pt-32 pb-12 sm:pt-36 sm:pb-16 lg:scroll-mt-36 lg:pt-40"
    >
      <span id="home" className="sr-only" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-200/40 via-slate-200/40 to-blue-100/30 blur-[120px]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          {/* Left Column */}
          <div className="flex flex-col items-start text-left lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs">
              <img
                src={logoSrc}
                width={20}
                height={20}
                alt="CMS IntelliCAD Logo"
                className="h-5 w-5 object-contain"
              />
              <span className="font-bold text-slate-800">
                {payload.badge ||
                  'Giải Pháp CMS IntelliCAD Bản Quyền Vĩnh Viễn'}
              </span>
            </div>

            <h1 className="mb-5 text-3xl leading-[1.18] font-black tracking-tight text-slate-900 uppercase sm:text-4xl lg:text-5xl">
              <span>{payload.title_line || 'CMS INTELLICAD –'}</span>
              <br />
              <span className="bg-gradient-to-r from-slate-950 via-blue-900 to-blue-700 bg-clip-text text-transparent">
                {payload.title_accent || 'GIẢI PHÁP CAD THAY THẾ MẠNH MẼ'}
              </span>
            </h1>

            <div className="mb-6 space-y-3 text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
              <p>{payload.description_1}</p>
              <p>{payload.description_2}</p>
            </div>

            {/* Pricing Card */}
            <div className="relative mb-8 w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-2xl sm:p-6">
              <div className="pointer-events-none absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl"></div>

              <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-full border border-blue-600/70 bg-blue-900/90 px-3.5 py-1.5 text-xs font-black tracking-wider text-blue-100 uppercase backdrop-blur-sm">
                  <CmsIcon name="tag" className="h-4 w-4 text-amber-400" />
                  <span>
                    {pricing.badge || 'Chi Phí Đầu Tư Bản Quyền Tối Ưu'}
                  </span>
                </div>
                <span className="rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-black tracking-wider text-slate-950 uppercase shadow-xs">
                  {pricing.types || 'Vĩnh Viễn / Theo Năm / Theo Nhu Cầu'}
                </span>
              </div>

              <div className="mb-4 border-b border-slate-800 pb-3">
                <div className="text-xs font-semibold text-slate-300 sm:text-sm">
                  {pricing.from || 'Bản quyền CMS IntelliCAD chính hãng chỉ từ:'}
                </div>
                <div className="mt-1 flex items-baseline gap-2 font-mono text-2xl font-black tracking-tight text-amber-400 sm:text-3xl lg:text-4xl">
                  <span>{pricing.price || '7.500.000 VNĐ'}</span>
                  <span className="font-sans text-xs font-bold text-slate-300 sm:text-sm">
                    / license
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-blue-200/80">
                  {pricing.note || '*(Áp dụng ưu đãi khi mua từ 2 license trở lên)'}
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* Standalone */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-3.5">
                  <div className="mb-2 flex items-center gap-2 border-b border-slate-800 pb-1.5">
                    <CmsIcon
                      name="monitor"
                      className="h-4 w-4 shrink-0 text-blue-400"
                    />
                    <span className="text-xs font-black tracking-wider text-white uppercase">
                      {pricing.standalone || 'Bản Standalone (Máy đơn)'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-medium text-slate-200">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CmsIcon
                          name="check-circle"
                          className="h-3.5 w-3.5 shrink-0 text-amber-400"
                        />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Network */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-3.5">
                  <div className="mb-2 flex items-center gap-2 border-b border-slate-800 pb-1.5">
                    <CmsIcon
                      name="network"
                      className="h-4 w-4 shrink-0 text-blue-400"
                    />
                    <span className="text-xs font-black tracking-wider text-white uppercase">
                      {pricing.network || 'Bản Network (License Mạng)'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-medium text-slate-200">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CmsIcon
                          name="check-circle"
                          className="h-3.5 w-3.5 shrink-0 text-amber-400"
                        />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex w-full flex-col items-stretch gap-3.5 sm:w-auto sm:flex-row sm:items-center">
              <a
                href="#dang-ky"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-slate-950/20 transition-all hover:scale-[1.02] hover:bg-blue-900 active:scale-[.98]"
              >
                <CmsIcon name="download" className="h-4 w-4 text-amber-400" />
                <span>
                  {locale === 'en' ? 'REQUEST A QUOTE' : 'ĐĂNG KÝ NHẬN BÁO GIÁ'}
                </span>
              </a>
              <a
                href="#nhan-dien-cau-hinh"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-800 shadow-xs transition-all hover:bg-slate-100"
              >
                <CmsIcon name="shield-check" className="h-4 w-4 text-blue-700" />
                <span>
                  {payload.compare_versions || 'SO SÁNH BẢN PE / PE PLUS'}
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual UI Mockup */}
          <div className="relative lg:col-span-5">
            <div className="group relative mx-auto overflow-hidden rounded-2xl border border-slate-300/80 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <i className="h-3 w-3 rounded-full bg-rose-500"></i>
                  <i className="h-3 w-3 rounded-full bg-amber-500"></i>
                  <i className="h-3 w-3 rounded-full bg-emerald-500"></i>
                  <span className="ml-2 text-xs font-mono text-slate-300">
                    CMS IntelliCAD 14.1 PE / PE Plus
                  </span>
                </div>
                <span className="rounded border border-blue-700/50 bg-blue-900/60 px-2 py-0.5 text-[11px] font-bold font-mono text-blue-200">
                  {visual.real_ui || 'Giao Diện Thực Tế'}
                </span>
              </div>
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={heroVisualSrc}
                  width={1376}
                  height={768}
                  alt="CMS IntelliCAD 14.1 3D Wireframe & Ribbon Interface"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute right-3 bottom-3 left-3 flex items-center rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-white shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <div className="shrink-0 rounded-lg border border-blue-800 bg-blue-900/40 p-2 text-blue-300">
                      <CmsIcon name="layers" className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {visual.title || 'Mô phỏng Giao diện CAD trực quan'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Ribbon UI, Classic Toolbar & LISP Editor
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 bg-slate-100 px-4 py-3 text-center">
                {specs.map((spec, idx) => (
                  <div key={idx} className="px-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                      {spec.label}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        idx === 0
                          ? 'text-blue-700'
                          : idx === 1
                          ? 'text-slate-900'
                          : 'text-blue-800'
                      }`}
                    >
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
