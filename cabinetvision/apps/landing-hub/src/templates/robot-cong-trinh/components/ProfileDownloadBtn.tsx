'use client';

import React from 'react';

interface ProfileDownloadBtnProps {
  label?: string;
  filePath?: string;
}

export function ProfileDownloadBtn({
  label = 'Tải Hồ Sơ Năng Lực & Catalogue Robot (PDF)',
  filePath = '/api/landing/media/robot-cong-trinh/file/robot-xay-dung.pdf',
}: ProfileDownloadBtnProps) {
  return (
    <div className="catalog-profile-action">
      <a
        className="btn-download"
        href={filePath}
        download="Robot-xay-dung.pdf"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (typeof window !== 'undefined' && window.parent !== window) {
            window.parent.postMessage(
              { type: 'CMS_MODAL_OPENED', sectionCode: 'catalog', modal: 'catalog_pdf' },
              '*'
            );
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <span>{label}</span>
      </a>
    </div>
  );
}
