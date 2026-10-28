import React from 'react';
import type { RobotIntroPayload } from '../types';

interface IntroStoryProps {
  payload: RobotIntroPayload;
}

export function IntroStory({ payload }: IntroStoryProps) {
  return (
    <section className="section intro-redesign" id="gioi-thieu" aria-labelledby="intro-title">
      <div className="wrap">
        <div className="intro-story">
          <span
            className="eyebrow"
            dangerouslySetInnerHTML={{
              __html: payload.eyebrow || 'CHUYỂN GIAO CÔNG NGHỆ ROBOT XÂY DỰNG',
            }}
          />
          <h2 id="intro-title">
            <span
              className="intro-topic"
              dangerouslySetInnerHTML={{
                __html: payload.topic || 'Xu hướng tất yếu của ngành xây dựng',
              }}
            />
            <span
              dangerouslySetInnerHTML={{
                __html: payload.title || 'Đổi mới phương thức thi công truyền thống',
              }}
            />
          </h2>
          <p
            className="intro-statement"
            dangerouslySetInnerHTML={{
              __html:
                payload.statement ||
                'Robot công trình mang lại bước nhảy vọt về <strong>độ chính xác, tiến độ và an toàn lao động</strong>, giải quyết dứt điểm bài toán thiếu hụt nhân công tay nghề cao.',
            }}
          />
        </div>

        <div className="intro-context">
          <div>
            <h3
              dangerouslySetInnerHTML={{
                __html: payload.subtitle || 'Giải pháp toàn diện từ khảo sát đến hoàn thiện',
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html:
                  payload.description ||
                  'CIC cung cấp trọn gói hệ thống robot từ san gạt phẳng bê tông, xoa nền laser, phun vữa trát tường đến đo đạc 3D tự động hóa.',
              }}
            />
          </div>
          <div>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  payload.description_2 ||
                  'Đội ngũ kỹ sư CIC trực tiếp chuyển giao công nghệ, đào tạo vận hành tại hiện trường và hỗ trợ bảo hành bảo trì dài hạn.',
              }}
            />
            <p className="intro-fit">
              <span>{payload.fit_1 || 'Chuẩn xác cao'}</span>
              <span>·</span>
              <span>{payload.fit_2 || 'Tiết kiệm chi phí'}</span>
              <span>·</span>
              <span>{payload.fit_3 || 'Tiến độ vượt trội'}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
