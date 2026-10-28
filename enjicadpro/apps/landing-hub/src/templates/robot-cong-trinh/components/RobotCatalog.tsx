import React from 'react';
import type { RobotCatalogPayload } from '../types';
import { ProfileDownloadBtn } from './ProfileDownloadBtn';

interface RobotCatalogProps {
  payload: RobotCatalogPayload;
}

function splitCatalogPriceLabel(
  rawLabel: string | undefined,
  rawPrice: string | undefined
): { label: string; price: string } {
  const cleanLabel = (rawLabel || 'Giá:').replace(/\u00a0/g, ' ').trim();
  const cleanPrice = (rawPrice || '').replace(/\u00a0/g, ' ').trim();
  const match = cleanLabel.match(/^(Giá(?:\s+tham\s+khảo)?\s*:)\s*(.+)$/i);
  if (match) {
    return {
      label: match[1],
      price: cleanPrice || match[2].trim() || 'Liên hệ',
    };
  }
  return {
    label: cleanLabel || 'Giá:',
    price: cleanPrice || 'Liên hệ',
  };
}

export function RobotCatalog({ payload }: RobotCatalogProps) {
  const items = payload.items || [
    {
      label: 'SÀN BÊ TÔNG',
      tag: 'Hoàn thiện sàn',
      title: 'Robot hoàn thiện sàn bê tông',
      model: 'ZP420C · MG210B',
      price: '1.014.000.000 VNĐ · 1.091.000.000 VNĐ',
      description: 'San phẳng bê tông bằng laser với ZP420C; xoa nền và xoa mịn bê tông với MG210B.',
      application: 'Nhà xưởng, kho logistics, bãi đỗ xe và mặt bằng bê tông quy mô lớn.',
      cta: 'Xem chi tiết',
      is_duo: true,
      image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-c575d3e750b7.png',
      image_url_2: '/api/landing/media/robot-cong-trinh/images/robot/robot-c069c42c66d6.png',
    },
    {
      label: 'TƯỜNG & TRẦN',
      tag: 'Hoàn thiện bề mặt',
      title: 'Robot tích hợp phun bả và xả nhám',
      model: 'JPD433D',
      price: '2.086.000.000 VNĐ',
      description: 'Phun sơn nước, phun bả, gạt phẳng bả và xả nhám thông qua việc thay đổi đầu công tác.',
      application: 'Chung cư, khách sạn, văn phòng có diện tích tường, trần lớn và thiết kế lặp lại.',
      cta: 'Xem chi tiết',
      is_duo: false,
      image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-e8ec0ecd53b7.png',
    },
    {
      label: 'LÁT GẠCH',
      tag: 'Thi công gạch nền',
      title: 'Robot lát gạch nền bằng keo dán gạch',
      model: 'TZ432B',
      price: '2.636.000.000 VNĐ',
      description: 'Kết hợp cánh tay sáu trục, cảm biến và xe tự hành để hỗ trợ gắp, bôi keo và đặt gạch.',
      application: 'Gạch khổ lớn tại chung cư, trung tâm thương mại, khách sạn, sân bay và nhà ga.',
      cta: 'Xem chi tiết',
      is_duo: false,
      image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-5ae49108c24d.png',
    },
    {
      label: 'ĐO LƯỜNG',
      tag: 'Dữ liệu hiện trường',
      title: 'Robot cán vữa sàn tự động',
      model: 'JP210C',
      price: '337.000.000',
      description: 'Chuyên dụng cho công tác cán vữa sàn với hiệu suất cao đạt 100m2/1h; độ chính xác cao: Dung sai độ phẳng ±1 mm/7 m và sử dụng nguồn điện linh hoạt.',
      application: 'Các dự án thi công như nhà ở dân dụng, hạ tầng giáo dục, đầu mối giao thông, tòa nhà thương mại và nhà xưởng công nghiệp.',
      cta: 'Xem chi tiết',
      is_duo: false,
      image_url: '/api/landing/media/robot-cong-trinh/images/cms/b7fd48602d24924178b80f6df4b588d8.png',
    },
  ];

  return (
    <>
      <div className="section-heading">
        <div>
          <span
            className="eyebrow"
            dangerouslySetInnerHTML={{
              __html: payload.eyebrow || 'DANH MỤC SẢN PHẨM TIÊU BIỂU',
            }}
          />
          <h2
            dangerouslySetInnerHTML={{
              __html: payload.title || 'Hệ thống thiết bị robot xây dựng công trình hiện đại.',
            }}
          />
        </div>
        <p
          dangerouslySetInnerHTML={{
            __html:
              payload.description ||
              'Giải pháp toàn diện từ chuẩn bị, xử lý bề mặt đến hoàn thiện tinh xảo, đáp ứng các tiêu chuẩn thi công khắt khe nhất.',
          }}
        />
      </div>

      <div className="grid">
        {items.map((item, index) => {
          const isDuo = item.is_duo ?? index === 0;
          const { label: priceLabel, price: priceVal } = splitCatalogPriceLabel(
            (item as any).price_label || payload.price_label,
            item.price
          );
          return (
            <article key={index} className="card" data-cms-item-index={index}>
              <div className={`product-image ${isDuo ? 'duo' : ''}`}>
                <span className="num" dangerouslySetInnerHTML={{ __html: item.label }} />
                {isDuo ? (
                  <>
                    <img
                      loading="lazy"
                      src={
                        (item as any).image_url ||
                        '/api/landing/media/robot-cong-trinh/images/robot/robot-c575d3e750b7.png'
                      }
                      alt="Robot san phẳng bê tông ZP420C"
                    />
                    <img
                      loading="lazy"
                      src={
                        (item as any).image_url_2 ||
                        '/api/landing/media/robot-cong-trinh/images/robot/robot-c069c42c66d6.png'
                      }
                      alt="Robot xoa nền MG210B"
                    />
                  </>
                ) : (
                  <img
                    loading="lazy"
                    src={
                      (item as any).image_url ||
                      (index === 1
                        ? '/api/landing/media/robot-cong-trinh/images/robot/robot-e8ec0ecd53b7.png'
                        : index === 2
                        ? '/api/landing/media/robot-cong-trinh/images/robot/robot-5ae49108c24d.png'
                        : '/api/landing/media/robot-cong-trinh/images/cms/b7fd48602d24924178b80f6df4b588d8.png')
                    }
                    alt={item.title}
                  />
                )}
              </div>

              <div className="card-body">
                <span className="tag" dangerouslySetInnerHTML={{ __html: item.tag }} />
                <h3 dangerouslySetInnerHTML={{ __html: item.title }} />
                <div className="model" dangerouslySetInnerHTML={{ __html: item.model }} />

                <div className="product-price">
                  <span dangerouslySetInnerHTML={{ __html: priceLabel }} />{' '}
                  <strong dangerouslySetInnerHTML={{ __html: priceVal }} />
                </div>

                <p dangerouslySetInnerHTML={{ __html: item.description }} />

                <div className="application">
                  <strong data-cms-no-edit="1">
                    {payload.application_label || 'Ứng dụng chính:'}
                  </strong>{' '}
                  <span dangerouslySetInnerHTML={{ __html: item.application }} />
                </div>

                <a
                  className="text-link"
                  href="https://www.cic.com.vn/san-pham/robot-xay-dung-p426.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span dangerouslySetInnerHTML={{ __html: item.cta }} />
                  <span data-cms-no-edit="1">↗</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <ProfileDownloadBtn
        label={payload.download_profile || 'Tải toàn bộ tài liệu hồ sơ năng lực & catalog (PDF)'}
        filePath={
          payload.profile_file ||
          '/api/landing/media/robot-cong-trinh/file/robot-xay-dung.pdf'
        }
      />
    </>
  );
}
