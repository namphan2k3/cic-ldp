'use client';

import React, { useState } from 'react';
import {
  exportDeployPackageAction,
  pickFolderDialogAction,
} from '../../actions';

export interface ExportDeployResult {
  packageName: string;
  outputPath: string;
  sitesCount: number;
  sectionsCount: number;
  mediaCount: number;
  formsCount: number;
}

interface ExportDeployModalProps {
  isOpen: boolean;
  targetSiteCode: string; // 'ALL' or siteCode
  targetSiteName: string;
  onClose: () => void;
  onExportSuccess: (result: ExportDeployResult) => void;
}

export function ExportDeployModal({
  isOpen,
  targetSiteCode,
  targetSiteName,
  onClose,
  onExportSuccess,
}: ExportDeployModalProps) {
  const [destDir, setDestDir] = useState<string>('');
  const [pickingFolder, setPickingFolder] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const packageFolderName =
    targetSiteCode && targetSiteCode !== 'ALL'
      ? `deploy-${targetSiteCode}`
      : 'deploy-cic-landing-hub';

  const handleBrowseFolder = async () => {
    setPickingFolder(true);
    setErrorMsg(null);
    try {
      const res = await pickFolderDialogAction();
      if (res.path) {
        setDestDir(res.path);
      }
    } catch {
      setErrorMsg('Không thể mở hộp thoại chọn thư mục. Bạn có thể nhập trực tiếp đường dẫn bên dưới.');
    } finally {
      setPickingFolder(false);
    }
  };

  const handleConfirmExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destDir.trim()) {
      setErrorMsg('Vui lòng chọn hoặc nhập thư mục đích để lưu gói triển khai.');
      return;
    }
    setExporting(true);
    setErrorMsg(null);
    try {
      const res = await exportDeployPackageAction(targetSiteCode, destDir.trim());
      onExportSuccess({
        packageName: res.packageName,
        outputPath: res.outputPath,
        sitesCount: res.sitesCount,
        sectionsCount: res.sectionsCount,
        mediaCount: res.mediaCount,
        formsCount: res.formsCount,
      });
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Không thể xuất gói vào thư mục đã chọn. Vui lòng kiểm tra quyền ghi của thư mục.'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="rounded-full border border-orange-200 bg-[#fff7ed] px-2.5 py-0.5 text-[10px] font-bold text-[#c2410c] uppercase">
              Đóng gói triển khai lên Host
            </span>
            <h3 className="mt-1.5 text-lg font-bold text-[#0b1b36]">
              Xuất gói triển khai: {targetSiteName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleConfirmExport} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0b1b36]">
              Chọn thư mục lưu gói triển khai trên máy của bạn:
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={destDir}
                onChange={(e) => setDestDir(e.target.value)}
                placeholder="Ví dụ: D:\Deploy hoặc C:\Users\Admin\Desktop..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#ea580c] focus:outline-none"
              />
              <button
                type="button"
                disabled={pickingFolder || exporting}
                onClick={handleBrowseFolder}
                className="cursor-pointer rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#0b1b36] transition hover:bg-slate-200 disabled:opacity-50"
              >
                {pickingFolder ? 'Đang mở...' : 'Chọn thư mục...'}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Hệ thống sẽ tạo thư mục con{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-slate-800">
                {packageFolderName}
              </code>{' '}
              bên trong thư mục bạn chọn.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
            <div className="font-bold text-[#0b1b36]">Thành phần đóng gói sẵn trong thư mục:</div>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-[11px]">
              <li>
                <strong>Trang chính Landing Page (VI/EN)</strong> tại đường dẫn gốc <code>/</code>
              </li>
              <li>
                <strong>Trang Quản trị riêng</strong> tại <code>/cms</code> (hoặc{' '}
                <code>/admin/{targetSiteCode === 'ALL' ? '<siteCode>' : targetSiteCode}</code>) và{' '}
                <strong>Trang Quản trị tổng</strong> tại <code>/admin</code>
              </li>
              <li>
                <strong>Bộ tự động nạp Database (<code>seed/auto-seed.mjs</code>)</strong>: Tự động khởi tạo bảng và nạp toàn bộ nội dung, cấu hình Form, hình ảnh vào Database chung trên Host
              </li>
              <li>
                <strong>Script chạy 1 chạm</strong>: <code>start.sh</code> (Linux Host),{' '}
                <code>start.bat</code> (Windows Host), <code>ecosystem.config.cjs</code> (PM2)
              </li>
            </ul>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
            <a
              href={`/api/landing/export?site=${targetSiteCode}`}
              download
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Chỉ tải file dữ liệu Seed (.json)
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={exporting}
                className="cursor-pointer rounded-lg bg-[#ea580c] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#c2410c] disabled:opacity-50"
              >
                {exporting ? 'Đang đóng gói...' : 'Xuất vào thư mục đã chọn'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
