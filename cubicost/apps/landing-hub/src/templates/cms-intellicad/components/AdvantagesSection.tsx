import React from 'react';
import { CmsIcon } from './CmsIcon';

interface AdvantagesSectionProps {
  payload: Record<string, unknown>;
  locale: string;
}

export function AdvantagesSection({ payload, locale }: AdvantagesSectionProps) {
  const advantageIcons = [
    ['zap', 'text-blue-700'],
    ['layout', 'text-blue-900'],
    ['file-check', 'text-slate-900'],
    ['box', 'text-blue-800'],
    ['code', 'text-blue-700'],
    ['users', 'text-blue-900'],
  ];

  const items =
    (payload.items as Array<{
      title: string;
      text?: string;
      description?: string;
    }>) || [];

  const bgUrl =
    (payload.background_image_url as string) ||
    '/api/landing/media/cms-intellicad/images/cad_engineers_bg_1785984144734.jpg';

  return (
    <section
      id="advantages"
      className="relative scroll-mt-32 overflow-hidden border-t border-slate-200 bg-slate-100/90 py-12 sm:py-16 lg:scroll-mt-36"
    >
      <span id="uu-diem" className="sr-only" />
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[.10] mix-blend-multiply contrast-125"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      ></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] opacity-10 [background-size:24px_24px]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-800">
            <CmsIcon name="sparkles" className="h-3.5 w-3.5 text-blue-700" />
            <span>
              {(payload.eyebrow as string) ||
                (locale === 'en'
                  ? 'Key Advantages of CMS IntelliCAD'
                  : 'Ưu Điểm Nổi Bật Của CMS IntelliCAD')}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase sm:text-3xl lg:text-4xl">
            {(payload.title as string) ||
              (locale === 'en'
                ? '6 REASONS ENTERPRISES CHOOSE CMS INTELLICAD'
                : '6 LÝ DO DOANH NGHIỆP LỰA CHỌN CMS INTELLICAD')}
          </h2>
          <p className="mt-2.5 text-sm font-medium text-slate-600 sm:text-base">
            {(payload.description as string) || ''}
          </p>
        </div>

        <div className="mb-10 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const iconConfig = advantageIcons[index % advantageIcons.length];
            return (
              <article
                key={index}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-blue-500 hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-2.5 transition-colors group-hover:bg-blue-100">
                      <CmsIcon
                        name={iconConfig[0]}
                        className={`h-5 w-5 ${iconConfig[1]}`}
                      />
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-extrabold text-slate-700">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
                    {item.text || item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="text-center">
          <a
            href="#dang-ky"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:scale-105 hover:bg-blue-900 active:scale-95 sm:text-sm"
          >
            <span>{locale === 'en' ? 'TRY FREE NOW' : 'TRẢI NGHIỆM MIỄN PHÍ NGAY'}</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
