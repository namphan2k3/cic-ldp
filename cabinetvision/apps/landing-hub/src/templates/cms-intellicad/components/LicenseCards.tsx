import React from 'react';
import { CmsIcon } from './CmsIcon';
import type { HeroPayload } from '../types';

interface LicenseCardsProps {
  payload: HeroPayload;
  locale: string;
}

export function LicenseCards({ payload, locale }: LicenseCardsProps) {
  const licensing = payload.licensing || {};
  const versions = payload.versions || [
    {
      name: '1. PE (Premium Edition)',
      icon: 'monitor',
      tag: 'Cốt Lõi 2D/3D',
      description: 'Bao gồm đầy đủ các công cụ thiết kế 2D cốt lõi, đồng thời hỗ trợ mô hình hóa 3D, kết xuất hình ảnh (Rendering), BIM Underlay và làm việc với các định dạng tệp bên ngoài.'
    },
    {
      name: '2. PE Plus (Premium Edition Plus)',
      icon: 'award',
      tag: 'Nâng Cao & ACIS',
      description: 'Bổ sung các tính năng mô hình hóa 3D nâng cao, hỗ trợ đầy đủ việc chỉnh sửa khối ACIS Solid, cùng nhiều công cụ nâng cao giúp tăng năng suất làm việc.'
    },
    {
      name: '3. Easy Run',
      icon: 'zap',
      tag: 'Không Cần Cài Đặt',
      description: 'CMS IntelliCAD hỗ trợ chạy trực tiếp không cần cài đặt, đáp ứng nhu cầu sử dụng linh động và cấp phép cho một máy có kết nối internet tại một thời điểm.'
    }
  ];

  return (
    <section id="nhan-dien-cau-hinh" className="scroll-mt-32 border-t border-slate-200 bg-white py-14 lg:scroll-mt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-7xl text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            <CmsIcon name="layers" className="h-3.5 w-3.5 text-blue-700" />
            <span>{licensing.badge || 'Hình Thức Cấp Phép Bản Quyền'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
            {licensing.title || 'HÌNH THỨC CẤP PHÉP BẢN QUYỀN'}
          </h2>
          <p
            className="mt-2.5 text-sm leading-relaxed text-slate-600 lg:whitespace-nowrap sm:text-base"
            dangerouslySetInnerHTML={{ __html: (licensing.description || '').replace(/:$/, '') }}
          />
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {versions.map((ver, idx) => (
            <article
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500 hover:shadow-md"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50">
                    <CmsIcon
                      name={ver.icon || 'monitor'}
                      className={`h-5 w-5 ${ver.icon === 'zap' ? 'text-amber-600' : ver.icon === 'award' ? 'text-blue-900' : 'text-blue-700'}`}
                    />
                  </div>
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    {ver.tag}
                  </span>
                </div>

                <h3 className="mb-2 text-base font-extrabold text-slate-900 transition-colors group-hover:text-blue-800">
                  {ver.name}
                </h3>
                <p className="text-xs leading-relaxed font-normal text-slate-600 sm:text-sm">
                  {ver.description}
                </p>
              </div>

              <a
                href="#dang-ky"
                className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-left text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                <span>{locale === 'en' ? 'REQUEST A QUOTE' : 'ĐĂNG KÝ NHẬN BÁO GIÁ'}</span>
                <CmsIcon name="chevron-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
