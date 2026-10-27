export const SCHEMA_SQL_TEMPLATE = `-- CIC Landing Platform - Auto-Seed Database Schema
CREATE SCHEMA IF NOT EXISTS cic_landing;

CREATE TABLE IF NOT EXISTS cic_landing.landing_sites (
  landing_site_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_code varchar(64) NOT NULL UNIQUE,
  landing_site_name varchar(255) NOT NULL,
  landing_site_type varchar(32) NOT NULL DEFAULT 'landing',
  primary_domain varchar(255) NOT NULL UNIQUE,
  custom_domains_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  supported_locales_json jsonb NOT NULL DEFAULT '["vi"]'::jsonb,
  default_locale varchar(10) NOT NULL DEFAULT 'vi',
  site_status varchar(32) NOT NULL DEFAULT 'active',
  brand_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_meta_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  tracking_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  updated_at_utc timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_section_types (
  landing_section_type_code varchar(64) PRIMARY KEY,
  landing_section_type_name varchar(255) NOT NULL,
  category varchar(64) NOT NULL DEFAULT 'content',
  field_schema_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  updated_at_utc timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_pages (
  landing_page_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_id uuid NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  landing_page_slug varchar(255) NOT NULL,
  landing_page_locale varchar(10) NOT NULL DEFAULT 'vi',
  page_title varchar(255) NOT NULL,
  page_status varchar(32) NOT NULL DEFAULT 'published',
  is_home_page boolean NOT NULL DEFAULT false,
  page_seo_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at_utc timestamptz,
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  updated_at_utc timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_landing_pages_site_slug_locale UNIQUE (landing_site_id, landing_page_slug, landing_page_locale)
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_page_sections (
  landing_page_section_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES cic_landing.landing_pages(landing_page_id) ON DELETE CASCADE,
  landing_section_type_code varchar(64) NOT NULL REFERENCES cic_landing.landing_section_types(landing_section_type_code),
  section_anchor_id varchar(128),
  section_order integer NOT NULL DEFAULT 0,
  is_section_enabled boolean NOT NULL DEFAULT true,
  published_payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  draft_payload_json jsonb,
  typography_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_css_class varchar(255),
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  updated_at_utc timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_forms (
  landing_form_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_id uuid NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  form_code varchar(64) NOT NULL,
  form_name varchar(255) NOT NULL,
  fields_schema_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  notification_emails_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  google_sheet_config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  success_action varchar(32) NOT NULL DEFAULT 'message',
  success_payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_form_active boolean NOT NULL DEFAULT true,
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  updated_at_utc timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_landing_forms_site_code UNIQUE (landing_site_id, form_code)
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_media_assets (
  landing_media_asset_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_id uuid REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE SET NULL,
  media_slot_code varchar(64),
  file_name varchar(255) NOT NULL,
  file_path text NOT NULL,
  mime_type varchar(128) NOT NULL,
  file_size_bytes bigint NOT NULL DEFAULT 0,
  width_px integer,
  height_px integer,
  alt_text_vi text,
  alt_text_en text,
  storage_provider varchar(32) NOT NULL DEFAULT 'local',
  file_content_bytea bytea,
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  updated_at_utc timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_lead_submissions (
  landing_lead_submission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_form_id uuid NOT NULL REFERENCES cic_landing.landing_forms(landing_form_id) ON DELETE CASCADE,
  landing_site_id uuid NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  landing_page_id uuid REFERENCES cic_landing.landing_pages(landing_page_id) ON DELETE SET NULL,
  customer_full_name varchar(255),
  customer_phone varchar(64),
  customer_email varchar(255),
  customer_company varchar(255),
  submitted_fields_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address varchar(64),
  user_agent text,
  utm_source varchar(128),
  utm_medium varchar(128),
  utm_campaign varchar(128),
  utm_term varchar(128),
  utm_content varchar(128),
  referrer_url text,
  submitted_at_utc timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_lead_deliveries (
  landing_lead_delivery_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_lead_submission_id uuid NOT NULL REFERENCES cic_landing.landing_lead_submissions(landing_lead_submission_id) ON DELETE CASCADE,
  delivery_channel varchar(32) NOT NULL,
  delivery_status varchar(32) NOT NULL DEFAULT 'pending',
  delivery_payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_body text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at_utc timestamptz,
  delivered_at_utc timestamptz,
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  updated_at_utc timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_content_revisions (
  landing_content_revision_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES cic_landing.landing_pages(landing_page_id) ON DELETE CASCADE,
  revision_number integer NOT NULL,
  revision_snapshot_json jsonb NOT NULL,
  revision_summary text,
  created_by varchar(128) DEFAULT 'System',
  created_at_utc timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_landing_revisions_page_number UNIQUE (landing_page_id, revision_number)
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_page_views (
  landing_site_id uuid NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  views_count integer NOT NULL DEFAULT 0,
  unique_visitors_count integer NOT NULL DEFAULT 0,
  updated_at_utc timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (landing_site_id, view_date)
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_daily_visitors (
  landing_site_id uuid NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  visitor_hash text NOT NULL,
  first_seen_at_utc timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (landing_site_id, view_date, visitor_hash)
);

CREATE TABLE IF NOT EXISTS cic_landing.landing_admin_accounts (
  account_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(64) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name varchar(128) NOT NULL,
  role varchar(32) NOT NULL DEFAULT 'site_admin',
  landing_site_code varchar(64),
  is_active boolean NOT NULL DEFAULT true,
  updated_at_utc timestamptz NOT NULL DEFAULT now()
);

-- Expose updatable views in public schema so Supabase Studio default view shows all landing tables & accounts
CREATE OR REPLACE VIEW public.landing_admin_accounts AS SELECT * FROM cic_landing.landing_admin_accounts;
CREATE OR REPLACE VIEW public.landing_sites AS SELECT * FROM cic_landing.landing_sites;
CREATE OR REPLACE VIEW public.landing_pages AS SELECT * FROM cic_landing.landing_pages;
CREATE OR REPLACE VIEW public.landing_page_sections AS SELECT * FROM cic_landing.landing_page_sections;
CREATE OR REPLACE VIEW public.landing_forms AS SELECT * FROM cic_landing.landing_forms;
CREATE OR REPLACE VIEW public.landing_lead_submissions AS SELECT * FROM cic_landing.landing_lead_submissions;
CREATE OR REPLACE VIEW public.landing_media_assets AS SELECT * FROM cic_landing.landing_media_assets;
`;

export const AUTO_SEED_MJS_TEMPLATE = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rawDbUrl =
  process.env.DATABASE_URL?.trim() ||
  'postgresql://postgres:cic_supabase_2026@127.0.0.1:54322/postgres';
const dbUrl = rawDbUrl.replace('@localhost:', '@127.0.0.1:');

const sql = postgres(dbUrl, { max: 5, prepare: false });

async function runAutoSeed() {
  try {
    console.log('[Auto-Seed] Đang kết nối tới Database chung trên Host...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await sql.unsafe(schemaSql);

    const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'));

    // 1. Seed section types
    for (const st of rawData.sectionTypes || []) {
      await sql\`
        INSERT INTO cic_landing.landing_section_types (
          landing_section_type_code, landing_section_type_name, category,
          field_schema_json, default_payload_json, preview_image_url, is_active
        ) VALUES (
          \${st.landing_section_type_code}, \${st.landing_section_type_name}, \${st.category},
          \${sql.json(st.field_schema_json || {})}, \${sql.json(st.default_payload_json || {})},
          \${st.preview_image_url || null}, \${st.is_active ?? true}
        )
        ON CONFLICT (landing_section_type_code) DO UPDATE SET
          landing_section_type_name = EXCLUDED.landing_section_type_name,
          field_schema_json = EXCLUDED.field_schema_json,
          default_payload_json = EXCLUDED.default_payload_json,
          updated_at_utc = NOW()
      \`;
    }

    // 2. Seed sites
    for (const s of rawData.sites || []) {
      await sql\`
        INSERT INTO cic_landing.landing_sites (
          landing_site_id, landing_site_code, landing_site_name, landing_site_type,
          primary_domain, custom_domains_json, supported_locales_json, default_locale,
          site_status, brand_config_json, seo_meta_json, tracking_config_json
        ) VALUES (
          \${s.landing_site_id}, \${s.landing_site_code}, \${s.landing_site_name}, \${s.landing_site_type || 'landing'},
          \${s.primary_domain}, \${sql.json(s.custom_domains_json || [])}, \${sql.json(s.supported_locales_json || ['vi'])},
          \${s.default_locale || 'vi'}, \${s.site_status || 'active'},
          \${sql.json(s.brand_config_json || {})}, \${sql.json(s.seo_meta_json || {})}, \${sql.json(s.tracking_config_json || {})}
        )
        ON CONFLICT (landing_site_id) DO UPDATE SET
          landing_site_name = EXCLUDED.landing_site_name,
          primary_domain = EXCLUDED.primary_domain,
          custom_domains_json = EXCLUDED.custom_domains_json,
          supported_locales_json = EXCLUDED.supported_locales_json,
          site_status = EXCLUDED.site_status,
          brand_config_json = EXCLUDED.brand_config_json,
          seo_meta_json = EXCLUDED.seo_meta_json,
          tracking_config_json = EXCLUDED.tracking_config_json,
          updated_at_utc = NOW()
      \`;
    }

    // 3. Seed pages
    for (const p of rawData.pages || []) {
      await sql\`
        INSERT INTO cic_landing.landing_pages (
          landing_page_id, landing_site_id, landing_page_slug, landing_page_locale,
          page_title, page_status, is_home_page, page_seo_json, published_at_utc
        ) VALUES (
          \${p.landing_page_id}, \${p.landing_site_id}, \${p.landing_page_slug}, \${p.landing_page_locale},
          \${p.page_title}, \${p.page_status || 'published'}, \${p.is_home_page ?? true},
          \${sql.json(p.page_seo_json || {})}, \${p.published_at_utc || new Date().toISOString()}
        )
        ON CONFLICT (landing_page_id) DO UPDATE SET
          page_title = EXCLUDED.page_title,
          page_status = EXCLUDED.page_status,
          page_seo_json = EXCLUDED.page_seo_json,
          updated_at_utc = NOW()
      \`;
    }

    // 4. Seed sections
    for (const sec of rawData.sections || []) {
      await sql\`
        INSERT INTO cic_landing.landing_page_sections (
          landing_page_section_id, landing_page_id, landing_section_type_code,
          section_anchor_id, section_order, is_section_enabled,
          published_payload_json, draft_payload_json, typography_config_json, custom_css_class
        ) VALUES (
          \${sec.landing_page_section_id}, \${sec.landing_page_id}, \${sec.landing_section_type_code},
          \${sec.section_anchor_id || null}, \${sec.section_order ?? 0}, \${sec.is_section_enabled ?? true},
          \${sql.json(sec.published_payload_json || {})},
          \${sec.draft_payload_json ? sql.json(sec.draft_payload_json) : null},
          \${sql.json(sec.typography_config_json || {})}, \${sec.custom_css_class || null}
        )
        ON CONFLICT (landing_page_section_id) DO UPDATE SET
          section_order = EXCLUDED.section_order,
          is_section_enabled = EXCLUDED.is_section_enabled,
          published_payload_json = EXCLUDED.published_payload_json,
          draft_payload_json = EXCLUDED.draft_payload_json,
          typography_config_json = EXCLUDED.typography_config_json,
          updated_at_utc = NOW()
      \`;
    }

    // 5. Seed forms
    for (const f of rawData.forms || []) {
      await sql\`
        INSERT INTO cic_landing.landing_forms (
          landing_form_id, landing_site_id, form_code, form_name,
          fields_schema_json, notification_emails_json, google_sheet_config_json,
          success_action, success_payload_json, is_form_active
        ) VALUES (
          \${f.landing_form_id}, \${f.landing_site_id}, \${f.form_code}, \${f.form_name},
          \${sql.json(f.fields_schema_json || [])}, \${sql.json(f.notification_emails_json || [])},
          \${sql.json(f.google_sheet_config_json || {})}, \${f.success_action || 'message'},
          \${sql.json(f.success_payload_json || {})}, \${f.is_form_active ?? true}
        )
        ON CONFLICT (landing_form_id) DO UPDATE SET
          form_name = EXCLUDED.form_name,
          fields_schema_json = EXCLUDED.fields_schema_json,
          google_sheet_config_json = EXCLUDED.google_sheet_config_json,
          success_action = EXCLUDED.success_action,
          success_payload_json = EXCLUDED.success_payload_json,
          is_form_active = EXCLUDED.is_form_active,
          updated_at_utc = NOW()
      \`;
    }

    // 6. Seed media assets (including binary bytea decoded from base64 or read from apps/landing-hub/public/sites)
    const siteIdToCode = Object.fromEntries((rawData.sites || []).map((s) => [s.landing_site_id, s.landing_site_code]));
    const publicDir = path.resolve(__dirname, '../apps/landing-hub/public');
    for (const m of rawData.media || []) {
      let byteaBuf = m.file_content_base64 ? Buffer.from(m.file_content_base64, 'base64') : null;
      if (!byteaBuf && m.file_path) {
        const sc = siteIdToCode[m.landing_site_id] || '';
        const rel = String(m.file_path).replace(/^\\/+/, '');
        const p1 = sc ? path.join(publicDir, 'sites', sc, rel) : path.join(publicDir, rel);
        const p2 = path.join(publicDir, rel);
        if (fs.existsSync(p1) && fs.statSync(p1).isFile()) {
          byteaBuf = fs.readFileSync(p1);
        } else if (fs.existsSync(p2) && fs.statSync(p2).isFile()) {
          byteaBuf = fs.readFileSync(p2);
        }
      }
      await sql\`
        INSERT INTO cic_landing.landing_media_assets (
          landing_media_asset_id, landing_site_id, media_slot_code,
          file_name, file_path, mime_type, file_size_bytes,
          width_px, height_px, alt_text_vi, alt_text_en,
          storage_provider, file_content_bytea
        ) VALUES (
          \${m.landing_media_asset_id}, \${m.landing_site_id || null}, \${m.media_slot_code || null},
          \${m.file_name}, \${m.file_path}, \${m.mime_type}, \${Number(m.file_size_bytes || (byteaBuf ? byteaBuf.length : 0))},
          \${m.width_px || null}, \${m.height_px || null}, \${m.alt_text_vi || null}, \${m.alt_text_en || null},
          \${m.storage_provider || 'supabase_pg_bytea'}, \${byteaBuf}
        )
        ON CONFLICT (landing_media_asset_id) DO UPDATE SET
          file_name = EXCLUDED.file_name,
          file_path = EXCLUDED.file_path,
          mime_type = EXCLUDED.mime_type,
          file_size_bytes = EXCLUDED.file_size_bytes,
          file_content_bytea = COALESCE(EXCLUDED.file_content_bytea, cic_landing.landing_media_assets.file_content_bytea),
          updated_at_utc = NOW()
      \`;
    }

    // 7. Seed historical leads (never overwrite existing records on Host)
    for (const l of rawData.leads || []) {
      await sql\`
        INSERT INTO cic_landing.landing_lead_submissions (
          landing_lead_submission_id, landing_form_id, landing_site_id, landing_page_id,
          customer_full_name, customer_phone, customer_email, customer_company,
          submitted_fields_json, utm_source, utm_medium, utm_campaign, submitted_at_utc
        ) VALUES (
          \${l.landing_lead_submission_id}, \${l.landing_form_id}, \${l.landing_site_id}, \${l.landing_page_id || null},
          \${l.customer_full_name || null}, \${l.customer_phone || null}, \${l.customer_email || null}, \${l.customer_company || null},
          \${sql.json(l.submitted_fields_json || {})}, \${l.utm_source || null}, \${l.utm_medium || null},
          \${l.utm_campaign || null}, \${l.submitted_at_utc}
        )
        ON CONFLICT (landing_lead_submission_id) DO NOTHING
      \`;
    }

    // 8. Seed baseline page views (keep GREATEST so live server counts on Host are never reduced)
    for (const v of rawData.pageViews || []) {
      await sql\`
        INSERT INTO cic_landing.landing_page_views (
          landing_site_id, view_date, views_count, unique_visitors_count
        ) VALUES (
          \${v.landing_site_id}, \${v.view_date}, \${v.views_count || 0}, \${v.unique_visitors_count || 0}
        )
        ON CONFLICT (landing_site_id, view_date) DO UPDATE SET
          views_count = GREATEST(cic_landing.landing_page_views.views_count, EXCLUDED.views_count),
          unique_visitors_count = GREATEST(cic_landing.landing_page_views.unique_visitors_count, EXCLUDED.unique_visitors_count),
          updated_at_utc = NOW()
      \`;
    }

    // 9. Seed admin accounts (per-site auth + super admin)
    for (const acc of rawData.adminAccounts || []) {
      await sql\`
        INSERT INTO cic_landing.landing_admin_accounts (
          username, password_hash, display_name, role, landing_site_code, is_active
        ) VALUES (
          \${acc.username}, \${acc.password_hash}, \${acc.display_name},
          \${acc.role || 'site_admin'}, \${acc.landing_site_code || null}, \${acc.is_active ?? true}
        )
        ON CONFLICT (username) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          display_name = EXCLUDED.display_name,
          role = EXCLUDED.role,
          landing_site_code = EXCLUDED.landing_site_code,
          is_active = EXCLUDED.is_active,
          updated_at_utc = NOW()
      \`;
    }

    console.log(
      \`[Auto-Seed] Hoàn tất nạp Database: \${(rawData.sites || []).length} website, \${(rawData.sections || []).length} mục nội dung, \${(rawData.media || []).length} tệp media.\`
    );
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('[Auto-Seed] Lỗi khi đồng bộ Database:', err);
    await sql.end();
    process.exit(1);
  }
}

runAutoSeed();
`;
