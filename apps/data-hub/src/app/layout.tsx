import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Database,
  FileSpreadsheet,
  Globe,
  HardDriveDownload,
  LayoutDashboard,
  Server,
  Settings,
} from 'lucide-react';
import { getDefaultPlatformActor } from '@cic/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'CIC Data Hub — Đồng bộ Google Sheets về Database & Quản trị Hệ thống',
  description:
    'Hệ thống tự động kéo dữ liệu từ Google Sheets về Database tập trung, sao lưu định kỳ và cấu hình các trang Landing Page CIC.',
};

const NAV_ITEMS = [
  { href: '/', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
  { href: '/data', label: '1. Xem Dữ Liệu từ Sheet', icon: Database },
  { href: '/sheets', label: '2. Cài Đặt Nguồn Sheet', icon: FileSpreadsheet },
  { href: '/sites', label: '3. Cấu Hình 7 Trang Web', icon: Globe },
  { href: '/backups', label: '4. Sao Lưu & Khôi Phục', icon: HardDriveDownload },
  { href: '/settings', label: '5. Cài Đặt Hệ Thống (Web)', icon: Settings },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getDefaultPlatformActor();

  return (
    <html lang="vi">
      <body className="min-h-screen flex bg-slate-50 text-slate-900">
        {/* Sidebar */}
        <aside className="w-68 shrink-0 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
              CIC
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white">CIC DATA HUB</div>
              <div className="text-xs text-slate-400">Đồng bộ Sheet &rarr; Database</div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Server className="w-3.5 h-3.5" />
              <span>Supabase Self-Host (:54322)</span>
            </div>
            <div className="text-slate-400 truncate">
              Quản trị: <span className="text-slate-200 font-medium">{actor.fullName}</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Tự động kéo dữ liệu: Google Sheets &rarr; PostgreSQL DB
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Link
                href="/settings"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                ⚙ Cài đặt trên Web
              </Link>
              <a
                href="http://localhost:4301"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold"
              >
                7 Trang Landing (:4301) &#8599;
              </a>
              <a
                href="http://localhost:4300"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                cic-web (:4300) &#8599;
              </a>
              <a
                href="http://localhost:54323"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Supabase DB (:54323) &#8599;
              </a>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-x-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
