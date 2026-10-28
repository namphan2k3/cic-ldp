import React from 'react';
import type { RobotFaqPayload } from '../types';

interface FaqAccordionProps {
  payload: RobotFaqPayload;
}

export function FaqAccordion({ payload }: FaqAccordionProps) {
  const items = payload.items || [
    {
      question: 'Robot công trình có yêu cầu kỹ sư chuyên môn cao để vận hành không?',
      answer: 'Không. Giao diện điều khiển được thiết kế tối giản, trực quan hóa trên màn hình cảm ứng cầm tay. Đội ngũ kỹ sư CIC sẽ trực tiếp đào tạo thực địa, công nhân chỉ mất từ 1 đến 2 ngày là có thể làm chủ thiết bị hoàn toàn.',
    },
    {
      question: 'Nguồn cấp năng lượng và thời gian hoạt động của robot như thế nào?',
      answer: 'Hầu hết các dòng robot Fangshi sử dụng hệ thống pin Lithium công nghiệp mật độ cao hoặc cắm nguồn trực tiếp 220V/380V. Thời gian vận hành liên tục từ 4 đến 8 giờ cho mỗi khối pin, hỗ trợ cơ chế thay pin nóng trong vòng 2 phút.',
    },
    {
      question: 'Chính sách bảo hành, chuyển giao và phụ tùng thay thế tại Việt Nam?',
      answer: 'CIC là đơn vị đại diện chính thức với trung tâm dịch vụ kỹ thuật tại Hà Nội và TP.HCM. Chúng tôi cam kết bảo hành chính hãng 12 tháng, phụ tùng thay thế sẵn có trong kho và đội ngũ kỹ thuật có mặt xử lý sự cố trong vòng 24 giờ.',
    },
    {
      question: 'Bài toán tài chính: Sau bao lâu thì thu hồi vốn đầu tư?',
      answer: 'Tùy theo quy mô thi công, với việc giảm 60-70% chi phí nhân công, rút ngắn tiến độ và triệt tiêu sai hỏng phải sửa chữa, đa số nhà thầu thu hồi toàn bộ vốn đầu tư robot sau 6 đến 10 tháng triển khai.',
    },
  ];

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="faq-layout">
          <div>
            <span
              className="eyebrow"
              dangerouslySetInnerHTML={{
                __html: payload.eyebrow || 'GIẢI ĐÁP THẮC MẮC',
              }}
            />
            <h2
              dangerouslySetInnerHTML={{
                __html: payload.title || 'Câu Hỏi Thường Gặp Về Robot Xây Dựng',
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html:
                  payload.description ||
                  'Tổng hợp các câu hỏi phổ biến nhất từ các chủ đầu tư, tổng thầu và đơn vị thi công chuyên nghiệp.',
              }}
            />
          </div>

          <div>
            {items.map((item, index) => (
              <details key={index} open={index === 0} data-cms-item-index={index}>
                <summary dangerouslySetInnerHTML={{ __html: item.question }} />
                <p dangerouslySetInnerHTML={{ __html: item.answer }} />
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
