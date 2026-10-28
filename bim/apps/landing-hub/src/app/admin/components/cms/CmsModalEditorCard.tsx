'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CmsModalEditorCardProps {
  siteCode: string;
  locale: string;
  payloadsMap: Record<string, Record<string, any>>;
  onChangeSectionPayload: (sectionCode: string, next: Record<string, any>) => void;
  onOpenMediaForSlot: (sectionCode: string, slotKey: string) => void;
  onToggleIframeModal: (
    modal: 'comparison_pdf' | 'trial_download',
    open: boolean,
    mode?: 'trial' | 'lisp'
  ) => void;
  onClosePanel: () => void;
}

export function CmsModalEditorCard({
  siteCode,
  locale,
  payloadsMap,
  onChangeSectionPayload,
  onOpenMediaForSlot,
  onToggleIframeModal,
  onClosePanel,
}: CmsModalEditorCardProps) {
  const hasComparison = Boolean(payloadsMap['comparison']);
  const hasCatalogPdf = Boolean(payloadsMap['catalog']);
  const hasConsultationModal = Boolean(payloadsMap['consultation_form']);

  const defaultTab = hasComparison
    ? 'comparison_pdf'
    : hasCatalogPdf
    ? 'catalog_pdf'
    : 'trial_download';

  const [activeModalTab, setActiveModalTab] = useState<
    'comparison_pdf' | 'catalog_pdf' | 'trial_download'
  >(defaultTab);
  const [previewOpen, setPreviewOpen] = useState(false);

  const comparisonPayload = payloadsMap['comparison'] || {};
  const compModal = (comparisonPayload.modal || {}) as Record<string, any>;
  const compSections: Array<{ title: string; text: string }> = Array.isArray(compModal.sections)
    ? compModal.sections
    : [];

  const updateCompModal = (patch: Record<string, any>) => {
    onChangeSectionPayload('comparison', {
      ...comparisonPayload,
      modal: {
        ...compModal,
        ...patch,
      },
    });
  };

  const catalogPayload = payloadsMap['catalog'] || {};
  const updateCatalog = (patch: Record<string, any>) => {
    onChangeSectionPayload('catalog', {
      ...catalogPayload,
      ...patch,
    });
  };

  const consultationPayload = payloadsMap['consultation_form'] || {};
  const formModal = (consultationPayload.modal || {}) as Record<string, any>;
  const updateFormModal = (patch: Record<string, any>) => {
    onChangeSectionPayload('consultation_form', {
      ...consultationPayload,
      modal: {
        ...formModal,
        ...patch,
      },
    });
  };

  return (
    <div className="mb-4 rounded-xl border border-slate-300 bg-white p-4 shadow-md">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold text-white uppercase">
            Cấu hình Popup / Modal &amp; Tài liệu
          </span>

          {hasComparison && (
            <button
              type="button"
              onClick={() => setActiveModalTab('comparison_pdf')}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeModalTab === 'comparison_pdf'
                  ? 'bg-[#0b1b36] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Popup Tài Liệu So Sánh (PDF)
            </button>
          )}

          {hasCatalogPdf && (
            <button
              type="button"
              onClick={() => setActiveModalTab('catalog_pdf')}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeModalTab === 'catalog_pdf'
                  ? 'bg-[#0b1b36] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Nút &amp; File Tải Hồ Sơ Năng Lực / Catalog (PDF)
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveModalTab('trial_download')}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeModalTab === 'trial_download'
                ? 'bg-[#0b1b36] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Popup / Kịch Bản Sau Khi Gửi Form
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeModalTab === 'comparison_pdf' && hasComparison && (
            <button
              type="button"
              onClick={() => {
                const next = !previewOpen;
                setPreviewOpen(next);
                onToggleIframeModal('comparison_pdf', next);
              }}
              className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              {previewOpen
                ? 'Đóng Popup trên khung Preview'
                : 'Bật xem Popup trên khung Preview'}
            </button>
          )}

          {activeModalTab === 'trial_download' && hasConsultationModal && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onToggleIframeModal('trial_download', true, 'trial')}
                className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Xem thử Popup Dùng thử
              </button>
              <button
                type="button"
                onClick={() => onToggleIframeModal('trial_download', true, 'lisp')}
                className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Xem thử Popup LISP
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClosePanel}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Thu gọn
          </button>
        </div>
      </div>

      {/* TAB 1: COMPARISON PDF MODAL */}
      {activeModalTab === 'comparison_pdf' && hasComparison && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                Chữ trên nút mở Popup ngoài trang
              </label>
              <input
                type="text"
                value={comparisonPayload.pdf_button || ''}
                onChange={(e) =>
                  onChangeSectionPayload('comparison', {
                    ...comparisonPayload,
                    pdf_button: e.target.value,
                  })
                }
                placeholder="XEM TÀI LIỆU SO SÁNH (PDF)"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                Tiêu đề chính của Popup
              </label>
              <input
                type="text"
                value={compModal.title || ''}
                onChange={(e) => updateCompModal({ title: e.target.value })}
                placeholder="Tài Liệu So Sánh CMS IntelliCAD và AutoCAD®"
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                Đơn vị phát hành (Dòng phụ dưới tiêu đề)
              </label>
              <input
                type="text"
                value={compModal.publisher || ''}
                onChange={(e) => updateCompModal({ publisher: e.target.value })}
                placeholder="Phát hành chính thức bởi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* PDF File & Download Button Row */}
          <div className="grid gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label className="mb-1 block text-[11px] font-extrabold text-blue-950 uppercase">
                Đường dẫn File PDF tải về khi bấm nút trong Popup
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={
                    compModal.pdf_url ||
                    '/api/landing/media/cms-intellicad/downloads/TechAZ_So_Sanh_IntelliCAD_AutoCAD.pdf'
                  }
                  onChange={(e) => updateCompModal({ pdf_url: e.target.value })}
                  className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => onOpenMediaForSlot('comparison', 'modal.pdf_url')}
                  className="cursor-pointer whitespace-nowrap rounded-lg bg-[#0b1b36] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Chọn File từ Thư viện
                </button>
              </div>
            </div>
            <div className="sm:col-span-4">
              <label className="mb-1 block text-[11px] font-extrabold text-blue-950 uppercase">
                Nhãn nút Tải PDF trong Popup
              </label>
              <input
                type="text"
                value={compModal.download || ''}
                onChange={(e) => updateCompModal({ download: e.target.value })}
                placeholder="NHẬN FILE TÀI LIỆU PDF (MIỄN PHÍ)"
                className="w-full rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Overview & Company Info */}
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="space-y-2 sm:col-span-6">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                  Tiêu đề khung Tổng quan
                </label>
                <input
                  type="text"
                  value={compModal.overview_title || ''}
                  onChange={(e) => updateCompModal({ overview_title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                  Nội dung mô tả Tổng quan
                </label>
                <textarea
                  rows={3}
                  value={compModal.overview || ''}
                  onChange={(e) => updateCompModal({ overview: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="grid gap-2 sm:col-span-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                  Nhãn Đại lý / Đơn vị
                </label>
                <input
                  type="text"
                  value={compModal.agent || ''}
                  onChange={(e) => updateCompModal({ agent: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                  Tên Công ty &amp; Hotline
                </label>
                <input
                  type="text"
                  value={compModal.company || ''}
                  onChange={(e) => updateCompModal({ company: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold text-slate-700 uppercase">
                  Ghi chú chân Popup
                </label>
                <input
                  type="text"
                  value={compModal.note || ''}
                  onChange={(e) => updateCompModal({ note: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 6 Section Items inside PDF Modal */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase">
                  Các hạng mục phân tích trong Popup ({compSections.length} mục)
                </span>
                <input
                  type="text"
                  value={compModal.sections_title || ''}
                  onChange={(e) => updateCompModal({ sections_title: e.target.value })}
                  placeholder="Tiêu đề danh sách..."
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  updateCompModal({
                    sections: [
                      ...compSections,
                      {
                        title: `${compSections.length + 1}. Hạng mục mới:`,
                        text: 'Mô tả chi tiết...',
                      },
                    ],
                  })
                }
                className="cursor-pointer rounded-lg bg-[#0b1b36] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
              >
                + Thêm hạng mục
              </button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {compSections.map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={sec.title || ''}
                      onChange={(e) => {
                        const next = [...compSections];
                        next[idx] = { ...sec, title: e.target.value };
                        updateCompModal({ sections: next });
                      }}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateCompModal({
                          sections: compSections.filter((_, i) => i !== idx),
                        })
                      }
                      className="cursor-pointer whitespace-nowrap px-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800"
                      title="Xóa mục này"
                    >
                      Xóa
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={sec.text || ''}
                    onChange={(e) => {
                      const next = [...compSections];
                      next[idx] = { ...sec, text: e.target.value };
                      updateCompModal({ sections: next });
                    }}
                    className="w-full rounded border border-slate-200 p-1.5 text-xs text-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CATALOG PDF DOWNLOAD (Robot Cong Trinh & Catalog pages) */}
      {activeModalTab === 'catalog_pdf' && hasCatalogPdf && (
        <div className="mt-4 grid gap-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label className="mb-1 block text-[11px] font-extrabold text-blue-950 uppercase">
              Nhãn nút Tải Hồ Sơ Năng Lực &amp; Catalog (PDF)
            </label>
            <input
              type="text"
              value={
                catalogPayload.download_profile ||
                'Tải toàn bộ tài liệu hồ sơ năng lực & catalog (PDF)'
              }
              onChange={(e) => updateCatalog({ download_profile: e.target.value })}
              className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
            />
          </div>
          <div className="sm:col-span-7">
            <label className="mb-1 block text-[11px] font-extrabold text-blue-950 uppercase">
              Đường dẫn File PDF Hồ Sơ Năng Lực / Catalog
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={
                  catalogPayload.profile_file ||
                  `/api/landing/media/${siteCode}/file/robot-xay-dung.pdf`
                }
                onChange={(e) => updateCatalog({ profile_file: e.target.value })}
                className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 font-mono text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={() => onOpenMediaForSlot('catalog', 'profile_file')}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-[#0b1b36] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Chọn File PDF từ Thư viện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POST-SUBMISSION TRIAL / LISP MODAL */}
      {activeModalTab === 'trial_download' && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800">
            <div>
              <strong>Luồng Điều Kiện Động (Workflow):</strong> Để cấu hình chọn phương án nào trong Form thì chỉ hiện thông báo thành công, phương án nào thì mở Popup cho tải file (`.exe`, `.pdf`, `.rar`), bạn thiết lập trực tiếp tại tab{' '}
              <strong>Cấu hình Form &amp; Sheets</strong>.
            </div>
            <Link
              href={`/admin/${siteCode}?lang=${locale}&tab=forms`}
              className="whitespace-nowrap rounded-lg bg-[#ea580c] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#c2410c]"
            >
              Mở Luồng Điều Kiện Form
            </Link>
          </div>

          {hasConsultationModal && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="text-xs font-black text-[#0b1b36] uppercase">
                  Popup Mặc định: Tải Dùng Thử (Trial)
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Tiêu đề Popup
                  </label>
                  <input
                    type="text"
                    value={formModal.trial_modal_title || ''}
                    onChange={(e) => updateFormModal({ trial_modal_title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Mô tả trong Popup
                  </label>
                  <textarea
                    rows={2}
                    value={formModal.trial_modal_description || ''}
                    onChange={(e) =>
                      updateFormModal({ trial_modal_description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Nhãn nút Tải về
                  </label>
                  <input
                    type="text"
                    value={formModal.trial_download || ''}
                    onChange={(e) => updateFormModal({ trial_download: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="text-xs font-black text-[#0b1b36] uppercase">
                  Popup Mặc định: Nhận Bộ LISP
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Tiêu đề Popup LISP
                  </label>
                  <input
                    type="text"
                    value={formModal.lisp_modal_title || ''}
                    onChange={(e) => updateFormModal({ lisp_modal_title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Mô tả trong Popup LISP
                  </label>
                  <textarea
                    rows={2}
                    value={formModal.lisp_modal_description || ''}
                    onChange={(e) =>
                      updateFormModal({ lisp_modal_description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Nhãn nút Tải LISP
                  </label>
                  <input
                    type="text"
                    value={formModal.lisp_download || ''}
                    onChange={(e) => updateFormModal({ lisp_download: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
