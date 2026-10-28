import React from 'react';
import type { RobotHeroPayload } from '../types';

interface HeroKenBurnsProps {
  payload: RobotHeroPayload & { visual_url_1?: string };
}

export function HeroKenBurns({ payload }: HeroKenBurnsProps) {
  const visualUrl =
    payload.visual_url_1 ||
    '/api/landing/media/robot-cong-trinh/images/robot/robot-1874acec2e24.jpg';

  return (
    <section className="hero" id="hero">
      <img
        className="hero-image"
        src={visualUrl}
        alt="Hình minh họa robot gạt phẳng bê tông Fangshi trong công trình"
      />
      <div className="wrap">
        <span
          className="eyebrow"
          dangerouslySetInnerHTML={{
            __html: payload.eyebrow || 'GIẢI PHÁP ROBOT THI CÔNG THÔNG MINH',
          }}
        />
        <h1
          dangerouslySetInnerHTML={{
            __html: payload.title || 'Công nghệ tiên tiến.<br>Thi công <em>thông minh.</em>',
          }}
        />
        <p
          dangerouslySetInnerHTML={{
            __html:
              payload.description ||
              'Đơn vị tiên phong chuyển giao giải pháp robot xây dựng tự động hóa tại Việt Nam. Tối ưu năng suất, giảm 70% nhân công và nâng tầm chuẩn mực hoàn thiện công trình.',
          }}
        />
        <div className="actions">
          <a className="btn" href="#robot">
            <span>{payload.primary_cta || 'Khám phá danh mục robot'}</span>
            <span>↗</span>
          </a>
          <a className="btn secondary" href="#dang-ky">
            {payload.secondary_cta || 'Đăng ký tư vấn trực tiếp'}
          </a>
        </div>
      </div>
      <div className="hero-bottom">
        <div className="wrap">
          <span
            dangerouslySetInnerHTML={{
              __html:
                payload.strapline ||
                'Đối tác phân phối & chuyển giao công nghệ robot chính thức của CIC',
            }}
          />
          <a
            href="https://www.cic.com.vn/san-pham/robot-xay-dung-p426.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{payload.link || 'Chi tiết dòng sản phẩm tại cic.com.vn'}</span>
            &nbsp; ↗
          </a>
        </div>
      </div>
    </section>
  );
}
