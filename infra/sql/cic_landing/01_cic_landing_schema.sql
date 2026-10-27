-- ============================================================================
-- Schema: cic_landing
-- Project: CIC Unified Landing Platform
-- Description: Multi-site, multi-page, flexible section page builder,
--              schema-driven forms, lead submissions & delivery logs.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS cic_landing;

-- 1. landing_sites: Multi-tenant site registry
CREATE TABLE IF NOT EXISTS cic_landing.landing_sites (
  landing_site_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_code VARCHAR(64) NOT NULL UNIQUE,
  landing_site_name VARCHAR(255) NOT NULL,
  landing_site_type VARCHAR(32) NOT NULL DEFAULT 'landing',
  primary_domain VARCHAR(255) NOT NULL UNIQUE,
  custom_domains_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  supported_locales_json JSONB NOT NULL DEFAULT '["vi"]'::jsonb,
  default_locale VARCHAR(10) NOT NULL DEFAULT 'vi',
  site_status VARCHAR(32) NOT NULL DEFAULT 'active', -- active, maintenance, archived
  brand_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_meta_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracking_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. landing_pages: Pages belonging to a site (multi-locale supported)
CREATE TABLE IF NOT EXISTS cic_landing.landing_pages (
  landing_page_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_id UUID NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  landing_page_slug VARCHAR(255) NOT NULL,
  landing_page_locale VARCHAR(10) NOT NULL DEFAULT 'vi',
  page_title VARCHAR(255) NOT NULL,
  page_status VARCHAR(32) NOT NULL DEFAULT 'published', -- draft, published, scheduled, archived
  is_home_page BOOLEAN NOT NULL DEFAULT false,
  page_seo_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at_utc TIMESTAMPTZ,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_landing_pages_site_slug_locale UNIQUE (landing_site_id, landing_page_slug, landing_page_locale)
);

-- 3. landing_section_types: Catalog of section types with field schemas
CREATE TABLE IF NOT EXISTS cic_landing.landing_section_types (
  landing_section_type_code VARCHAR(64) PRIMARY KEY,
  landing_section_type_name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL DEFAULT 'content', -- hero, feature, catalog, media, comparison, form, faq, footer, cta
  field_schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. landing_page_sections: Ordered instances of sections on a page
CREATE TABLE IF NOT EXISTS cic_landing.landing_page_sections (
  landing_page_section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES cic_landing.landing_pages(landing_page_id) ON DELETE CASCADE,
  landing_section_type_code VARCHAR(64) NOT NULL REFERENCES cic_landing.landing_section_types(landing_section_type_code),
  section_anchor_id VARCHAR(128),
  section_order INT NOT NULL DEFAULT 0,
  is_section_enabled BOOLEAN NOT NULL DEFAULT true,
  published_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft_payload_json JSONB,
  typography_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_css_class VARCHAR(255),
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. landing_media_assets: Media inventory with metadata & slots
CREATE TABLE IF NOT EXISTS cic_landing.landing_media_assets (
  landing_media_asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_id UUID REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE SET NULL,
  media_slot_code VARCHAR(64),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  width_px INT,
  height_px INT,
  alt_text_vi TEXT,
  alt_text_en TEXT,
  storage_provider VARCHAR(32) NOT NULL DEFAULT 'local', -- local, s3, supabase_storage
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. landing_forms: Dynamic schema-driven forms per site
CREATE TABLE IF NOT EXISTS cic_landing.landing_forms (
  landing_form_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_site_id UUID NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  form_code VARCHAR(64) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  fields_schema_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  notification_emails_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  google_sheet_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  success_action VARCHAR(32) NOT NULL DEFAULT 'message', -- message, redirect, modal_download
  success_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_form_active BOOLEAN NOT NULL DEFAULT true,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_landing_forms_site_code UNIQUE (landing_site_id, form_code)
);

-- 7. landing_lead_submissions: Raw incoming customer leads
CREATE TABLE IF NOT EXISTS cic_landing.landing_lead_submissions (
  landing_lead_submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_form_id UUID NOT NULL REFERENCES cic_landing.landing_forms(landing_form_id) ON DELETE CASCADE,
  landing_site_id UUID NOT NULL REFERENCES cic_landing.landing_sites(landing_site_id) ON DELETE CASCADE,
  landing_page_id UUID REFERENCES cic_landing.landing_pages(landing_page_id) ON DELETE SET NULL,
  customer_full_name VARCHAR(255),
  customer_phone VARCHAR(64),
  customer_email VARCHAR(255),
  customer_company VARCHAR(255),
  submitted_fields_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(64),
  user_agent TEXT,
  utm_source VARCHAR(128),
  utm_medium VARCHAR(128),
  utm_campaign VARCHAR(128),
  utm_term VARCHAR(128),
  utm_content VARCHAR(128),
  referrer_url TEXT,
  submitted_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. landing_lead_deliveries: Delivery tracking for each channel (Google Sheet, Email, etc.)
CREATE TABLE IF NOT EXISTS cic_landing.landing_lead_deliveries (
  landing_lead_delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_lead_submission_id UUID NOT NULL REFERENCES cic_landing.landing_lead_submissions(landing_lead_submission_id) ON DELETE CASCADE,
  delivery_channel VARCHAR(32) NOT NULL, -- google_sheets, email, webhook, crm
  delivery_status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, success, failed, retrying
  delivery_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_body TEXT,
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  next_retry_at_utc TIMESTAMPTZ,
  delivered_at_utc TIMESTAMPTZ,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. landing_content_revisions: Full page snapshots with rollback capability
CREATE TABLE IF NOT EXISTS cic_landing.landing_content_revisions (
  landing_content_revision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES cic_landing.landing_pages(landing_page_id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  revision_snapshot_json JSONB NOT NULL,
  revision_summary TEXT,
  created_by VARCHAR(128) DEFAULT 'System',
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_landing_revisions_page_number UNIQUE (landing_page_id, revision_number)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_landing_sites_code ON cic_landing.landing_sites(landing_site_code);
CREATE INDEX IF NOT EXISTS idx_landing_sites_primary_domain ON cic_landing.landing_sites(primary_domain);
CREATE INDEX IF NOT EXISTS idx_landing_pages_site_locale ON cic_landing.landing_pages(landing_site_id, landing_page_locale);
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_page_order ON cic_landing.landing_page_sections(landing_page_id, section_order);
CREATE INDEX IF NOT EXISTS idx_landing_lead_submissions_site ON cic_landing.landing_lead_submissions(landing_site_id, submitted_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_landing_lead_submissions_form ON cic_landing.landing_lead_submissions(landing_form_id, submitted_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_landing_lead_deliveries_submission ON cic_landing.landing_lead_deliveries(landing_lead_submission_id);
CREATE INDEX IF NOT EXISTS idx_landing_lead_deliveries_status ON cic_landing.landing_lead_deliveries(delivery_status, next_retry_at_utc);
CREATE INDEX IF NOT EXISTS idx_landing_revisions_page ON cic_landing.landing_content_revisions(landing_page_id, revision_number DESC);

-- Permissions
GRANT USAGE ON SCHEMA cic_landing TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA cic_landing TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA cic_landing TO anon, authenticated;
GRANT INSERT ON cic_landing.landing_lead_submissions TO anon, authenticated;
GRANT INSERT ON cic_landing.landing_lead_deliveries TO anon, authenticated;
