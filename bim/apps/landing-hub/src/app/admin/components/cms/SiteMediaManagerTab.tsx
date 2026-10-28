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

interface SiteMediaManagerTabProps {
  siteCode: string;
  siteName: string;
}

export function SiteMediaManagerTab({ siteCode, siteName }: SiteMediaManagerTabProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/landing/media/list?site=${siteCode}`);
      const data = await res.json();
      if (data.assets) setAssets(data.assets);
    } catch (e) {
      console.error('Failed to load site media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [siteCode]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('site_code', siteCode);
      const res = await fetch('/api/landing/media/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tải lên thất bại');
      await loadAssets();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải file lên');
    } finally {
      setUploading(false);
    }
  };

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.slot && a.slot.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-black tracking-wider text-sky-800 uppercase">
            Supabase Media Storage
          </span>
          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Thư viện Media — {siteName}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Tất cả hình ảnh, tài liệu và brochure được lưu trữ trực tiếp trong Supabase PostgreSQL (
            <code>cic_landing.landing_media_assets</code>).
          </p>
        </div>

        <label className="cursor-pointer rounded-lg bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-950">
          {uploading ? 'Đang tải lên Supabase...' : '+ Tải tệp mới lên Supabase'}
          <input
            type="file"
            accept="image/*,.pdf,.rar,.zip"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
          Lỗi: {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên file hoặc mã vị trí (slot)..."
          className="w-full max-w-md rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
        />
        <span className="text-xs font-bold text-slate-500">
          Hiển thị <strong>{filtered.length}</strong> / {assets.length} tệp tin
        </span>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm font-bold text-slate-400">
          Đang tải thư viện Media từ Supabase…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item) => {
            const isImg = item.mime.startsWith('image/');
            return (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center bg-slate-100 p-3">
                  {isImg ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="h-full w-full object-contain transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <span className="rounded bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 uppercase">
                      FILE
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <div className="truncate text-xs font-bold text-slate-800" title={item.name}>
                      {item.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>{(item.size / 1024).toFixed(1)} KB</span>
                      {item.slot && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                          {item.slot}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.url);
                      setCopiedId(item.id);
                      setTimeout(() => setCopiedId(null), 1800);
                    }}
                    className="mt-2.5 w-full rounded border border-slate-200 bg-slate-50 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800"
                  >
                    {copiedId === item.id ? 'Đã sao chép URL' : 'Sao chép đường dẫn'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
