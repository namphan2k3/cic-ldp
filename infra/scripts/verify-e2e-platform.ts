import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '@cic/db';
import { restoreSheetRowToChange } from '@cic/sheets';

async function main() {
  const sql = getDb();
  console.log('=== E2E PLATFORM VERIFICATION SUITE ===');

  try {
    // 1. Verify isolation between cic-web (site_id IS NULL) and landing-hub (site_id IS NOT NULL)
    const [cicWebPages] = await sql<{ cnt: string }[]>`
      SELECT count(*)::text AS cnt FROM public.cic_content_pages WHERE site_id IS NULL
    `;
    const [landingPages] = await sql<{ cnt: string }[]>`
      SELECT count(*)::text AS cnt FROM public.cic_content_pages WHERE site_id IS NOT NULL
    `;
    const [landingSections] = await sql<{ cnt: string }[]>`
      SELECT count(*)::text AS cnt
      FROM public.cic_content_page_sections s
      JOIN public.cic_content_page_revisions r ON r.id = s.revision_id
      JOIN public.cic_content_pages p ON p.id = r.page_id
      WHERE p.site_id IS NOT NULL
    `;
    console.log(
      `[1/5] Content Isolation: cic-web pages (site_id IS NULL)=${cicWebPages.cnt}, landing pages=${landingPages.cnt}, landing sections=${landingSections.cnt}`
    );
    if (Number(landingPages.cnt) < 3 || Number(landingSections.cnt) < 40) {
      throw new Error('Expected at least 3 landing pages and 40 CMS sections');
    }

    // 2. Verify all 8 sites and 7 landing forms
    const sitesRows = await sql<{ code: string; render_mode: string }[]>`
      SELECT code, render_mode FROM public.cic_sites WHERE status = 'active' ORDER BY id
    `;
    const formsRows = await sql<{ code: string; site_id: string }[]>`
      SELECT code, site_id::text FROM public.cic_forms WHERE site_id IS NOT NULL ORDER BY id
    `;
    console.log(
      `[2/5] Active Sites (${sitesRows.length}): ${sitesRows.map((r) => `${r.code}(${r.render_mode})`).join(', ')}`
    );
    console.log(
      `      Landing Forms (${formsRows.length}): ${formsRows.map((f) => f.code).join(', ')}`
    );
    if (sitesRows.length !== 8 || formsRows.length !== 7) {
      throw new Error(`Expected 8 sites and 7 forms, got ${sitesRows.length} and ${formsRows.length}`);
    }

    // 3. Verify live Google Sheets sync data
    const sourcesRows = await sql<{ id: string; code: string; header_row: number; cnt: string }[]>`
      SELECT s.id::text, s.code, s.header_row, count(r.id)::text AS cnt
      FROM public.cic_sheet_sources s
      LEFT JOIN public.cic_sheet_rows r ON r.source_id = s.id AND r.removed_at IS NULL
      GROUP BY s.id, s.code, s.header_row
      ORDER BY s.id
    `;
    console.log(
      `[3/5] Sheet Sources & Active Rows: ${sourcesRows.map((s) => `${s.code}[header=${s.header_row}, rows=${s.cnt}]`).join(', ')}`
    );

    // 4. Test row history audit trail & 1-click restoreSheetRowToChange
    const [sampleRow] = await sql<{
      id: string;
      source_id: string;
      row_key: string;
      data: Record<string, string>;
    }[]>`
      SELECT id::text, source_id::text, row_key, data
      FROM public.cic_sheet_rows
      WHERE removed_at IS NULL
      ORDER BY id
      LIMIT 1
    `;
    if (!sampleRow) {
      throw new Error('No synced rows found in cic_sheet_rows');
    }
    const [initialChange] = await sql<{ id: string }[]>`
      SELECT id::text
      FROM public.cic_sheet_row_changes
      WHERE row_id = ${sampleRow.id}
      ORDER BY id ASC
      LIMIT 1
    `;
    if (!initialChange) {
      throw new Error(`No initial change history found for row #${sampleRow.id}`);
    }

    const originalData = { ...sampleRow.data };
    const modifiedData = { ...originalData, ghi_chu_cham_soc: 'TEST_ROLLBACK_MUTATION' };
    await sql`
      UPDATE public.cic_sheet_rows
      SET data = ${sql.json(modifiedData as never)}
      WHERE id = ${sampleRow.id}
    `;

    // Restore back to initialChange
    await restoreSheetRowToChange(sampleRow.id, initialChange.id, null);

    const [restoredRow] = await sql<{ data: Record<string, string> }[]>`
      SELECT data FROM public.cic_sheet_rows WHERE id = ${sampleRow.id}
    `;
    if (restoredRow.data.ghi_chu_cham_soc !== originalData.ghi_chu_cham_soc) {
      throw new Error('restoreSheetRowToChange failed to restore original data');
    }

    // Clean up the test restore run & change entry so history remains pristine
    await sql`
      DELETE FROM public.cic_sheet_row_changes
      WHERE row_id = ${sampleRow.id} AND change_type = 'restore'
    `;
    await sql`
      DELETE FROM public.cic_sheet_sync_runs
      WHERE source_id = ${sampleRow.source_id} AND trigger = 'restore'
    `;
    console.log(
      `[4/5] Row Change Audit & 1-Click Rollback verified on row #${sampleRow.id} (${sampleRow.row_key})`
    );

    // 5. Verify Backups on disk and in cic_backups
    const backupsRows = await sql<{ id: string; scope: string; file_path: string; size_bytes: string }[]>`
      SELECT id::text, scope, file_path, size_bytes::text
      FROM public.cic_backups
      WHERE status = 'success'
      ORDER BY id
    `;
    const backupRoot = process.env.BACKUP_STORAGE_DIR || 'd:/web-data/backups';
    for (const b of backupsRows) {
      const absPath = path.isAbsolute(b.file_path) ? b.file_path : path.resolve(backupRoot, b.file_path);
      if (!fs.existsSync(absPath)) {
        throw new Error(`Backup file missing on disk: ${absPath}`);
      }
    }
    console.log(
      `[5/5] Verified ${backupsRows.length} backup snapshots on disk in ${backupRoot}`
    );

    console.log('=== ALL E2E PLATFORM VERIFICATIONS PASSED ===');
  } finally {
    await sql.end({ timeout: 2 });
  }
}

main().catch((err) => {
  console.error('E2E Verification failed:', err);
  process.exitCode = 1;
});
