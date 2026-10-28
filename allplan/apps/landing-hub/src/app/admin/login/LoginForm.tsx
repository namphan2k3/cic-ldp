'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdminAction } from '../actions';

export function LoginForm({
  lockedSiteCode,
  nextUrl,
}: {
  lockedSiteCode: string | null;
  nextUrl: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginAdminAction(username, password, lockedSiteCode);
      if (!res.success) {
        setErrorMsg(res.error || 'Đăng nhập không thành công.');
        setLoading(false);
        return;
      }
      if (
        (!nextUrl || nextUrl === '/admin') &&
        res.role === 'site_admin' &&
        res.allowedSiteCode &&
        !lockedSiteCode
      ) {
        router.push(`/admin/${res.allowedSiteCode}`);
      } else {
        router.push(nextUrl || '/admin');
      }
      router.refresh();
    } catch {
      setErrorMsg('Không thể kết nối máy chủ xác thực.');
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#0b1b36]">
            Tên đăng nhập quản trị
          </label>
          <input
            type="text"
            required
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tài khoản quản trị..."
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-[#ea580c] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0b1b36]">Mật khẩu</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-[#ea580c] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl bg-[#ea580c] py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#c2410c] disabled:opacity-50"
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị'}
        </button>
      </form>
    </div>
  );
}
