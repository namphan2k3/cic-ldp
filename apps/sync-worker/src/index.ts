import { getDb, type CicSheetSourceRow } from '@cic/db';
import { syncSheetSourceById } from '@cic/sheets';
import {
  createDatabaseBackup,
  createSheetSourceBackup,
  createSiteContentBackup,
  restoreSheetSourceBackup,
  getBackupBaseDir,
} from './backup.ts';
import { checkAllSitesHealth, checkSingleSiteHealth } from './health-check.ts';
import { processPendingFormDeliveries } from './form-delivery-worker.ts';

export {
  createDatabaseBackup,
  createSheetSourceBackup,
  createSiteContentBackup,
  restoreSheetSourceBackup,
  getBackupBaseDir,
  checkAllSitesHealth,
  checkSingleSiteHealth,
  processPendingFormDeliveries,
};

export async function runDueSheetSyncs(): Promise<number> {
  const sql = getDb();
  const dueSources = await sql<CicSheetSourceRow[]>`
    SELECT *
    FROM public.cic_sheet_sources
    WHERE is_enabled = true
      AND deleted_at IS NULL
      AND sync_mode = 'pull'
      AND (next_run_at IS NULL OR next_run_at <= now())
    ORDER BY COALESCE(next_run_at, '1970-01-01'::timestamptz) ASC
    LIMIT 10
  `;

  for (const src of dueSources) {
    console.log(`[sync-worker] Syncing due sheet source: ${src.code} (${src.spreadsheet_id} / ${src.sheet_name})`);
    const res = await syncSheetSourceById(src.id, { trigger: 'schedule' });
    console.log(
      `[sync-worker] -> ${src.code}: status=${res.status}, read=${res.rowsRead}, +${res.rowsInserted}, ~${res.rowsUpdated}, -${res.rowsRemoved}`
    );
  }
  return dueSources.length;
}

export async function runWorkerTick(includeHealthCheck = false): Promise<void> {
  try {
    await runDueSheetSyncs();
  } catch (err) {
    console.error('[sync-worker] Error in runDueSheetSyncs:', err);
  }

  try {
    await processPendingFormDeliveries(20);
  } catch (err) {
    console.error('[sync-worker] Error in processPendingFormDeliveries:', err);
  }

  if (includeHealthCheck) {
    try {
      await checkAllSitesHealth();
    } catch (err) {
      console.error('[sync-worker] Error in checkAllSitesHealth:', err);
    }
  }
}

// Execute when invoked directly as CLI worker
const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith('sync-worker/src/index.ts') ||
    process.argv[1].endsWith('sync-worker\\src\\index.ts'));

if (isMain) {
  const runOnce = process.argv.includes('--once');
  if (runOnce) {
    console.log('[sync-worker] Running single tick (--once)...');
    runWorkerTick(true)
      .then(() => {
        console.log('[sync-worker] Single tick complete.');
        process.exit(0);
      })
      .catch((err) => {
        console.error('[sync-worker] Fatal error:', err);
        process.exit(1);
      });
  } else {
    console.log('[sync-worker] Daemon started (30s sync loop, 5m site health check)...');
    let tickCount = 0;
    const loop = async () => {
      const checkHealth = tickCount % 10 === 0;
      tickCount++;
      await runWorkerTick(checkHealth);
    };
    loop();
    setInterval(loop, 30_000);
  }
}
