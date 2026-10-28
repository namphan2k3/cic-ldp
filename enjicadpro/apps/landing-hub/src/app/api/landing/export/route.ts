import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { buildSeedPayload } from '@/lib/deployExporter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập Quản trị viên.' }, { status: 401 });
    }

    const envSite = process.env.DEFAULT_SITE_CODE?.trim() || null;
    const requestedSite = request.nextUrl.searchParams.get('site') || 'ALL';
    const site =
      envSite ||
      (session.role === 'site_admin' && session.allowedSiteCode
        ? session.allowedSiteCode
        : requestedSite);
    const payload = await buildSeedPayload(site);
    const fileName =
      site && site !== 'ALL'
        ? `seed-${site}-${new Date().toISOString().slice(0, 10)}.json`
        : `seed-all-sites-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Export error' },
      { status: 500 }
    );
  }
}
