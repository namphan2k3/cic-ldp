import postgres, { type Sql } from 'postgres';

export type { Sql };

export interface CicSiteRow {
  id: string;
  code: string;
  name: string;
  site_type: 'portal' | 'landing';
  render_mode: 'sections' | 'static_html';
  primary_domain: string | null;
  domains: string[];
  locales: string[];
  status: 'active' | 'maintenance' | 'archived';
  settings: {
    hotline?: string;
    notify_emails?: string[];
    gtm_id?: string;
    fb_pixel_id?: string;
    zalo_url?: string;
    trial_download_url?: string;
    lisp_download_url?: string;
    primary_form_code?: string;
    seo_title?: string;
    seo_description?: string;
    [key: string]: unknown;
  };
  last_check_at: Date | null;
  last_http_status: number | null;
  last_response_ms: number | null;
  ssl_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SheetColumnDefinition {
  key: string;
  header: string;
  type: 'text' | 'phone' | 'email' | 'datetime' | 'number' | 'url';
  position: number;
  hidden: boolean;
}

export interface CicSheetSourceRow {
  id: string;
  site_id: string | null;
  code: string;
  name: string;
  spreadsheet_id: string;
  sheet_name: string;
  header_row: number;
  key_columns: string[];
  column_schema: SheetColumnDefinition[];
  sync_mode: 'pull' | 'push';
  interval_minutes: number;
  is_enabled: boolean;
  next_run_at: Date | null;
  last_synced_at: Date | null;
  last_sheet_modified_at: Date | null;
  webhook_secret: string | null;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CicSheetRowRecord {
  id: string;
  source_id: string;
  row_key: string;
  row_number: number | null;
  data: Record<string, unknown>;
  data_hash: string;
  first_seen_at: Date;
  last_seen_at: Date;
  updated_at: Date;
  removed_at: Date | null;
}

export interface CicSheetSyncRunRow {
  id: string;
  source_id: string;
  trigger: 'schedule' | 'manual' | 'webhook' | 'restore';
  status: 'running' | 'success' | 'skipped' | 'failed';
  rows_read: number;
  rows_inserted: number;
  rows_updated: number;
  rows_removed: number;
  schema_changed: boolean;
  error_message: string | null;
  started_at: Date;
  finished_at: Date | null;
  triggered_by: number | null;
}

export interface CicSheetRowChangeRow {
  id: string;
  row_id: string;
  run_id: string;
  change_type: 'insert' | 'update' | 'remove' | 'restore';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_at: Date;
}

export interface CicBackupRow {
  id: string;
  scope: 'database' | 'sheet_source' | 'site_content' | 'media';
  scope_ref_id: string | null;
  trigger: 'schedule' | 'manual' | 'pre_restore';
  status: 'running' | 'success' | 'failed';
  file_path: string | null;
  remote_ref: string | null;
  size_bytes: string | null;
  checksum_sha256: string | null;
  error_message: string | null;
  expires_at: Date | null;
  started_at: Date;
  finished_at: Date | null;
  created_by: number | null;
}

const globalForDb = globalThis as unknown as {
  cicPlatformSqlV2?: Sql;
};

export function getDb(): Sql {
  if (globalForDb.cicPlatformSqlV2) {
    return globalForDb.cicPlatformSqlV2;
  }

  const rawConn =
    process.env.DATABASE_URL?.trim() ||
    'postgresql://postgres:cic_supabase_2026@127.0.0.1:54322/postgres';
  const connectionString = rawConn.replace('@localhost:', '@127.0.0.1:');

  const sql = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });

  globalForDb.cicPlatformSqlV2 = sql;

  return sql;
}

export interface ActivityLogInput {
  actorId?: number | null;
  actorLabel?: string | null;
  actionCode: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  entityType: string;
  entityId?: string | null;
  entityTitle?: string | null;
  module?: string | null;
  workspace?: string;
  result?: 'success' | 'failed' | 'partial' | 'denied';
  resultMessage?: string | null;
  sourceApp: 'data-hub' | 'landing-hub' | 'sync-worker';
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
}

export async function logPlatformActivity(input: ActivityLogInput, tx?: Sql): Promise<void> {
  const sql = tx || getDb();
  try {
    await sql`
      INSERT INTO public.cic_activity_logs (
        actor_id,
        actor_label,
        action_code,
        category,
        severity,
        is_sensitive,
        entity_type,
        entity_id,
        entity_title,
        module,
        workspace,
        locale,
        result,
        result_message,
        source_app,
        environment,
        before_data,
        after_data
      ) VALUES (
        ${input.actorId ?? null},
        ${input.actorLabel ?? 'System'},
        ${input.actionCode},
        ${input.category ?? 'data_ops'},
        ${input.severity ?? 'low'},
        false,
        ${input.entityType},
        ${input.entityId ?? null},
        ${input.entityTitle ?? null},
        ${input.module ?? null},
        ${input.workspace ?? 'vi'},
        'vi',
        ${input.result ?? 'success'},
        ${input.resultMessage ?? null},
        ${input.sourceApp},
        ${process.env.NODE_ENV ?? 'development'},
        ${input.beforeData ? sql.json(input.beforeData as never) : null},
        ${input.afterData ? sql.json(input.afterData as never) : null}
      )
    `;
  } catch (err) {
    console.warn('[logPlatformActivity] Non-fatal audit log error:', err);
  }
}

export * from './cic-landing';

