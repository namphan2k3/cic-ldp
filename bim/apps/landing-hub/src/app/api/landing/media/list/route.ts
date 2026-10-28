import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@cic/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteCode = searchParams.get('site') || 'cms-intellicad';

    const sql = getDb();
    const assets = await sql<
      {
        landing_media_asset_id: string;
        media_slot_code: string | null;
        file_name: string;
        file_path: string;
        mime_type: string;
        file_size_bytes: string | number;
        alt_text_vi: string | null;
        updated_at_utc: Date;
      }[]
    >`
      SELECT 
        a.landing_media_asset_id,
        a.media_slot_code,
        a.file_name,
        a.file_path,
        a.mime_type,
        a.file_size_bytes,
        a.alt_text_vi,
        a.updated_at_utc
      FROM cic_landing.landing_media_assets a
      JOIN cic_landing.landing_sites s ON a.landing_site_id = s.landing_site_id
      WHERE s.landing_site_code = ${siteCode}
      ORDER BY a.updated_at_utc DESC
    `;

    const mapped = assets.map((a) => ({
      id: a.landing_media_asset_id,
      name: a.file_name,
      path: a.file_path,
      mime: a.mime_type,
      size: Number(a.file_size_bytes),
      slot: a.media_slot_code,
      alt: a.alt_text_vi,
      url: `/api/landing/media/${siteCode}/${a.file_path}`,
      updated_at: a.updated_at_utc,
    }));

    return NextResponse.json({
      success: true,
      site: siteCode,
      total: mapped.length,
      assets: mapped,
    });
  } catch (error) {
    console.error('List media assets error:', error);
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 });
  }
}
