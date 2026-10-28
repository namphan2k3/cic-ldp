'use client';

import React from 'react';

interface CmsPublishConfirmModalProps {
  isOpen: boolean;
  locale: string;
  isPublishing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CmsPublishConfirmModal({
  isOpen,
  locale,
  isPublishing,
  onClose,
  onConfirm,
}: CmsPublishConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-3">
          <h3 id="publish-modal-title" className="text-lg font-bold text-slate-900">
            Xác nhận xuất bản nội dung lên Website
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Ngôn ngữ áp dụng: <strong className="uppercase">{locale}</strong>
          </p>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          Toàn bộ bản nháp của các mục trong ngôn ngữ{' '}
          <strong className="uppercase">{locale}</strong> sẽ được cập nhật trực tiếp lên
          website công khai ngay lập tức và lưu lại một mốc trong lịch sử phiên bản.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isPublishing}
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isPublishing}
            onClick={onConfirm}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPublishing ? 'Đang xuất bản…' : 'Đồng ý xuất bản ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
