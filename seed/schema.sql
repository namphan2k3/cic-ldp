-- CIC Landing Platform - Auto-Seed Database Schema
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

