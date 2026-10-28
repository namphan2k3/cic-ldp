import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@cic/db';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function getMimeType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    case '.pdf': return 'application/pdf';
    case '.rar': return 'application/vnd.rar';
    case '.zip': return 'application/zip';
    default: return 'application/octet-stream';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getAdminSession } = await import('@/lib/adminAuth');
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const siteCode = (formData.get('site_code') as string) || 'cms-intellicad';
    const slotCode = (formData.get('slot_code') as string) || '';
    const altText = (formData.get('alt_text') as string) || '';

    const session = await getAdminSession(siteCode);
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập Quản trị viên.' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'Dung lượng tệp vượt quá giới hạn cho phép (Tối đa 25MB).' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(fileName).toLowerCase();
    const ALLOWED_EXTENSIONS = new Set([
      '.png',
      '.jpg',
      '.jpeg',
      '.webp',
      '.ico',
      '.pdf',
      '.rar',
      '.zip',
    ]);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          error: `Định dạng tệp "${ext}" không được phép tải lên vì lý do bảo mật. Chỉ chấp nhận: PNG, JPG, WEBP, ICO, PDF, RAR, ZIP.`,
        },
        { status: 415 }
      );
    }

    // Block disguised script / HTML / PHP / PE executable payloads
    const headerSample = buffer.subarray(0, 512).toString('utf8');
    if (
      /<\s*(script|html|iframe|svg)\b/i.test(headerSample) ||
      /<\?php/i.test(headerSample) ||
      (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) // MZ executable header
    ) {
      return NextResponse.json(
        { error: 'Phát hiện tệp chứa mã thực thi hoặc script độc hại. Hệ thống đã chặn tải lên.' },
        { status: 422 }
      );
    }

    const mimeType = getMimeType(fileName);
    const fileSize = buffer.length;

    const sql = getDb();
    const siteRows = await sql<{ landing_site_id: string }[]>`
      SELECT landing_site_id FROM cic_landing.landing_sites
      WHERE landing_site_code = ${siteCode}
      LIMIT 1
    `;

    if (siteRows.length === 0) {
      return NextResponse.json({ error: `Site ${siteCode} not found` }, { status: 404 });
    }

    const siteId = siteRows[0].landing_site_id;
    const filePath = `images/${fileName}`;

    // Insert or update Supabase PostgreSQL landing_media_assets
    const inserted = await sql<
      { landing_media_asset_id: string; file_name: string; file_path: string }[]
    >`
      INSERT INTO cic_landing.landing_media_assets (
        landing_site_id,
        media_slot_code,
        file_name,
        file_path,
        mime_type,
        file_size_bytes,
        alt_text_vi,
        alt_text_en,
        storage_provider,
        file_content_bytea,
        updated_at_utc
      ) VALUES (
        ${siteId},
        ${slotCode || fileName.replace(/\.[^/.]+$/, '')},
        ${fileName},
        ${filePath},
        ${mimeType},
        ${fileSize},
        ${altText || fileName},
        ${altText || fileName},
        'supabase_pg_bytea',
        ${buffer},
        NOW()
      )
      ON CONFLICT (landing_media_asset_id) DO UPDATE SET
        file_content_bytea = EXCLUDED.file_content_bytea,
        file_size_bytes = EXCLUDED.file_size_bytes,
        mime_type = EXCLUDED.mime_type,
        updated_at_utc = NOW()
      RETURNING landing_media_asset_id, file_name, file_path;
    `;

    // Also write a local disk copy for static fallback
    try {
      const targetDir = path.join(process.cwd(), 'public', 'media', siteCode, 'images');
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, fileName), buffer);
    } catch (e) {
      console.warn('Failed to write local media disk fallback:', e);
    }

    const publicUrl = `/api/landing/media/${siteCode}/${filePath}`;

    return NextResponse.json({
      success: true,
      asset: {
        id: inserted[0].landing_media_asset_id,
        file_name: inserted[0].file_name,
        file_path: inserted[0].file_path,
        mime_type: mimeType,
        size: fileSize,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}
