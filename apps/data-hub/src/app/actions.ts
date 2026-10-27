'use server';

import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import {
  getDb,
  logPlatformActivity,
  type CicSiteRow,
  type SheetColumnDefinition,
} from '@cic/db';
import { getDefaultPlatformActor } from '@cic/auth';
import {
  buildColumnSchema,
  extractSpreadsheetId,
  inspectSpreadsheet,
  saveServiceAccountJsonFile,
  syncSheetSourceById,
  restoreSheetRowToChange,
} from '@cic/sheets';
import {
  checkAllSitesHealth,
  checkSingleSiteHealth,
  createDatabaseBackup,
  createSheetSourceBackup,
  createSiteContentBackup,
  processPendingFormDeliveries,
  restoreSheetSourceBackup,
} from '@cic/sync-worker';

export async function updateSiteConfigAction(formData: FormData) {
  const sql = getDb();
  const actor = await getDefaultPlatformActor();
  const siteId = Number(formData.get('site_id'));
  const name = String(formData.get('name') || '').trim();
  const primaryDomain = String(formData.get('primary_domain') || '').trim() || null;
  const domainsRaw = String(formData.get('domains') || '').trim();
  const domains = domainsRaw
    ? domainsRaw
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)
    : [];
  const status = String(formData.get('status') || 'active') as CicSiteRow['status'];
  const hotline = String(formData.get('hotline') || '').trim();
  const notifyEmailsRaw = String(formData.get('notify_emails') || '').trim();
  const notifyEmails = notifyEmailsRaw
    ? notifyEmailsRaw
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
    : [];
  const gtmId = String(formData.get('gtm_id') || '').trim();
  const fbPixelId = String(formData.get('fb_pixel_id') || '').trim();
  const zaloUrl = String(formData.get('zalo_url') || '').trim();
  const trialDownloadUrl = String(formData.get('trial_download_url') || '').trim();
  const lispDownloadUrl = String(formData.get('lisp_download_url') || '').trim();
  const seoTitle = String(formData.get('seo_title') || '').trim();
  const seoDescription = String(formData.get('seo_description') || '').trim();

  const [existing] = await sql<CicSiteRow[]>`
    SELECT * FROM public.cic_sites WHERE id = ${siteId} LIMIT 1
  `;
  if (!existing) throw new Error('Không tìm thấy site.');

  const mergedSettings = {
    ...(existing.settings || {}),
    hotline,
    notify_emails: notifyEmails,
    gtm_id: gtmId,
    fb_pixel_id: fbPixelId,
    zalo_url: zaloUrl,
    trial_download_url: trialDownloadUrl,
    lisp_download_url: lispDownloadUrl,
    seo_title: seoTitle,
    seo_description: seoDescription,
  };

  await sql`
    UPDATE public.cic_sites
    SET name = ${name || existing.name},
        primary_domain = ${primaryDomain},
        domains = ${domains},
        status = ${status},
        settings = ${sql.json(mergedSettings as never)},
        updated_at = now()
    WHERE id = ${siteId}
  `;

  await logPlatformActivity({
    actorId: actor.userId,
    actorLabel: actor.fullName,
    actionCode: 'site.update_settings',
    category: 'sites',
    entityType: 'cic_sites',
    entityId: String(siteId),
    entityTitle: name || existing.name,
    module: 'sites',
    result: 'success',
    resultMessage: `Cập nhật cấu hình site ${existing.code} (status=${status}, domain=${primaryDomain || 'local'})`,
    sourceApp: 'data-hub',
  });

  revalidatePath('/');
  revalidatePath('/sites');
}

export async function runHealthCheckAction(formData: FormData) {
  const siteId = formData.get('site_id');
  const sql = getDb();
  if (siteId) {
    const [site] = await sql<CicSiteRow[]>`
      SELECT * FROM public.cic_sites WHERE id = ${Number(siteId)} LIMIT 1
    `;
    if (site) {
      await checkSingleSiteHealth(site);
    }
  } else {
    await checkAllSitesHealth();
  }
  revalidatePath('/');
  revalidatePath('/sites');
}

export async function inspectSheetUrlAction(input: {
  spreadsheetUrl: string;
  sheetName?: string;
  headerRow?: number;
}) {
  const info = await inspectSpreadsheet(
    input.spreadsheetUrl,
    input.sheetName,
    input.headerRow || 1
  );
  const { schema } = buildColumnSchema(info.headers, info.sampleRows, []);
  return {
    ...info,
    inferredSchema: schema,
  };
}

export async function createSheetSourceAction(formData: FormData) {
  const sql = getDb();
  const actor = await getDefaultPlatformActor();

  const code = String(formData.get('code') || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_');
  const name = String(formData.get('name') || '').trim();
  const spreadsheetId = extractSpreadsheetId(String(formData.get('spreadsheet_id') || ''));
  const sheetName = String(formData.get('sheet_name') || 'Sheet1').trim();
  const siteIdRaw = String(formData.get('site_id') || '').trim();
  const siteId = siteIdRaw ? Number(siteIdRaw) : null;
  const headerRow = Math.max(1, Number(formData.get('header_row') || 1));
  const intervalMinutes = Math.min(1440, Math.max(1, Number(formData.get('interval_minutes') || 5)));
  const keyColumnsRaw = String(formData.get('key_columns') || '').trim();
  const keyColumns = keyColumnsRaw
    ? keyColumnsRaw
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  if (!code || !name || !spreadsheetId || !sheetName) {
    throw new Error('Vui lòng nhập đầy đủ Mã nguồn, Tên hiển thị, Spreadsheet ID/URL và Tên Tab.');
  }

  const webhookSecret = crypto.randomBytes(16).toString('hex');

  const [created] = await sql<{ id: string }[]>`
    INSERT INTO public.cic_sheet_sources (
      site_id, code, name, spreadsheet_id, sheet_name, header_row, key_columns,
      sync_mode, interval_minutes, is_enabled, next_run_at, webhook_secret, created_by
    ) VALUES (
      ${siteId},
      ${code},
      ${name},
      ${spreadsheetId},
      ${sheetName},
      ${headerRow},
      ${keyColumns},
      'pull',
      ${intervalMinutes},
      true,
      now(),
      ${webhookSecret},
      ${actor.userId}
    )
    ON CONFLICT (spreadsheet_id, sheet_name) DO UPDATE SET
      site_id = EXCLUDED.site_id,
      name = EXCLUDED.name,
      header_row = EXCLUDED.header_row,
      key_columns = EXCLUDED.key_columns,
      interval_minutes = EXCLUDED.interval_minutes,
      is_enabled = true,
      deleted_at = NULL,
      updated_at = now()
    RETURNING id
  `;

  // Run initial pull sync immediately
  await syncSheetSourceById(created.id, {
    trigger: 'manual',
    force: true,
    triggeredBy: actor.userId,
  });

  revalidatePath('/');
  revalidatePath('/sheets');
  revalidatePath('/data');
}

export async function updateSheetSourceSettingsAction(formData: FormData) {
  const sql = getDb();
  const sourceId = Number(formData.get('source_id'));
  const name = String(formData.get('name') || '').trim();
  const spreadsheetRaw = String(formData.get('spreadsheet_id') || '').trim();
  const spreadsheetId = spreadsheetRaw ? extractSpreadsheetId(spreadsheetRaw) : '';
  const sheetName = String(formData.get('sheet_name') || '').trim();
  const headerRowRaw = Number(formData.get('header_row') || 0);
  const siteIdRaw = String(formData.get('site_id') || '').trim();
  const intervalMinutes = Math.min(1440, Math.max(1, Number(formData.get('interval_minutes') || 5)));
  const isEnabled = formData.get('is_enabled') === 'true';

  const [existing] = await sql<{
    name: string;
    spreadsheet_id: string;
    sheet_name: string;
    header_row: number;
    site_id: string | null;
  }[]>`
    SELECT name, spreadsheet_id, sheet_name, header_row, site_id::text
    FROM public.cic_sheet_sources
    WHERE id = ${sourceId}
    LIMIT 1
  `;
  if (!existing) return;

  const nextName = name || existing.name;
  const nextSpreadsheetId = spreadsheetId || existing.spreadsheet_id;
  const nextSheetName = sheetName || existing.sheet_name;
  const nextHeaderRow = headerRowRaw >= 1 ? headerRowRaw : existing.header_row;
  const nextSiteId =
    formData.has('site_id') ? (siteIdRaw ? Number(siteIdRaw) : null) : (existing.site_id ? Number(existing.site_id) : null);

  await sql`
    UPDATE public.cic_sheet_sources
    SET name = ${nextName},
        spreadsheet_id = ${nextSpreadsheetId},
        sheet_name = ${nextSheetName},
        header_row = ${nextHeaderRow},
        site_id = ${nextSiteId},
        interval_minutes = ${intervalMinutes},
        is_enabled = ${isEnabled},
        updated_at = now()
    WHERE id = ${sourceId}
  `;

  revalidatePath('/');
  revalidatePath('/sheets');
  revalidatePath('/data');
  revalidatePath('/settings');
}

export async function deleteSheetSourceAction(formData: FormData) {
  const sql = getDb();
  const sourceId = Number(formData.get('source_id'));
  await sql`
    UPDATE public.cic_sheet_sources
    SET deleted_at = now(),
        is_enabled = false,
        updated_at = now()
    WHERE id = ${sourceId}
  `;
  revalidatePath('/');
  revalidatePath('/sheets');
  revalidatePath('/data');
}

export async function uploadServiceAccountJsonAction(formData: FormData) {
  const actor = await getDefaultPlatformActor();
  const rawJson = String(formData.get('service_account_json') || '').trim();
  if (!rawJson) {
    throw new Error('Vui lòng dán nội dung JSON của Google Service Account.');
  }
  const saved = saveServiceAccountJsonFile(rawJson);

  await logPlatformActivity({
    actorId: actor.userId,
    actorLabel: actor.fullName,
    actionCode: 'settings.add_service_account',
    category: 'settings',
    entityType: 'google_service_account',
    entityId: saved.clientEmail,
    entityTitle: saved.clientEmail,
    module: 'sheet_sync',
    result: 'success',
    resultMessage: `Đã lưu Google Service Account ${saved.clientEmail} (${saved.sourceFile})`,
    sourceApp: 'data-hub',
  });

  revalidatePath('/');
  revalidatePath('/sheets');
  revalidatePath('/settings');
}

export async function savePlatformSettingsAction(formData: FormData) {
  const sql = getDb();
  const actor = await getDefaultPlatformActor();

  const autoSyncEnabled = formData.get('auto_sync_enabled') === 'true';
  const defaultIntervalMinutes = Math.min(
    1440,
    Math.max(1, Number(formData.get('default_interval_minutes') || 5))
  );
  const applyIntervalToAll = formData.get('apply_interval_to_all') === 'true';
  const autoBackupEnabled = formData.get('auto_backup_enabled') === 'true';
  const backupRetentionDays = Math.min(
    365,
    Math.max(1, Number(formData.get('backup_retention_days') || 30))
  );
  const smtpHost = String(formData.get('smtp_host') || 'smtp.gmail.com').trim();
  const smtpPort = Number(formData.get('smtp_port') || 587);
  const smtpUser = String(formData.get('smtp_user') || '').trim();
  const smtpPass = String(formData.get('smtp_pass') || '').trim();
  const notifyEmail = String(formData.get('notify_email') || '').trim();

  const [portalSite] = await sql<CicSiteRow[]>`
    SELECT * FROM public.cic_sites WHERE code = 'cic' LIMIT 1
  `;

  if (portalSite) {
    const prevConfig = (portalSite.settings?.platform_config as Record<string, unknown>) || {};
    const nextPlatformConfig = {
      ...prevConfig,
      auto_sync_enabled: autoSyncEnabled,
      default_interval_minutes: defaultIntervalMinutes,
      auto_backup_enabled: autoBackupEnabled,
      backup_retention_days: backupRetentionDays,
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_user: smtpUser,
      smtp_pass: smtpPass || prevConfig.smtp_pass || '',
      notify_email: notifyEmail,
      updated_at: new Date().toISOString(),
    };

    const nextSettings = {
      ...(portalSite.settings || {}),
      platform_config: nextPlatformConfig,
    };

    await sql`
      UPDATE public.cic_sites
      SET settings = ${sql.json(nextSettings as never)},
          updated_at = now()
      WHERE id = ${portalSite.id}
    `;
  }

  if (applyIntervalToAll) {
    await sql`
      UPDATE public.cic_sheet_sources
      SET interval_minutes = ${defaultIntervalMinutes},
          is_enabled = ${autoSyncEnabled},
          updated_at = now()
      WHERE deleted_at IS NULL
    `;
  }

  await logPlatformActivity({
    actorId: actor.userId,
    actorLabel: actor.fullName,
    actionCode: 'settings.update_platform_config',
    category: 'settings',
    entityType: 'cic_sites',
    entityId: 'cic',
    entityTitle: 'Cấu hình Hệ thống Data Hub',
    module: 'sites',
    result: 'success',
    resultMessage: `Cập nhật cấu hình hệ thống (auto_sync=${autoSyncEnabled}, interval=${defaultIntervalMinutes}p, auto_backup=${autoBackupEnabled})`,
    sourceApp: 'data-hub',
  });

  revalidatePath('/');
  revalidatePath('/sheets');
  revalidatePath('/settings');
}

export async function syncSingleSheetSourceAction(formData: FormData) {
  const actor = await getDefaultPlatformActor();
  const sourceId = Number(formData.get('source_id'));
  await syncSheetSourceById(sourceId, {
    trigger: 'manual',
    force: true,
    triggeredBy: actor.userId,
  });
  revalidatePath('/');
  revalidatePath('/sheets');
  revalidatePath('/data');
}

export async function syncAllSheetSourcesAction() {
  const sql = getDb();
  const actor = await getDefaultPlatformActor();
  const sources = await sql<{ id: string }[]>`
    SELECT id FROM public.cic_sheet_sources
    WHERE is_enabled = true AND deleted_at IS NULL
    ORDER BY id ASC
  `;
  for (const s of sources) {
    await syncSheetSourceById(s.id, {
      trigger: 'manual',
      force: true,
      triggeredBy: actor.userId,
    });
  }
  revalidatePath('/');
  revalidatePath('/sheets');
  revalidatePath('/data');
}

export async function restoreRowVersionAction(formData: FormData) {
  const actor = await getDefaultPlatformActor();
  const rowId = Number(formData.get('row_id'));
  const changeId = Number(formData.get('change_id'));
  await restoreSheetRowToChange(rowId, changeId, actor.userId);
  revalidatePath('/data');
}

export async function retryFormDeliveriesAction() {
  await processPendingFormDeliveries(50);
  revalidatePath('/');
  revalidatePath('/submissions');
}

export async function createBackupNowAction(formData: FormData) {
  const actor = await getDefaultPlatformActor();
  const scope = String(formData.get('scope') || 'database');
  const scopeRefId = formData.get('scope_ref_id') ? Number(formData.get('scope_ref_id')) : null;

  if (scope === 'database') {
    await createDatabaseBackup('manual', actor.userId);
  } else if (scope === 'sheet_source' && scopeRefId) {
    await createSheetSourceBackup(scopeRefId, 'manual', actor.userId);
  } else if (scope === 'site_content' && scopeRefId) {
    await createSiteContentBackup(scopeRefId, 'manual', actor.userId);
  }

  revalidatePath('/');
  revalidatePath('/backups');
}

export async function restoreSheetBackupAction(formData: FormData) {
  const actor = await getDefaultPlatformActor();
  const backupId = Number(formData.get('backup_id'));
  await restoreSheetSourceBackup(backupId, actor.userId);
  revalidatePath('/backups');
  revalidatePath('/data');
}
