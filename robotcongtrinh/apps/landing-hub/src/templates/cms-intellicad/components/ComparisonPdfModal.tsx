import React from 'react';
import { CmsIcon } from './CmsIcon';

interface ComparisonPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData?: {
    title?: string;
    publisher?: string;
    close?: string;
    overview_title?: string;
    overview?: string;
    sections_title?: string;
    sections?: Array<{ title: string; text: string }>;
    agent?: string;
    company?: string;
    note?: string;
    download?: string;
    pdf_url?: string;
  };
}

export function ComparisonPdfModal({ isOpen, onClose, modalData }: ComparisonPdfModalProps) {
  if (!isOpen) return null;

  const data = modalData || {
    title: 'Bảng So Sánh Tính Năng Chi Tiết (PDF)',
    publisher: 'Phát hành bởi TechAZ / ITC Solutions',
    close: 'Đóng',
    overview_title: 'Tổng Quan Báo Cáo Kỹ Thuật',
    overview: 'Tài liệu phân tích chuyên sâu các tiêu chí kỹ thuật giữa CMS IntelliCAD và AutoCAD, bao gồm độ tương thích DWG, tốc độ dựng hình 2D/3D và khả năng tích hợp LISP/API.',
    sections_title: 'Nội Dung Phân Tích Chính',
    sections: [
      { title: 'Tương thích định dạng DWG/DXF', text: 'Mở và lưu trực tiếp các phiên bản DWG từ AutoCAD 2.5 đến 2024 không qua chuyển đổi.' },
      { title: 'Hệ thống lệnh & Phím tắt', text: 'Giữ nguyên 100% lệnh tắt và cú pháp quen thuộc của kỹ sư CAD.' },
      { title: 'Hỗ trợ LISP, FAS, VLX, .NET', text: 'Chạy trực tiếp các mã tùy biến mà không cần biên dịch lại.' },
      { title: 'Mô hình hóa ACIS Solid 3D', text: 'Đầy đủ các lệnh tạo khối, cắt ghép Boolean và xuất bản vẽ kỹ thuật.' },
    ],
    agent: 'Đại diện phân phối ủy quyền tại Việt Nam:',
    company: 'Công ty Cổ phần Công nghệ và Tư vấn CIC',
    note: 'Bản quyền tài liệu thuộc CIC và IntelliCAD Technology Consortium.',
    download: 'Tải Báo Cáo Kỹ Thuật (PDF)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500 p-2 text-slate-950">
              <CmsIcon name="file-text" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{data.title}</h3>
              <p className="text-xs font-medium text-amber-400">{data.publisher}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={data.close}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <CmsIcon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-6 text-xs font-medium leading-relaxed text-slate-800 sm:text-sm">
          <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <h4 className="flex items-center gap-2 text-sm font-extrabold text-blue-950">
              <CmsIcon name="shield-check" className="h-4 w-4 text-blue-700" />
              {data.overview_title}
            </h4>
            <p className="text-xs">{data.overview}</p>
          </div>

          <div className="space-y-4">
            <h4 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-slate-900">
              {data.sections_title}
            </h4>
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              {(data.sections || []).map((item, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="mb-1 block font-bold text-slate-900">{item.title}</strong>
                  <span className="text-slate-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-4 text-xs text-slate-700">
            <div>
              <span className="block font-bold text-slate-900">{data.agent}</span>
              <span>{data.company}</span>
            </div>
            <span className="font-mono font-bold text-slate-500">PDF • 3 Pages</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row">
          <span className="text-center text-xs font-medium text-slate-500 sm:text-left">{data.note}</span>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:w-auto"
            >
              {data.close}
            </button>
            <a
              href={
                data.pdf_url ||
                '/api/landing/media/cms-intellicad/downloads/TechAZ_So_Sanh_IntelliCAD_AutoCAD.pdf'
              }
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-800 sm:w-auto"
            >
              <CmsIcon name="download" className="h-4 w-4" />
              <span>{data.download}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
