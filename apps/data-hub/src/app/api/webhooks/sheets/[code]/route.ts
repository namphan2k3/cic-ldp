import { NextRequest, NextResponse } from 'next/server';
import { getDb, type CicSheetSourceRow } from '@cic/db';
import { syncSheetSourceById } from '@cic/sheets';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const secret =
    request.nextUrl.searchParams.get('secret') ||
    request.headers.get('x-webhook-secret') ||
    '';

  const sql = getDb();
  const [source] = await sql<CicSheetSourceRow[]>`
    SELECT *
    FROM public.cic_sheet_sources
    WHERE code = ${code} AND deleted_at IS NULL
    LIMIT 1
  `;

  if (!source) {
    return NextResponse.json({ ok: false, error: 'Sheet source not found' }, { status: 404 });
  }

  const expectedSecret = source.webhook_secret || process.env.SYNC_WEBHOOK_SECRET || '';
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Invalid webhook secret' }, { status: 401 });
  }

  const result = await syncSheetSourceById(source.id, {
    trigger: 'webhook',
    force: true,
  });

  return NextResponse.json({ ok: true, result });
}
