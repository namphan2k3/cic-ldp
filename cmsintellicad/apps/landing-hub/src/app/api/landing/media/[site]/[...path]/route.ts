import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@cic/db';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ site: string; path: string[] }> }
) {
  const { site, path: pathSegments } = await context.params;
  const filePath = (pathSegments || []).join('/');
  const fileName = pathSegments ? pathSegments[pathSegments.length - 1] : '';

  if (!site || !filePath) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  try {
    const sql = getDb();
    const rows = await sql<
      {
        file_content_bytea: Buffer | Uint8Array | null;
        mime_type: string;
        file_name: string;
      }[]
    >`
      SELECT a.file_content_bytea, a.mime_type, a.file_name
      FROM cic_landing.landing_media_assets a
      JOIN cic_landing.landing_sites s ON a.landing_site_id = s.landing_site_id
      WHERE s.landing_site_code = ${site}
        AND (a.file_path = ${filePath} OR a.file_name = ${fileName} OR a.file_path = ${fileName})
      ORDER BY (a.file_content_bytea IS NOT NULL) DESC
      LIMIT 1
    `;

    if (rows.length > 0 && rows[0].file_content_bytea) {
      const asset = rows[0];
      const buffer = Buffer.isBuffer(asset.file_content_bytea)
        ? asset.file_content_bytea
        : Buffer.from(asset.file_content_bytea as any);

      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': asset.mime_type || 'application/octet-stream',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Fallback: Check local filesystem public/media/[site]/[path]
    const localMediaDir = path.join(process.cwd(), 'public', 'media', site);
    const candidatePaths = [
      path.join(localMediaDir, filePath),
      path.join(localMediaDir, fileName),
      path.join(localMediaDir, 'images', fileName),
      path.join(localMediaDir, 'file', fileName),
      path.join(localMediaDir, 'downloads', fileName),
    ];

    for (const cp of candidatePaths) {
      if (fs.existsSync(cp) && fs.statSync(cp).isFile()) {
        const fileBuf = fs.readFileSync(cp);
        const ext = path.extname(cp).toLowerCase();
        let mime = 'application/octet-stream';
        if (ext === '.png') mime = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.webp') mime = 'image/webp';
        else if (ext === '.svg') mime = 'image/svg+xml';
        else if (ext === '.ico') mime = 'image/x-icon';
        else if (ext === '.pdf') mime = 'application/pdf';
        else if (ext === '.rar') mime = 'application/vnd.rar';

        return new Response(new Uint8Array(fileBuf), {
          status: 200,
          headers: {
            'Content-Type': mime,
            'Content-Length': fileBuf.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    return new NextResponse('Asset not found', { status: 404 });
  } catch (error) {
    console.error(`[Media Streaming Error] site=${site} path=${filePath}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
