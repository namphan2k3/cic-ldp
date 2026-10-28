import React from 'react';
import { CmsIcon } from './CmsIcon';

interface TrialDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLisp?: boolean;
  outcomeType?: 'message_only' | 'download_modal';
  customTitle?: string;
  customMessage?: string;
  downloadUrl?: string | null;
  downloadLabel?: string | null;
  modalData?: {
    trial_modal_title?: string;
    trial_modal_description?: string;
    trial_download?: string;
    lisp_modal_title?: string;
    lisp_modal_description?: string;
    lisp_download?: string;
    trial_close?: string;
  };
}

export function TrialDownloadModal({
  isOpen,
  onClose,
  isLisp = false,
  outcomeType = 'download_modal',
  customTitle,
  customMessage,
  downloadUrl,
  downloadLabel,
  modalData,
}: TrialDownloadModalProps) {
  if (!isOpen) return null;

  const data = modalData || {};
  const isDownloadMode =
    outcomeType === 'download_modal' && Boolean(downloadUrl);

  const title =
    customTitle ||
    (isDownloadMode
      ? isLisp
        ? data.lisp_modal_title || 'Tải Bộ Công Cụ & Thư Viện LISP Miễn Phí'
        : data.trial_modal_title || 'Bộ Tài Liệu & Hướng Dẫn Cài Đặt Đã Sẵn Sàng!'
      : 'Đăng Ký Tư Vấn Thành Công!');

  const description =
    customMessage ||
    (isDownloadMode
      ? isLisp
        ? data.lisp_modal_description ||
          'Cảm ơn Quý khách. Gói thư viện LISP hữu ích đã được chuẩn bị. Quý khách vui lòng bấm nút bên dưới để tải về ngay.'
        : data.trial_modal_description ||
          'Cảm ơn Quý khách đã đăng ký trải nghiệm. Quý khách có thể tải tài liệu phân tích kỹ thuật hoặc bộ cài trực tiếp bên dưới:'
      : 'Cảm ơn Quý khách! Chuyên viên kỹ thuật CIC đã ghi nhận yêu cầu và sẽ liên hệ hỗ trợ sớm nhất.');

  const buttonText =
    downloadLabel ||
    (isLisp
      ? data.lisp_download || 'Tải Trọn Bộ LISP (.RAR)'
      : data.trial_download || 'Tải Tài Liệu / Bộ Cài');

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <CmsIcon name="x" className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CmsIcon
            name={isDownloadMode ? 'download' : 'check-circle'}
            className="h-7 w-7"
          />
        </div>

        <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed font-medium text-slate-600">
          {description}
        </p>

        {isDownloadMode && downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-900"
          >
            <CmsIcon name="download" className="h-4 w-4 text-amber-400" />
            <span>{buttonText}</span>
          </a>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`cursor-pointer text-xs font-bold ${
            isDownloadMode
              ? 'mt-3 text-slate-500 hover:text-slate-800'
              : 'mt-6 w-full rounded-xl bg-slate-950 py-3 text-white hover:bg-blue-900'
          }`}
        >
          {data.trial_close || 'Đóng cửa sổ'}
        </button>
      </div>
    </div>
  );
}
