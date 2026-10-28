import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@cic/db';
import { getAdminSession } from '@/lib/adminAuth';
import { buildLeadsExcelXml, type ExcelLeadRecord } from '@/lib/excelExporter';

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
    const sql = getDb();

    const rows =
      site && site !== 'ALL'
        ? await sql`
            SELECT
              l.submitted_at_utc,
              s.landing_site_name,
              l.customer_full_name,
              l.customer_phone,
              l.customer_email,
              l.customer_company,
              l.submitted_fields_json
            FROM cic_landing.landing_lead_submissions l
            JOIN cic_landing.landing_sites s ON s.landing_site_id = l.landing_site_id
            WHERE s.landing_site_code = ${site}
            ORDER BY l.submitted_at_utc DESC
          `
        : await sql`
            SELECT
              l.submitted_at_utc,
              s.landing_site_name,
              l.customer_full_name,
              l.customer_phone,
              l.customer_email,
              l.customer_company,
              l.submitted_fields_json
            FROM cic_landing.landing_lead_submissions l
            JOIN cic_landing.landing_sites s ON s.landing_site_id = l.landing_site_id
            ORDER BY l.submitted_at_utc DESC
          `;

    const records: ExcelLeadRecord[] = rows.map((r) => ({
      submittedAt: new Date(r.submitted_at_utc as string).toISOString(),
      siteName: String(r.landing_site_name || ''),
      fullName: (r.customer_full_name as string) || null,
      phone: (r.customer_phone as string) || null,
      email: (r.customer_email as string) || null,
      companyName: (r.customer_company as string) || null,
      leadPayload: (r.submitted_fields_json as Record<string, any>) || {},
    }));

    const scopeLabel =
      site && site !== 'ALL'
        ? records[0]?.siteName || site
        : 'Tất cả Website';

    const xml = '\uFEFF' + buildLeadsExcelXml(records, scopeLabel);
    const fileName = `Bao-cao-khach-hang-${site.toLowerCase()}-${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Excel export error' },
      { status: 500 }
    );
  }
}
