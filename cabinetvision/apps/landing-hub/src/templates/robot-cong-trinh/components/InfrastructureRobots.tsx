import React from 'react';
import type { RobotInfrastructurePayload } from '../types';

interface InfrastructureRobotsProps {
  payload: RobotInfrastructurePayload;
}

function splitPriceAndLabel(
  rawLabel: string | undefined,
  rawPrice: string | undefined,
  defaultPrice = 'Liên hệ'
): { label: string; price: string } {
  const cleanLabel = (rawLabel || 'Giá:').replace(/\u00a0/g, ' ').trim();
  const cleanPrice = (rawPrice || '').replace(/\u00a0/g, ' ').trim();
  const match = cleanLabel.match(/^(Giá(?:\s+tham\s+khảo)?\s*:)\s*(.+)$/i);
  if (match) {
    const extracted = match[2].trim();
    return {
      label: match[1],
      price: cleanPrice || extracted || defaultPrice,
    };
  }
  return {
    label: cleanLabel || 'Giá:',
    price: cleanPrice || defaultPrice,
  };
}

export function InfrastructureRobots({ payload }: InfrastructureRobotsProps) {
  const defaultItems = [
    {
      brand: 'FIFISH',
      title: 'FIFISH E-MASTER PLUS',
      price: 'Liên hệ',
      description:
        'Robot lặn khảo sát và kiểm tra công trình dưới nước chuyên dụng. Trang bị camera 4K UHD, cảm biến đo độ sâu, la bàn và cánh tay gắp mẫu vật.',
      image_url:
        '/api/landing/media/robot-cong-trinh/images/robot/robot-ef7d081caac2.png',
      link: 'https://www.cic.com.vn/san-pham/fifish-e-master-plus---ro-bot-kiem-tra-duoi-nuoc-1-p412.html',
      cta: 'Tìm hiểu giải pháp',
      video_title: 'Video thực tế tại hiện trường:',
      videos: [
        {
          id: 'poVO5OeM3RA',
          embed: 'https://www.youtube.com/embed/poVO5OeM3RA',
          url: 'https://www.youtube.com/watch?v=poVO5OeM3RA',
          caption: 'FIFISH E-MASTER PLUS khảo sát cống và đập thủy điện',
        },
        {
          id: 'EAzc6FuEOfs',
          embed: 'https://www.youtube.com/embed/EAzc6FuEOfs',
          url: 'https://www.youtube.com/watch?v=EAzc6FuEOfs',
          caption: 'Kiểm tra vết nứt trụ cầu và cấu kiện ngầm dưới nước',
        },
      ],
    },
    {
      brand: 'SCHRODER',
      title: 'Robot vệ sinh cống ngầm Model R125',
      price: 'Liên hệ',
      description:
        'Hệ thống camera kiểm tra CCTV bánh xích tự hành. Phát hiện dị tật, lún nứt, rò rỉ và nạo vét bùn đất trong lòng đường ống thoát nước đô thị.',
      image_url:
        '/api/landing/media/robot-cong-trinh/images/robot/robot-e6e6f41c09de.png',
      link: 'https://www.cic.com.vn/san-pham/ro-bot-ve-sinh-cong-ngam-p293.html',
      cta: 'Tìm hiểu giải pháp',
      video_title: 'Video thực tế tại hiện trường:',
      videos: [
        {
          id: 'ga0pU5Apcu4',
          embed: 'https://www.youtube.com/embed/ga0pU5Apcu4',
          url: 'https://www.youtube.com/watch?v=ga0pU5Apcu4',
          caption: 'Robot CCTV nội soi đường ống ngầm đô thị',
        },
        {
          id: 'PhEulGAeC0o',
          embed: 'https://www.youtube.com/embed/PhEulGAeC0o',
          url: 'https://www.youtube.com/watch?v=PhEulGAeC0o',
          caption: 'Nạo vét cống ngầm và xử lý rác nghẽn tự động',
        },
      ],
    },
  ];

  return (
    <div className="additional" id="robot-ha-tang">
      <span
        className="eyebrow"
        dangerouslySetInnerHTML={{
          __html: payload.eyebrow || 'THIẾT BỊ HẠ TẦNG & CÔNG TRÌNH LỚN',
        }}
      />
      <h3
        dangerouslySetInnerHTML={{
          __html: payload.title || 'Robot kiểm tra & bảo trì hạ tầng ngầm.',
        }}
      />
      <div className="infra-grid">
        {(Array.isArray(payload.items) && payload.items.length > 0
          ? payload.items
          : defaultItems
        ).map((group: any, index: number) => {
          const { label: priceLabel, price: priceVal } = splitPriceAndLabel(
            group.price_label || payload.price_label,
            group.price,
            defaultItems[index]?.price || 'Liên hệ'
          );
          const descHtml =
            group.description ||
            group.subtitle ||
            defaultItems[index]?.description ||
            '';
          const brandHtml =
            group.brand || defaultItems[index]?.brand || 'ROBOT HẠ TẦNG';
          const ctaHtml =
            group.cta || payload.cta || defaultItems[index]?.cta || 'Xem chi tiết giải pháp';

          return (
            <div
              key={index}
              className="infra-group"
              data-cms-item-index={index}
            >
              <article className="infra">
                <img
                  loading="lazy"
                  src={group.image_url || defaultItems[index]?.image_url}
                  alt={group.title}
                />
                <div>
                  <span
                    className="tag"
                    dangerouslySetInnerHTML={{ __html: brandHtml }}
                  />
                  <h4 dangerouslySetInnerHTML={{ __html: group.title }} />
                  <div className="infra-price">
                    <span dangerouslySetInnerHTML={{ __html: priceLabel }} />{' '}
                    <strong dangerouslySetInnerHTML={{ __html: priceVal }} />
                  </div>
                  <p dangerouslySetInnerHTML={{ __html: descHtml }} />
                  <a
                    className="text-link"
                    href={group.link || defaultItems[index]?.link || '#dang-ky'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span dangerouslySetInnerHTML={{ __html: ctaHtml }} />{' '}
                    <span data-cms-no-edit="1">↗</span>
                  </a>
                </div>
              </article>

              <div className="infra-videos">
                <h4
                  dangerouslySetInnerHTML={{
                    __html: group.video_title || 'Video thực tế tại hiện trường:',
                  }}
                />
                {(Array.isArray(group.videos)
                  ? group.videos
                  : defaultItems[index]?.videos || []
                ).map((v: any, vIdx: number) => {
                  const embedUrl =
                    v.embed || (v.id ? `https://www.youtube.com/embed/${v.id}` : '');
                  const watchUrl =
                    v.url || (v.id ? `https://www.youtube.com/watch?v=${v.id}` : '');
                  const capHtml = v.caption || v.label || group.title;
                  return (
                    <figure key={vIdx} className="video-card">
                      <div className="video-frame">
                        <iframe
                          src={embedUrl}
                          title={capHtml}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <figcaption>
                        <span dangerouslySetInnerHTML={{ __html: capHtml }} />
                        <a
                          href={watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          YouTube ↗
                        </a>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
