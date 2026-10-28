'use client';

import React, { useState, useEffect } from 'react';
import { CmsIcon } from './CmsIcon';
import { ComparisonPdfModal } from './ComparisonPdfModal';

interface ComparisonSectionProps {
  payload: Record<string, unknown>;
  locale: string;
}

export function ComparisonSection({ payload, locale }: ComparisonSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CMS_TOGGLE_MODAL' && e.data?.modal === 'comparison_pdf') {
        setIsModalOpen(Boolean(e.data.open));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const compare = payload as Record<string, any>;
  const points = compare.points || [];
  const headers = compare.headers || ['Tính Năng / Tiêu Chí', 'IntelliCAD PE', 'IntelliCAD PE Plus', 'AutoCAD® LT', 'AutoCAD® Full'];
  const rows = compare.rows || [];

  return (
    <section id="comparison" className="scroll-mt-32 border-t border-slate-200 bg-white py-10 sm:py-14 lg:scroll-mt-36">
      <span id="so-sanh-autocad" className="sr-only" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
              <CmsIcon name="shield-check" className="h-3.5 w-3.5 text-blue-700" />
              <span>{compare.eyebrow || 'Bảng Phân Tích & Đối Chiếu'}</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 sm:text-2xl">
              {compare.title || 'SO SÁNH CMS INTELLICAD VỚI AUTOCAD®'}
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">{compare.description}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              if (typeof window !== 'undefined' && window.parent !== window) {
                window.parent.postMessage(
                  { type: 'CMS_MODAL_OPENED', sectionCode: 'comparison', modal: 'comparison_pdf' },
                  '*'
                );
              }
            }}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-sm transition-all hover:bg-amber-400"
          >
            <CmsIcon name="file-text" className="h-4 w-4" />
            <span>{compare.pdf_button || 'Xem Bảng So Sánh (PDF)'}</span>
          </button>
        </div>

        {/* 3 Point Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {points.map((point: any, idx: number) => (
            <article
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:border-blue-300 hover:bg-white"
            >
              <div>
                <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-blue-800 sm:text-xs">
                  {point.category}
                </span>
                <h3 className="mb-1.5 text-[15px] font-extrabold text-slate-900 sm:text-base">{point.title}</h3>
                <p className="mb-3 text-[13px] font-medium leading-relaxed text-slate-600 sm:text-sm">
                  {point.description}
                </p>
              </div>
              <div className="space-y-1 border-t border-slate-200/80 pt-2.5 text-[13px] sm:text-sm">
                <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-1.5 gap-y-0.5 font-bold">
                  <span className="flex items-center gap-1 text-blue-900">
                    <CmsIcon name="check-circle-2" className="h-3.5 w-3.5 shrink-0 text-blue-700" />
                    IntelliCAD:
                  </span>
                  <span className="font-semibold text-slate-900">{point.intellicad}</span>
                </div>
                <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-1.5 gap-y-0.5 font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <CmsIcon name="info" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    AutoCAD®:
                  </span>
                  <span className="text-slate-600">{point.autocad}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Comparison Matrix Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-lg sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <h3 className="flex items-center gap-2 font-bold text-white">
              <CmsIcon name="sparkles" className="h-4 w-4 text-amber-400" />
              <span>{compare.matrix_title || 'Ma Trận Tính Năng Trực Quan'}</span>
            </h3>
            <span className="hidden text-[11px] font-medium text-slate-400 sm:inline">{compare.source}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-[13px] sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400 sm:text-xs">
                  {headers.map((header: string, index: number) => (
                    <th
                      key={index}
                      className={`w-1/5 p-2.5 ${index === 0 ? 'w-2/5' : 'text-center'} ${
                        index === 1 ? 'bg-blue-900/40 font-black text-blue-300' : ''
                      } ${index === 2 ? 'bg-blue-950/60 font-black text-blue-200' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs font-medium sm:text-[13px]">
                {rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="transition-colors hover:bg-slate-800/50">
                    <td className="p-2.5 font-semibold text-slate-200">{row.feature}</td>
                    {['pe', 'pe_plus', 'autocad_lt', 'autocad_full'].map((col) => {
                      const val = row[col];
                      return (
                        <td
                          key={col}
                          className={`p-2.5 text-center ${col === 'pe' ? 'bg-blue-900/20' : ''} ${
                            col === 'pe_plus' ? 'bg-blue-950/30' : ''
                          }`}
                        >
                          {val === true ? (
                            <CmsIcon name="check" className="mx-auto h-4 w-4 text-emerald-400" />
                          ) : val === false ? (
                            <CmsIcon name="x" className="mx-auto h-3.5 w-3.5 text-slate-500" />
                          ) : (
                            <span className="inline-block whitespace-nowrap rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-200 sm:text-[13px]">
                              {val}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ComparisonPdfModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalData={compare.modal}
      />
    </section>
  );
}
