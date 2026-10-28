'use client';

import React, { useState, useEffect } from 'react';

interface MediaAsset {
  id: string;
  name: string;
  path: string;
  mime: string;
  size: number;
  slot: string | null;
  alt: string | null;
  url: string;
  updated_at: string;
}

interface MediaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  siteCode: string;
  onSelectImage?: (url: string) => void;
}

export function MediaDrawer({
  isOpen,
  onClose,
  siteCode,
  onSelectImage,
}: MediaDrawerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/landing/media/list?site=${siteCode}`);
      const data = await res.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch (e) {
      console.error('Failed to load media list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, siteCode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('site_code', siteCode);

      const res = await fetch('/api/landing/media/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload thất bại');

      await fetchAssets();
      if (onSelectImage && json.asset?.url) {
        onSelectImage(json.asset.url);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.slot && a.slot.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/50 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Thư Viện Phương Tiện Supabase
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý và chọn ảnh lưu trữ trực tiếp trong PostgreSQL/Supabase ({siteCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Đóng
          </button>
        </div>

        {/* Upload & Search Toolbar */}
        <div className="space-y-3 border-b border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 p-4 text-center transition-colors hover:border-blue-500 hover:bg-blue-50">
            <div>
              <span className="text-xs font-bold text-blue-800">
                {uploading ? 'Đang tải lên Supabase...' : '+ Tải tệp hoặc hình ảnh mới lên'}
              </span>
              <p className="text-[10px] text-slate-500">Hỗ trợ PNG, JPG, WEBP, SVG, PDF</p>
            </div>
            <input
              type="file"
              accept="image/*,.pdf,.rar,.zip"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          {uploadError && (
            <p className="text-xs font-bold text-rose-600">{uploadError}</p>
          )}

          <input
            type="text"
            placeholder="Tìm theo tên file hoặc slot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Đang tải danh sách ảnh...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Không tìm thấy file nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((item) => {
                const isImage = item.mime.startsWith('image/');
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectImage) {
                        onSelectImage(item.url);
                        onClose();
                      }
                    }}
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-slate-100 p-2">
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-contain transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <span className="rounded bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                          FILE
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="truncate text-[11px] font-bold text-slate-800" title={item.name}>
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{(item.size / 1024).toFixed(0)} KB</span>
                        {item.slot && (
                          <span className="rounded bg-blue-100 px-1 text-blue-700">
                            {item.slot}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
          <span>Tổng cộng: {filtered.length} files</span>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
