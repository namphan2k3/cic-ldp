import type { Sql } from 'postgres';
import { getDb } from './index';

export interface LandingSiteRow {
  landing_site_id: string;
  landing_site_code: string;
  landing_site_name: string;
  landing_site_type: 'landing' | 'portal';
  primary_domain: string;
  custom_domains_json: string[];
  supported_locales_json: string[];
  default_locale: string;
  site_status: 'active' | 'maintenance' | 'archived';
  brand_config_json: {
    logo_url?: string;
    logo_alt?: string;
    favicon_url?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    hotline?: string;
    email?: string;
    address?: string;
    facebook_url?: string;
    youtube_url?: string;
    zalo_url?: string;
    [key: string]: unknown;
  };
  seo_meta_json: {
    title?: string;
    description?: string;
    keywords?: string;
    og_image?: string;
    canonical_url?: string;
    [key: string]: unknown;
  };
  tracking_config_json: {
    gtm_id?: string;
    fb_pixel_id?: string;
    ga4_id?: string;
    zalo_pixel_id?: string;
    [key: string]: unknown;
  };
  created_at_utc: Date;
  updated_at_utc: Date;
}

export interface LandingPageRow {
  landing_page_id: string;
  landing_site_id: string;
  landing_page_slug: string;
  landing_page_locale: string;
  page_title: string;
  page_status: 'draft' | 'published' | 'scheduled' | 'archived';
  is_home_page: boolean;
  page_seo_json: Record<string, unknown>;
  published_at_utc: Date | null;
  created_at_utc: Date;
  updated_at_utc: Date;
}

export interface LandingSectionTypeRow {
  landing_section_type_code: string;
  landing_section_type_name: string;
  category: 'hero' | 'feature' | 'catalog' | 'media' | 'comparison' | 'form' | 'faq' | 'footer' | 'cta' | 'content';
  field_schema_json: Record<string, unknown>;
  default_payload_json: Record<string, unknown>;
  preview_image_url: string | null;
  is_active: boolean;
  created_at_utc: Date;
  updated_at_utc: Date;
}

export interface LandingPageSectionRow {
  landing_page_section_id: string;
  landing_page_id: string;
  landing_section_type_code: string;
  section_anchor_id: string | null;
  section_order: number;
  is_section_enabled: boolean;
  published_payload_json: Record<string, unknown>;
  draft_payload_json: Record<string, unknown> | null;
  typography_config_json: Record<string, unknown>;
  custom_css_class: string | null;
  created_at_utc: Date;
  updated_at_utc: Date;
}

export interface LandingMediaAssetRow {
  landing_media_asset_id: string;
  landing_site_id: string | null;
  media_slot_code: string | null;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size_bytes: string | number;
  width_px: number | null;
  height_px: number | null;
  alt_text_vi: string | null;
  alt_text_en: string | null;
  storage_provider: 'local' | 's3' | 'supabase_storage' | 'supabase_pg_bytea';
  file_content_bytea?: Buffer | Uint8Array | null;
  created_at_utc: Date;
  updated_at_utc: Date;
}

export interface LandingFormField {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'checkbox' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  default_value?: string | number | boolean;
  validation_pattern?: string;
  conditional_visible_on?: {
    field: string;
    value: unknown;
  };
}

export interface LandingFormRow {
  landing_form_id: string;
  landing_site_id: string;
  form_code: string;
  form_name: string;
  fields_schema_json: LandingFormField[];
  notification_emails_json: string[];
  google_sheet_config_json: {
    spreadsheet_id?: string;
    sheet_name?: string;
    sheet_name_conditional_map?: Record<string, string>;
    column_mapping?: Record<string, string>;
    [key: string]: unknown;
  };
  success_action: 'message' | 'redirect' | 'modal_download';
  success_payload_json: {
    message?: string;
    redirect_url?: string;
    modal_title?: string;
    modal_description?: string;
    download_url_map?: Record<string, string>;
    default_download_url?: string;
    [key: string]: unknown;
  };
  is_form_active: boolean;
  created_at_utc: Date;
  updated_at_utc: Date;
}

export interface LandingLeadSubmissionRow {
  landing_lead_submission_id: string;
  landing_form_id: string;
  landing_site_id: string;
  landing_page_id: string | null;
  customer_full_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_company: string | null;
  submitted_fields_json: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer_url: string | null;
  submitted_at_utc: Date;
}

export interface LandingLeadDeliveryRow {
  landing_lead_delivery_id: string;
  landing_lead_submission_id: string;
  delivery_channel: 'google_sheets' | 'email' | 'webhook' | 'crm';
  delivery_status: 'pending' | 'success' | 'failed' | 'retrying';
  delivery_payload_json: Record<string, unknown>;
  response_body: string | null;
  error_message: string | null;
  retry_count: number;
  next_retry_at_utc: Date | null;
  delivered_at_utc: Date | null;
  created_at_utc: Date;
  updated_at_utc: Date;
}

export interface LandingContentRevisionRow {
  landing_content_revision_id: string;
  landing_page_id: string;
  revision_number: number;
  revision_snapshot_json: Record<string, unknown>;
  revision_summary: string | null;
  created_by: string;
  created_at_utc: Date;
}

// ----------------------------------------------------------------------------
// Data Access Helper Functions
// ----------------------------------------------------------------------------

export async function getLandingSiteByCode(siteCode: string, tx?: Sql): Promise<LandingSiteRow | null> {
  const sql = tx || getDb();
  const rows = await sql<LandingSiteRow[]>`
    SELECT * FROM cic_landing.landing_sites
    WHERE landing_site_code = ${siteCode}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getLandingSiteByDomain(domain: string, tx?: Sql): Promise<LandingSiteRow | null> {
  const sql = tx || getDb();
  const cleanDomain = domain.toLowerCase().split(':')[0];
  const rows = await sql<LandingSiteRow[]>`
    SELECT * FROM cic_landing.landing_sites
    WHERE primary_domain = ${cleanDomain}
       OR custom_domains_json ? ${cleanDomain}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getAllLandingSites(tx?: Sql): Promise<LandingSiteRow[]> {
  const sql = tx || getDb();
  return sql<LandingSiteRow[]>`
    SELECT * FROM cic_landing.landing_sites
    ORDER BY landing_site_code ASC
  `;
}

export async function getLandingPageWithSections(
  siteId: string,
  slug = 'home',
  locale = 'vi',
  tx?: Sql
): Promise<{
  page: LandingPageRow;
  sections: LandingPageSectionRow[];
} | null> {
  const sql = tx || getDb();

  const pages = await sql<LandingPageRow[]>`
    SELECT * FROM cic_landing.landing_pages
    WHERE landing_site_id = ${siteId}
      AND (landing_page_slug = ${slug} OR is_home_page = true)
      AND landing_page_locale = ${locale}
      AND page_status != 'archived'
    ORDER BY is_home_page DESC
    LIMIT 1
  `;

  if (!pages.length) return null;
  const page = pages[0];

  const sections = await sql<LandingPageSectionRow[]>`
    SELECT * FROM cic_landing.landing_page_sections
    WHERE landing_page_id = ${page.landing_page_id}
      AND is_section_enabled = true
    ORDER BY section_order ASC
  `;

  return { page, sections };
}

export async function getLandingFormsBySite(siteId: string, tx?: Sql): Promise<LandingFormRow[]> {
  const sql = tx || getDb();
  return sql<LandingFormRow[]>`
    SELECT * FROM cic_landing.landing_forms
    WHERE landing_site_id = ${siteId}
      AND is_form_active = true
    ORDER BY form_code ASC
  `;
}

export async function getLandingFormByCode(siteId: string, formCode: string, tx?: Sql): Promise<LandingFormRow | null> {
  const sql = tx || getDb();
  const rows = await sql<LandingFormRow[]>`
    SELECT * FROM cic_landing.landing_forms
    WHERE landing_site_id = ${siteId}
      AND form_code = ${formCode}
      AND is_form_active = true
    LIMIT 1
  `;
  return rows[0] || null;
}

export interface InsertLandingLeadInput {
  landing_form_id: string;
  landing_site_id: string;
  landing_page_id?: string | null;
  customer_full_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_company?: string | null;
  submitted_fields_json: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer_url?: string | null;
}

export async function insertLandingLead(
  input: InsertLandingLeadInput,
  tx?: Sql
): Promise<LandingLeadSubmissionRow> {
  const sql = tx || getDb();
  const rows = await sql<LandingLeadSubmissionRow[]>`
    INSERT INTO cic_landing.landing_lead_submissions (
      landing_form_id,
      landing_site_id,
      landing_page_id,
      customer_full_name,
      customer_phone,
      customer_email,
      customer_company,
      submitted_fields_json,
      ip_address,
      user_agent,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      referrer_url
    ) VALUES (
      ${input.landing_form_id},
      ${input.landing_site_id},
      ${input.landing_page_id || null},
      ${input.customer_full_name || null},
      ${input.customer_phone || null},
      ${input.customer_email || null},
      ${input.customer_company || null},
      ${sql.json(input.submitted_fields_json as never)},
      ${input.ip_address || null},
      ${input.user_agent || null},
      ${input.utm_source || null},
      ${input.utm_medium || null},
      ${input.utm_campaign || null},
      ${input.utm_term || null},
      ${input.utm_content || null},
      ${input.referrer_url || null}
    )
    RETURNING *
  `;
  return rows[0];
}

export interface InsertLeadDeliveryInput {
  landing_lead_submission_id: string;
  delivery_channel: 'google_sheets' | 'email' | 'webhook' | 'crm';
  delivery_status: 'pending' | 'success' | 'failed' | 'retrying';
  delivery_payload_json: Record<string, unknown>;
  response_body?: string | null;
  error_message?: string | null;
}

export async function insertLeadDelivery(
  input: InsertLeadDeliveryInput,
  tx?: Sql
): Promise<LandingLeadDeliveryRow> {
  const sql = tx || getDb();
  const rows = await sql<LandingLeadDeliveryRow[]>`
    INSERT INTO cic_landing.landing_lead_deliveries (
      landing_lead_submission_id,
      delivery_channel,
      delivery_status,
      delivery_payload_json,
      response_body,
      error_message,
      delivered_at_utc
    ) VALUES (
      ${input.landing_lead_submission_id},
      ${input.delivery_channel},
      ${input.delivery_status},
      ${sql.json(input.delivery_payload_json as never)},
      ${input.response_body || null},
      ${input.error_message || null},
      ${input.delivery_status === 'success' ? sql`NOW()` : null}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function getRecentLeadSubmissions(siteId?: string, limit = 50, tx?: Sql): Promise<LandingLeadSubmissionRow[]> {
  const sql = tx || getDb();
  if (siteId) {
    return sql<LandingLeadSubmissionRow[]>`
      SELECT * FROM cic_landing.landing_lead_submissions
      WHERE landing_site_id = ${siteId}
      ORDER BY submitted_at_utc DESC
      LIMIT ${limit}
    `;
  }
  return sql<LandingLeadSubmissionRow[]>`
    SELECT * FROM cic_landing.landing_lead_submissions
    ORDER BY submitted_at_utc DESC
    LIMIT ${limit}
  `;
}

export async function recordLandingPageView(
  siteId: string,
  visitorHash?: string,
  tx?: Sql
): Promise<void> {
  const sql = tx || getDb();
  try {
    let uniqueIncrement = 1;
    if (visitorHash) {
      const inserted = await sql<{ visitor_hash: string }[]>`
        INSERT INTO cic_landing.landing_daily_visitors (landing_site_id, view_date, visitor_hash)
        VALUES (${siteId}, CURRENT_DATE, ${visitorHash})
        ON CONFLICT (landing_site_id, view_date, visitor_hash) DO NOTHING
        RETURNING visitor_hash
      `;
      uniqueIncrement = inserted.length > 0 ? 1 : 0;
    }

    await sql`
      INSERT INTO cic_landing.landing_page_views (landing_site_id, view_date, views_count, unique_visitors_count)
      VALUES (${siteId}, CURRENT_DATE, 1, 1)
      ON CONFLICT (landing_site_id, view_date) DO UPDATE
      SET views_count = cic_landing.landing_page_views.views_count + 1,
          unique_visitors_count = cic_landing.landing_page_views.unique_visitors_count + ${uniqueIncrement},
          updated_at_utc = NOW()
    `;
  } catch {
    // Non-blocking telemetry
  }
}
