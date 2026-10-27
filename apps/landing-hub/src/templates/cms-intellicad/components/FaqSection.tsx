'use client';

import React, { useState, useMemo } from 'react';
import { CmsIcon } from './CmsIcon';

interface FaqSectionProps {
  payload: Record<string, unknown>;
  locale: string;
}

export function FaqSection({ payload, locale }: FaqSectionProps) {
  const faq = payload as Record<string, any>;
  const categories: Record<string, string> = faq.categories || {
    all: 'Tất cả',
    licensing: 'Bản quyền & Cấp phép',
    technical: 'Kỹ thuật & Tính năng',
    compatibility: 'Tương thích & File DWG',
    purchase: 'Mua hàng & Thanh toán',
  };

  const items: Array<any> = faq.items || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="scroll-mt-32 border-t border-slate-200 bg-white py-10 sm:py-14 lg:scroll-mt-36">
      <span id="hoi-dap" className="sr-only" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-800">
            <CmsIcon name="help-circle" className="h-3.5 w-3.5 text-blue-700" />
            <span>{faq.eyebrow || 'Giải Đáp Thắc Mắc Phổ Biến'}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {faq.title || 'CÂU HỎI THƯỜNG GẶP VỀ CMS INTELLICAD'}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            {faq.description || 'Tìm hiểu nhanh về chính sách bản quyền vĩnh viễn, độ tương thích và phương thức triển khai.'}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <CmsIcon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={faq.search_placeholder || 'Tìm kiếm câu hỏi hoặc từ khóa kỹ thuật...'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Object.entries(categories).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === id
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 py-10 text-center text-sm font-medium text-slate-600">
            Không tìm thấy câu hỏi phù hợp với &quot;{searchQuery}&quot;.
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={index}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-blue-500 bg-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left text-sm font-bold text-slate-900 transition-colors hover:text-blue-700 sm:text-base"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono text-xs font-bold text-blue-800">
                      ?
                    </span>
                    {item.question}
                  </span>
                  {isOpen ? (
                    <CmsIcon name="chevron-up" className="h-5 w-5 shrink-0 text-blue-700" />
                  ) : (
                    <CmsIcon name="chevron-down" className="h-5 w-5 shrink-0 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-slate-100 px-5 pb-6 pt-1 text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">
                    <p>{item.answer}</p>
                    {item.warning && (
                      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <CmsIcon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>
                          <strong>{faq.warning_title || 'Lưu ý:'}</strong> {item.warning}
                        </span>
                      </div>
                    )}
                    {item.cta && (
                      <div className="pt-2">
                        <a
                          href={item.href || '#dang-ky'}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-900"
                        >
                          <span>{item.cta}</span>
                          <CmsIcon name="arrow-right" className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
