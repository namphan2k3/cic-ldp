import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/adminAuth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Đăng nhập Quản trị — CIC Landing Platform',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextSiteMatch = sp.next?.match(/^\/admin\/([a-z0-9-]+)$/i);
  const targetSite = nextSiteMatch ? nextSiteMatch[1] : null;
  const session = await getAdminSession(targetSite);
  if (session) {
    redirect(sp.next || '/admin');
  }

  const lockedSiteCode = process.env.DEFAULT_SITE_CODE?.trim() || null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1b36] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <img
            src="/LOGO - 1990-08.png"
            alt="CIC Logo"
            className="h-11 w-auto object-contain"
          />
          <span className="mt-3 rounded-md border border-slate-200 bg-slate-100 px-3 py-0.5 text-[10px] font-bold tracking-wider text-slate-700 uppercase">
            Cổng Quản trị Hệ thống
          </span>
          <h1 className="mt-2 text-lg font-bold text-[#0b1b36]">
            {lockedSiteCode
              ? `Quản trị Website (${lockedSiteCode})`
              : 'Hệ thống Quản trị Landing Page CIC'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Đăng nhập bằng tài khoản quản trị riêng của trang hoặc tài khoản Quản trị Tổng
          </p>
        </div>

        <LoginForm
          lockedSiteCode={lockedSiteCode}
          nextUrl={sp.next || '/admin'}
        />
      </div>
    </div>
  );
}
