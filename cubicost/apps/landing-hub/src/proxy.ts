import { NextRequest, NextResponse } from 'next/server';

const DOMAIN_TO_SITE_CODE: Record<string, string> = {
  'cmsintellicad.vn': 'cms-intellicad',
  'www.cmsintellicad.vn': 'cms-intellicad',
  'intellicad.cic.com.vn': 'cms-intellicad',
  'robotcongtrinh.vn': 'robot-cong-trinh',
  'www.robotcongtrinh.vn': 'robot-cong-trinh',
  'enjicad.vn': 'enjicad',
  'www.enjicad.vn': 'enjicad',
  'allplan.cic.com.vn': 'allplan',
  'bim.cic.com.vn': 'bim',
  'escon.cic.com.vn': 'escon',
  'revit.cic.com.vn': 'revit',
  'autocad.cic.com.vn': 'autocad',
  'www.autocad.cic.com.vn': 'autocad',
};

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /_sites/<code> to /s/<code> because Next.js App Router treats _folders as private
  if (pathname.startsWith('/_sites/')) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname.replace(/^\/_sites\//, '/s/');
    return withSecurityHeaders(NextResponse.rewrite(rewriteUrl));
  }

  const rawHost = (request.headers.get('host') || '').toLowerCase();
  const hostname = rawHost.split(':')[0];

  // Support <siteCode>.localhost:3000 in local development
  let resolvedSiteCode = DOMAIN_TO_SITE_CODE[hostname];
  if (!resolvedSiteCode && hostname.endsWith('.localhost')) {
    resolvedSiteCode = hostname.replace(/\.localhost$/, '');
  }
  if (!resolvedSiteCode && process.env.DEFAULT_SITE_CODE) {
    resolvedSiteCode = process.env.DEFAULT_SITE_CODE;
  }

  // Allow independent /cms route on each domain (e.g., robotcongtrinh.vn/cms -> /admin/robot-cong-trinh)
  if (resolvedSiteCode && (pathname === '/cms' || pathname.startsWith('/cms/'))) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/admin/${resolvedSiteCode}`;
    return withSecurityHeaders(NextResponse.rewrite(rewriteUrl));
  }

  // Pass through internal routes, API, admin, SEO routes, and static assets
  if (
    pathname.startsWith('/s/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/sites') ||
    pathname.startsWith('/_next') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (resolvedSiteCode && (pathname === '/' || pathname === '/en')) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname =
      pathname === '/en' ? `/s/${resolvedSiteCode}-en` : `/s/${resolvedSiteCode}`;
    return withSecurityHeaders(NextResponse.rewrite(rewriteUrl));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
