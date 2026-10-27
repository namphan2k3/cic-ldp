import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getDb, type CicBackupRow } from '@cic/db';
import { getBackupBaseDir } from '@cic/sync-worker';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const type = request.nextUrl.searchParams.get('type');
  const sql = getDb();

  const [backup] = await sql<CicBackupRow[]>`
    SELECT * FROM public.cic_backups WHERE id = ${Number(id)} LIMIT 1
  `;
  if (!backup) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
  }

  const relPath = type === 'xlsx' && backup.remote_ref ? backup.remote_ref : backup.file_path;
  if (!relPath) {
    return NextResponse.json({ error: 'Backup file path missing' }, { status: 404 });
  }

  const fullPath = path.join(getBackupBaseDir(), relPath);
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
  }

  const buf = fs.readFileSync(fullPath);
  const fileName = path.basename(fullPath);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
