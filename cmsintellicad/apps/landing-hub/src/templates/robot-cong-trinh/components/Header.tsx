'use client';

import React, { useState, useEffect } from 'react';
import type { RobotHeaderPayload } from '../types';

interface HeaderProps {
  payload: RobotHeaderPayload & { logo_url?: string };
}

export function Header({ payload }: HeaderProps) {
  const [isCompact, setIsCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const logoSrc =
    payload.logo_url ||
    '/api/landing/media/robot-cong-trinh/images/robot/robot-8d323f9c6754.png';

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <a className="skip" href="#gioi-thieu">
        {payload.skip || 'Bỏ qua đến nội dung chính'}
      </a>

      {menuOpen && (
        <div
          className="menu-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header id="header" data-robot-header className={isCompact ? 'is-compact' : ''}>
        <div className="wrap header">
          <a className="brand" href="#" aria-label="CIC Robot công trình">
            <img className="cic-logo" src={logoSrc} alt="Logo CIC" />
            <span
              dangerouslySetInnerHTML={{
                __html: payload.tagline || 'GIẢI PHÁP<br>TỰ ĐỘNG HÓA<br>XÂY DỰNG',
              }}
            />
          </a>

          <button
            className="menu menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <nav id="nav" className={menuOpen ? 'open' : ''}>
            <div className="mobile-nav-top">
              <span className="mobile-nav-label">Menu Điều Hướng</span>
              <button
                type="button"
                className="mobile-nav-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Đóng menu"
              >
                ✕
              </button>
            </div>
            <a href="#gioi-thieu" onClick={handleLinkClick}>
              {payload.nav_intro || 'Giới thiệu'}
            </a>
            <a href="#robot" onClick={handleLinkClick}>
              {payload.nav_robot || 'Robot thi công'}
            </a>
            <a href="#robot-ha-tang" onClick={handleLinkClick}>
              {payload.nav_infrastructure || 'Robot hạ tầng'}
            </a>
            <a href="#faq" onClick={handleLinkClick}>
              {payload.nav_faq || 'Hỏi đáp'}
            </a>
            <a className="btn" href="#dang-ky" onClick={handleLinkClick}>
              <span>{payload.cta || 'Tư vấn ngay'}</span>
              <span>↗</span>
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
