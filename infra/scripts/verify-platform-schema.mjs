#!/usr/bin/env node
import { execSync } from 'node:child_process';

function query(sql) {
  const oneLine = sql.replace(/\s+/g, ' ').trim();
  const out = execSync(
    `docker exec supabase-db psql -U postgres -d postgres -At -F "|" -c "${oneLine.replace(/"/g, '\\"')}"`,
    { encoding: 'utf8' }
  ).trim();
  return out ? out.split(/\r?\n/) : [];
}

const totalTables = Number(
  query(`SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`)[0]
);
const newTables = query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema='public'
    AND table_name IN ('cic_sites','cic_sheet_sources','cic_sheet_rows','cic_sheet_sync_runs','cic_sheet_row_changes','cic_backups')
  ORDER BY table_name
`);
const siteIdCols = query(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema='public' AND column_name='site_id'
    AND table_name IN ('cic_forms','cic_content_pages')
  ORDER BY table_name
`);
const partialIndexes = query(`
  SELECT indexname FROM pg_indexes
  WHERE schemaname='public' AND tablename='cic_content_pages'
    AND indexname IN (
      'uq_cic_content_pages_workspace_code',
      'uq_cic_content_pages_workspace_slug',
      'uq_cic_content_pages_site_ws_code',
      'uq_cic_content_pages_site_ws_slug'
    )
  ORDER BY indexname
`);
const permissions = query(`
  SELECT id, module, _task, list_function FROM cic_permission_tasks
  WHERE id IN (127, 128, 129, 130)
  ORDER BY id
`);

console.log('=== Platform Schema Verification ===');
console.log(`Total base tables in public: ${totalTables} (expected 94 = 88 existing + 6 new)`);
console.log(`New platform tables (${newTables.length}/6): ${newTables.join(', ')}`);
console.log(`site_id columns (${siteIdCols.length}/2): ${siteIdCols.join(', ')}`);
console.log(`Partial unique indexes on cic_content_pages (${partialIndexes.length}/4): ${partialIndexes.join(', ')}`);
console.log(`RBAC tasks (${permissions.length}/4):`);
for (const p of permissions) console.log(`  - ${p}`);

if (
  totalTables !== 94 ||
  newTables.length !== 6 ||
  siteIdCols.length !== 2 ||
  partialIndexes.length !== 4 ||
  permissions.length !== 4
) {
  console.error('FAILED schema verification!');
  process.exit(1);
}
console.log('PASSED all platform schema checks.');
