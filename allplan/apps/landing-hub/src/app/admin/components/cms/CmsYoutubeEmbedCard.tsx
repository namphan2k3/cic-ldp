'use client';

import React from 'react';

interface CmsYoutubeEmbedCardProps {
  sectionCode: string;
  payload: Record<string, any>;
  onChangePayload: (updated: Record<string, any>) => void;
}

function extractYoutubeId(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : trimmed;
}

export function CmsYoutubeEmbedCard({
  sectionCode,
  payload,
  onChangePayload,
}: CmsYoutubeEmbedCardProps) {
  if (sectionCode !== 'video_slider' && sectionCode !== 'infrastructure') {
    return null;
  }

  const items = Array.isArray(payload.items) ? payload.items : [];

  const updateSlide = (idx: number, field: 'youtube_id' | 'caption', value: string) => {
    const next = [...items];
    const cleanId = field === 'youtube_id' ? extractYoutubeId(value) : next[idx]?.youtube_id;
    next[idx] = {
      ...next[idx],
      ...(field === 'youtube_id'
        ? {
            youtube_id: cleanId,
            url: `https://www.youtube.com/watch?v=${cleanId}`,
          }
        : {
            caption: value,
            title: value,
          }),
    };
    onChangePayload({ ...payload, items: next });
  };

  return (
    <section className="mb-4 rounded-2xl border border-red-200 bg-white p-5 shadow-xs">
      <div className="mb-4">
        <div className="text-xs font-black tracking-wider text-red-700 uppercase">
          Video YouTube
        </div>
        <h2 className="mt-1 text-lg font-black text-slate-950">
          Quản lý link nhúng Video YouTube
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Khung phát được giữ chuẩn 16:9. Bạn có thể dán link xem trực tiếp (
          <code>youtube.com/watch?v=...</code>, <code>youtu.be/...</code>, <code>shorts/...</code>
          ) hoặc mã ID 11 ký tự, hệ thống sẽ tự động chuẩn hóa.
        </p>
      </div>

      {sectionCode === 'video_slider' && (
        <div className="space-y-3">
          {items.map((slide: any, idx: number) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 md:grid-cols-2"
            >
              <label className="block text-xs font-bold text-slate-700">
                Tên / Chú thích Video {idx + 1}
                <input
                  type="text"
                  value={slide.caption || slide.title || ''}
                  onChange={(e) => updateSlide(idx, 'caption', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-xs font-bold text-slate-700">
                Link YouTube / Mã ID Video {idx + 1}
                <input
                  type="text"
                  value={slide.youtube_id || slide.url || ''}
                  onChange={(e) => updateSlide(idx, 'youtube_id', e.target.value)}
                  placeholder="Ví dụ: https://www.youtube.com/watch?v=ZsjXqYKYeYw"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {sectionCode === 'infrastructure' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((group: any, gIdx: number) => {
            const videos = Array.isArray(group.videos) ? group.videos : [];
            return (
              <div
                key={gIdx}
                className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="text-xs font-black text-slate-900">
                  Nhóm {gIdx + 1}: {group.title || group.brand}
                </div>
                {videos.map((v: any, vIdx: number) => (
                  <label key={vIdx} className="block text-xs font-bold text-slate-700">
                    Link Video #{vIdx + 1} ({v.label || v.caption || 'Hiện trường'})
                    <input
                      type="text"
                      value={v.id || v.url || ''}
                      onChange={(e) => {
                        const cleanId = extractYoutubeId(e.target.value);
                        const nextGroups = [...items];
                        const nextVids = [...videos];
                        nextVids[vIdx] = {
                          ...v,
                          id: cleanId,
                          embed: `https://www.youtube.com/embed/${cleanId}`,
                          url: `https://www.youtube.com/watch?v=${cleanId}`,
                        };
                        nextGroups[gIdx] = { ...group, videos: nextVids };
                        onChangePayload({ ...payload, items: nextGroups });
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                    />
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
