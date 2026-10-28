import React from 'react';
import type { RobotFooterPayload } from '../types';

interface FooterProps {
  payload: RobotFooterPayload & { logo_url?: string };
}

export function Footer({ payload }: FooterProps) {
  const logoSrc =
    payload.logo_url ||
    '/api/landing/media/robot-cong-trinh/images/robot/robot-8d323f9c6754.png';

  return (
    <footer id="footer">
      <span id="page-footer" className="sr-only" />
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img className="cic-logo" src={logoSrc} alt="Logo CIC" />
            </div>
            <p
              className="company"
              dangerouslySetInnerHTML={{
                __html:
                  payload.company || 'Công ty Cổ phần Công nghệ và Tư vấn CIC',
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html:
                  payload.description ||
                  'Đơn vị tiên phong chuyển giao giải pháp robot và tự động hóa xây dựng công trình hàng đầu tại Việt Nam.',
              }}
            />
          </div>

          <div>
            <h3>{payload.contact || 'LIÊN HỆ'}</h3>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  payload.address ||
                  'Tòa nhà CIC, số 37 Lê Văn Thiêm, Thanh Xuân, Hà Nội',
              }}
            />
            <p>
              <span>{payload.hotline_label || 'Hotline:'}</span>{' '}
              <a href={`tel:${((payload as any).phone || '0866059659').replace(/\s+/g, '')}`}>
                {(payload as any).phone || '0866 059 659'}
              </a>
              <span> - </span>
              <a href={`tel:${((payload as any).phone_2 || '0976267834').replace(/\s+/g, '')}`}>
                {(payload as any).phone_2 || '0976 267 834'}
              </a>
            </p>
            <p>
              <span>{payload.telephone_label || 'Điện thoại:'}</span>{' '}
              <a href={`tel:${((payload as any).telephone || '02439741373').replace(/\s+/g, '')}`}>
                {(payload as any).telephone || '024 3974 1373'}
              </a>
            </p>
            <p>
              <span>{payload.email_label || 'Email:'}</span>{' '}
              <a href={`mailto:${(payload as any).email || 'contact@cic.com.vn'}`}>
                {(payload as any).email || 'contact@cic.com.vn'}
              </a>
              <span> - </span>
              <a href={`mailto:${(payload as any).email_2 || 'truongvv@cic.com.vn'}`}>
                {(payload as any).email_2 || 'truongvv@cic.com.vn'}
              </a>
            </p>
            <p>
              <span>{payload.website_label || 'Website:'}</span>{' '}
              <a
                href="https://www.cic.com.vn/"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.cic.com.vn
              </a>
            </p>
            <p>
              <span>{payload.facebook_label || 'Fanpage:'}</span>{' '}
              <a
                href="https://www.facebook.com/CICTechnologyandConsultancyVN"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook CIC
              </a>
            </p>
          </div>

          <div>
            <h3>{payload.explore || 'KHÁM PHÁ'}</h3>
            <a href="#gioi-thieu">{payload.nav_intro || 'Giới thiệu'}</a>
            <a href="#robot">{payload.nav_robot || 'Robot thi công'}</a>
            <a href="#robot-ha-tang">
              {payload.nav_infrastructure || 'Robot hạ tầng'}
            </a>
            <a href="#dang-ky">{payload.nav_form || 'Đăng ký tư vấn'}</a>
            <a href="#faq">{payload.nav_faq || 'Hỏi đáp'}</a>
          </div>
        </div>

        <div className="copyright">
          <div className="copyright-legal">
            <span
              dangerouslySetInnerHTML={{
                __html:
                  payload.copyright ||
                  '© 2026 CIC Consulting & Technology. All rights reserved.',
              }}
            />
            <span className="copyright-sep">|</span>
            <a
              className="copyright-link"
              href="https://www.cic.com.vn"
              target="_blank"
              rel="noopener noreferrer"
            >
              {payload.privacy_policy || 'Chính sách bảo mật'}
            </a>
          </div>
          <span
            dangerouslySetInnerHTML={{
              __html:
                payload.signature ||
                'Cung cấp bởi Công ty Cổ phần Công nghệ và Tư vấn CIC',
            }}
          />
        </div>
      </div>
    </footer>
  );
}
