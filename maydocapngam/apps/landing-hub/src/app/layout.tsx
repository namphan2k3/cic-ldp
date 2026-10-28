import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CIC Landing Hub — Hệ thống Landing Page Đa Tên miền',
  description: 'Nền tảng vận hành tập trung các Landing Page sản phẩm và giải pháp của CIC Technology.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
