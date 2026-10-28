'use client';

import React, { useState } from 'react';
import type { VideoSlideItem } from '../types';

interface VideoSliderProps {
  slides?: VideoSlideItem[];
  payload?: Record<string, any>;
  catalogPayload?: Record<string, any>;
}

export function VideoSlider({ slides, payload, catalogPayload }: VideoSliderProps) {
  const defaultSlides: VideoSlideItem[] = [
    {
      url: 'https://www.youtube.com/watch?v=ZsjXqYKYeYw',
      embed: 'https://www.youtube.com/embed/ZsjXqYKYeYw',
      caption: 'Robot gạt phẳng bê tông thi công thực tế tại công trình',
    },
    {
      url: 'https://www.youtube.com/watch?v=VlaRWTbqR10',
      embed: 'https://www.youtube.com/embed/VlaRWTbqR10',
      caption: 'Robot xoa nền MG210B hoàn thiện bề mặt sàn siêu phẳng',
    },
    {
      url: 'https://www.youtube.com/watch?v=dnCv71DL71o',
      embed: 'https://www.youtube.com/embed/dnCv71DL71o',
      caption: 'Robot phun vữa trát tường tự động năng suất cao',
    },
    {
      url: 'https://www.youtube.com/watch?v=A8rCWo780Bc',
      embed: 'https://www.youtube.com/embed/A8rCWo780Bc',
      caption: 'Robot cán vữa sàn tự động JP210C',
    },
  ];

  // Map any incoming slides (supporting youtube_id format or embed format)
  const items =
    slides && slides.length > 0
      ? slides.map((s: any) => ({
          url:
            s.url ||
            (s.youtube_id ? `https://www.youtube.com/watch?v=${s.youtube_id}` : ''),
          embed:
            s.embed ||
            (s.youtube_id ? `https://www.youtube.com/embed/${s.youtube_id}` : ''),
          caption: s.caption || s.title || '',
        }))
      : defaultSlides;

  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const current = items[activeIndex] || items[0];

  return (
    <div className="construction-video" id="video-slider" aria-labelledby="construction-video-title">
      <div className="video-heading">
        <span
          className="eyebrow"
          dangerouslySetInnerHTML={{
            __html:
              payload?.eyebrow ||
              catalogPayload?.video_eyebrow ||
              'ROBOT TẠI CÔNG TRƯỜNG',
          }}
        />
        <h3
          id="construction-video-title"
          dangerouslySetInnerHTML={{
            __html:
              payload?.title ||
              catalogPayload?.video_title ||
              'Xem robot làm việc tại công trình',
          }}
        />
        <p
          dangerouslySetInnerHTML={{
            __html:
              payload?.subtitle ||
              catalogPayload?.video_description ||
              'Quan sát trực tiếp khả năng di chuyển, cơ cấu tay robot tự hành và chất lượng bề mặt thực tế tại các công trình.',
          }}
        />
      </div>

      <figure className="video-card video-slider-card">
        <div className="video-frame video-slider-viewport">
          {items.map((slide, idx) => (
            <div
              key={idx}
              className={`video-slide ${idx === activeIndex ? 'is-active' : ''}`}
            >
              {idx === activeIndex && (
                <iframe
                  src={`${slide.embed}?enablejsapi=1&rel=0`}
                  title={slide.caption}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          ))}
        </div>

        <figcaption className="video-slider-bar">
          <span className="video-slider-caption">{current.caption}</span>
          <div className="video-slider-nav" aria-label="Chuyển video">
            <button
              type="button"
              className="video-slider-arrow"
              onClick={prevSlide}
              aria-label="Video trước"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="video-slider-counter" aria-live="polite">
              <span>{activeIndex + 1}</span>{' '}
              <span className="counter-sep">/</span>{' '}
              <span>{items.length}</span>
            </div>
            <button
              type="button"
              className="video-slider-arrow"
              onClick={nextSlide}
              aria-label="Video tiếp theo"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          {current.url && (
            <a
              className="video-slider-yt"
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>YouTube</span> ↗
            </a>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
