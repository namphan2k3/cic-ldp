import Link from 'next/link';
import { headers } from 'next/headers';
import { getAllLandingSites, getLandingSiteByDomain } from '@cic/db';
import LandingSitePage from './s/[code]/page';
import { AdminSessionBoundary } from './admin/components/AdminSessionBoundary';

export const dynamic = 'force-dynamic';

const SITE_CREDENTIAL_META: Record<
  string,
  {
    username: string;
    password: string;
    altPassword: string;
    standalonePort: number;
    hostingOrigin: 'Host Mắt Bão' | 'LadiPage';
  }
> = {
  'cms-intellicad': {
    username: 'cad_admin',
    password: 'cad@2026',
    altPassword: 'CicAdmin@2026',
    standalonePort: 3005,
    hostingOrigin: 'Host Mắt Bão',
  },
  'robot-cong-trinh': {
    username: 'robot_admin',
    password: 'robot@2026',
    altPassword: 'CicAdmin@2026',
    standalonePort: 3006,
    hostingOrigin: 'Host Mắt Bão',
  },
  allplan: {
    username: 'allplan_admin',
    password: 'CicAdmin@2026',
    altPassword: 'allplan@2026',
    standalonePort: 3007,
    hostingOrigin: 'LadiPage',
  },
  bim: {
    username: 'bim_admin',
    password: 'CicAdmin@2026',
    altPassword: 'bim@2026',
    standalonePort: 3008,
    hostingOrigin: 'LadiPage',
  },
  enjicad: {
    username: 'enjicad_admin',
    password: 'CicAdmin@2026',
    altPassword: 'enjicad@2026',
    standalonePort: 3009,
    hostingOrigin: 'LadiPage',
  },
  escon: {
    username: 'escon_admin',
    password: 'CicAdmin@2026',
    altPassword: 'escon@2026',
    standalonePort: 3010,
    hostingOrigin: 'Host Mắt Bão',
  },
  revit: {
    username: 'revit_admin',
    password: 'CicAdmin@2026',
    altPassword: 'revit@2026',
    standalonePort: 3011,
    hostingOrigin: 'Host Mắt Bão',
  },
  autocad: {
    username: 'autocad_admin',
    password: 'CicAdmin@2026',
    altPassword: 'autocad@2026',
    standalonePort: 3012,
    hostingOrigin: 'Host Mắt Bão',
  },
  cubicost: {
    username: 'cubicost_admin',
    password: 'CicAdmin@2026',
    altPassword: 'cubicost@2026',
    standalonePort: 3013,
    hostingOrigin: 'LadiPage',
  },
  enjicadpro: {
    username: 'enjicadpro_admin',
    password: 'CicAdmin@2026',
    altPassword: 'enjicadpro@2026',
    standalonePort: 3014,
    hostingOrigin: 'LadiPage',
  },
  piletest: {
    username: 'piletest_admin',
    password: 'CicAdmin@2026',
    altPassword: 'piletest@2026',
    standalonePort: 3015,
    hostingOrigin: 'LadiPage',
  },
  foxit: {
    username: 'foxit_admin',
    password: 'CicAdmin@2026',
    altPassword: 'foxit@2026',
    standalonePort: 3016,
    hostingOrigin: 'LadiPage',
  },
  maydocapngam: {
    username: 'maydocapngam_admin',
    password: 'CicAdmin@2026',
    altPassword: 'maydocapngam@2026',
    standalonePort: 3017,
    hostingOrigin: 'LadiPage',
  },
  cabinetvision: {
    username: 'cabinetvision_admin',
    password: 'CicAdmin@2026',
    altPassword: 'cabinetvision@2026',
    standalonePort: 3018,
    hostingOrigin: 'LadiPage',
  },
};

export default async function LandingHubIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; preview?: string }>;
}) {
  const defaultSiteCode = process.env.DEFAULT_SITE_CODE?.trim();
  if (defaultSiteCode) {
    return LandingSitePage({
      params: Promise.resolve({ code: defaultSiteCode }),
      searchParams,
    });
  }

  const reqHeaders = await headers();
  const rawHost = (reqHeaders.get('host') || '').toLowerCase().split(':')[0];
  const isLocalhost = !rawHost || rawHost === 'localhost' || rawHost === '127.0.0.1';
  if (!isLocalhost) {
    const matchedSite = await getLandingSiteByDomain(rawHost);
    if (matchedSite) {
      return LandingSitePage({
        params: Promise.resolve({ code: matchedSite.landing_site_code }),
        searchParams,
      });
    }
  }

  const sites = await getAllLandingSites();

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 text-[#0f172a] sm:px-8">
      <AdminSessionBoundary clearOnMount={true} />
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-2xs">
          <div className="flex items-center gap-4">
            <img
              src="/LOGO - 1990-08.png"
              alt="CIC Logo"
              className="h-10 w-auto shrink-0 object-contain"
            />
            <div>
              <div className="text-[11px] font-bold tracking-wider text-[#ea580c] uppercase">
                Công ty Cổ phần Công nghệ và Tư vấn CIC
              </div>
              <h1 className="mt-0.5 text-xl font-bold text-[#0b1b36] sm:text-2xl">
                Hệ thống Quản trị &amp; Vận hành Landing Page ({sites.length} Website)
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <Link
              href="/admin/login"
              className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-[#0b1b36] transition hover:border-slate-400 hover:bg-slate-50"
            >
              Đăng nhập Quản trị
            </Link>
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-lg bg-[#ea580c] px-4 py-2.5 font-semibold text-white shadow-2xs transition hover:bg-[#c2410c]"
            >
              Mở Trang Quản trị Tổng
            </Link>
          </div>
        </div>

        {/* Master Account Credentials Directory Table (Localhost Dev Only) */}
        {isLocalhost && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#0b1b36] px-6 py-4 text-white">
            <div>
              <h2 className="text-sm font-bold sm:text-base">
                Danh sách Tài khoản Quản trị &amp; Cổng Độc lập ({sites.length} Website)
              </h2>
              <p className="mt-0.5 text-xs text-slate-300">
                Tài khoản Quản trị Tổng quản lý toàn bộ hệ thống; mỗi tài khoản riêng chỉ có quyền chỉnh sửa đúng website được phân công.
              </p>
            </div>
            <div className="whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-1.5 text-xs font-semibold text-slate-100">
              Quản trị Tổng: <code className="font-mono font-bold text-amber-400">admin</code> /{' '}
              <code className="font-mono font-bold text-white">cic@2026</code>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3.5">Phạm vi / Website</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Tên miền</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Tài khoản</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Mật khẩu</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Phân quyền</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Cổng Độc lập</th>
                  <th className="whitespace-nowrap px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50/90">
                  <td className="px-5 py-3.5 font-bold text-[#0b1b36]">
                    Quản trị Tổng (Toàn bộ {sites.length} Website)
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-slate-600">
                    Tất cả tên miền
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <code className="rounded border border-slate-300 bg-white px-2.5 py-1 font-mono font-bold text-[#0b1b36]">
                      admin
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <code className="rounded border border-slate-300 bg-white px-2.5 py-1 font-mono font-bold text-slate-900">
                      cic@2026
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="inline-block whitespace-nowrap rounded-md bg-[#0b1b36] px-2.5 py-1 text-[11px] font-semibold text-white">
                      Super Admin
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                    localhost:3004/admin
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <Link
                      href="/admin"
                      className="inline-block whitespace-nowrap rounded-lg bg-[#0b1b36] px-3.5 py-1.5 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Quản trị Tổng
                    </Link>
                  </td>
                </tr>

                {sites.map((site) => {
                  const cred = SITE_CREDENTIAL_META[site.landing_site_code] || {
                    username: `${site.landing_site_code}_admin`,
                    password: 'CicAdmin@2026',
                    altPassword: '',
                    standalonePort: 3004,
                    hostingOrigin: 'LadiPage' as const,
                  };
                  const cleanName = site.landing_site_name
                    .replace(/\s*\((?:Host Mắt Bão|LadiPage[^)]*)\)\s*$/i, '')
                    .trim();
                  return (
                    <tr key={site.landing_site_id} className="transition hover:bg-slate-50/80">
                      <td className="max-w-md px-5 py-3.5">
                        <div className="font-bold text-[#0b1b36]">
                          {cleanName}{' '}
                          <span
                            className={
                              cred.hostingOrigin === 'Host Mắt Bão'
                                ? 'font-bold text-blue-700'
                                : 'font-bold text-[#ea580c]'
                            }
                          >
                            ({cred.hostingOrigin})
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-medium text-slate-600">
                        {site.primary_domain}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <code className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-bold text-[#0b1b36]">
                          {cred.username}
                        </code>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <code className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-bold text-slate-800">
                          {cred.password}
                        </code>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-block whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {site.landing_site_code}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">
                        <a
                          href={`http://localhost:${cred.standalonePort}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whitespace-nowrap font-semibold text-[#ea580c] hover:underline"
                        >
                          localhost:{cred.standalonePort}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <a
                            href={`/s/${site.landing_site_code}`}
                            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            Xem trang
                          </a>
                          <Link
                            href={`/admin/${site.landing_site_code}`}
                            className="whitespace-nowrap rounded-lg bg-[#ea580c] px-3 py-1.5 font-semibold text-white transition hover:bg-[#c2410c]"
                          >
                            Quản trị CMS
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Website Cards Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {sites.map((site) => {
            const cred = SITE_CREDENTIAL_META[site.landing_site_code] || {
              username: `${site.landing_site_code}_admin`,
              password: 'CicAdmin@2026',
              altPassword: '',
              standalonePort: 3004,
              hostingOrigin: 'LadiPage' as const,
            };
            const cleanName = site.landing_site_name
              .replace(/\s*\((?:Host Mắt Bão|LadiPage[^)]*)\)\s*$/i, '')
              .trim();
            return (
              <div
                key={site.landing_site_id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-mono font-bold text-slate-700">
                      {site.landing_site_code} ({cred.hostingOrigin})
                    </span>
                    <span className="whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Đang hoạt động (Port {cred.standalonePort})
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#0b1b36]">
                    {cleanName}{' '}
                    <span
                      className={
                        cred.hostingOrigin === 'Host Mắt Bão'
                          ? 'text-blue-700'
                          : 'text-[#ea580c]'
                      }
                    >
                      ({cred.hostingOrigin})
                    </span>
                  </h2>
                  <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Tên miền chính:</span>
                      <strong className="font-mono text-slate-800">{site.primary_domain}</strong>
                    </div>
                    {isLocalhost && (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Tài khoản quản trị:</span>
                          <code className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono font-bold text-[#0b1b36]">
                            {cred.username}
                          </code>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Mật khẩu:</span>
                          <code className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono font-bold text-slate-800">
                            {cred.password}
                          </code>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 text-xs">
                  <a
                    href={`/s/${site.landing_site_code}`}
                    className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Xem trang chính
                  </a>
                  <a
                    href={`http://localhost:${cred.standalonePort}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cổng độc lập (:{cred.standalonePort})
                  </a>
                  <Link
                    href={`/admin/${site.landing_site_code}`}
                    className="ml-auto whitespace-nowrap rounded-lg bg-[#ea580c] px-4 py-2 font-semibold text-white transition hover:bg-[#c2410c]"
                  >
                    Quản trị nội dung
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
