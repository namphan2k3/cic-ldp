import React from 'react';
import { Roboto } from 'next/font/google';
import './admin-tokens.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-admin-roboto',
  display: 'swap',
});

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${roboto.variable} cms-shell min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased`}
      style={{
        fontFamily: 'var(--font-admin-roboto), Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
