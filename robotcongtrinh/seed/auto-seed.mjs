import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const envExamplePath = path.resolve(__dirname, '../.env.example');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(envExamplePath)) {
  dotenv.config({ path: envExamplePath });
}

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
      await sql`
        INSERT INTO cic_landing.landing_section_types (
          landing_section_type_code, landing_section_type_name, category,
          field_schema_json, default_payload_json, preview_image_url, is_active
        ) VALUES (
          ${st.landing_section_type_code}, ${st.landing_section_type_name}, ${st.category},
          ${sql.json(st.field_schema_json || {})}, ${sql.json(st.default_payload_json || {})},
          ${st.preview_image_url || null}, ${st.is_active ?? true}
        )
        ON CONFLICT (landing_section_type_code) DO UPDATE SET
          landing_section_type_name = EXCLUDED.landing_section_type_name,
          field_schema_json = EXCLUDED.field_schema_json,
          default_payload_json = EXCLUDED.default_payload_json,
          updated_at_utc = NOW()
      `;
    }

    // 2. Seed sites
    for (const s of rawData.sites || []) {
      await sql`
        INSERT INTO cic_landing.landing_sites (
          landing_site_id, landing_site_code, landing_site_name, landing_site_type,
          primary_domain, custom_domains_json, supported_locales_json, default_locale,
          site_status, brand_config_json, seo_meta_json, tracking_config_json
        ) VALUES (
          ${s.landing_site_id}, ${s.landing_site_code}, ${s.landing_site_name}, ${s.landing_site_type || 'landing'},
          ${s.primary_domain}, ${sql.json(s.custom_domains_json || [])}, ${sql.json(s.supported_locales_json || ['vi'])},
          ${s.default_locale || 'vi'}, ${s.site_status || 'active'},
          ${sql.json(s.brand_config_json || {})}, ${sql.json(s.seo_meta_json || {})}, ${sql.json(s.tracking_config_json || {})}
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
      `;
    }

    // 3. Seed pages
    for (const p of rawData.pages || []) {
      await sql`
        INSERT INTO cic_landing.landing_pages (
          landing_page_id, landing_site_id, landing_page_slug, landing_page_locale,
          page_title, page_status, is_home_page, page_seo_json, published_at_utc
        ) VALUES (
          ${p.landing_page_id}, ${p.landing_site_id}, ${p.landing_page_slug}, ${p.landing_page_locale},
          ${p.page_title}, ${p.page_status || 'published'}, ${p.is_home_page ?? true},
          ${sql.json(p.page_seo_json || {})}, ${p.published_at_utc || new Date().toISOString()}
        )
        ON CONFLICT (landing_page_id) DO UPDATE SET
          page_title = EXCLUDED.page_title,
          page_status = EXCLUDED.page_status,
          page_seo_json = EXCLUDED.page_seo_json,
          updated_at_utc = NOW()
      `;
    }

    // 4. Seed sections
    for (const sec of rawData.sections || []) {
      await sql`
        INSERT INTO cic_landing.landing_page_sections (
          landing_page_section_id, landing_page_id, landing_section_type_code,
          section_anchor_id, section_order, is_section_enabled,
          published_payload_json, draft_payload_json, typography_config_json, custom_css_class
        ) VALUES (
          ${sec.landing_page_section_id}, ${sec.landing_page_id}, ${sec.landing_section_type_code},
          ${sec.section_anchor_id || null}, ${sec.section_order ?? 0}, ${sec.is_section_enabled ?? true},
          ${sql.json(sec.published_payload_json || {})},
          ${sec.draft_payload_json ? sql.json(sec.draft_payload_json) : null},
          ${sql.json(sec.typography_config_json || {})}, ${sec.custom_css_class || null}
        )
        ON CONFLICT (landing_page_section_id) DO UPDATE SET
          section_order = EXCLUDED.section_order,
          is_section_enabled = EXCLUDED.is_section_enabled,
          published_payload_json = EXCLUDED.published_payload_json,
          draft_payload_json = EXCLUDED.draft_payload_json,
          typography_config_json = EXCLUDED.typography_config_json,
          updated_at_utc = NOW()
      `;
    }

    // 5. Seed forms
    for (const f of rawData.forms || []) {
      await sql`
        INSERT INTO cic_landing.landing_forms (
          landing_form_id, landing_site_id, form_code, form_name,
          fields_schema_json, notification_emails_json, google_sheet_config_json,
          success_action, success_payload_json, is_form_active
        ) VALUES (
          ${f.landing_form_id}, ${f.landing_site_id}, ${f.form_code}, ${f.form_name},
          ${sql.json(f.fields_schema_json || [])}, ${sql.json(f.notification_emails_json || [])},
          ${sql.json(f.google_sheet_config_json || {})}, ${f.success_action || 'message'},
          ${sql.json(f.success_payload_json || {})}, ${f.is_form_active ?? true}
        )
        ON CONFLICT (landing_form_id) DO UPDATE SET
          form_name = EXCLUDED.form_name,
          fields_schema_json = EXCLUDED.fields_schema_json,
          google_sheet_config_json = EXCLUDED.google_sheet_config_json,
          success_action = EXCLUDED.success_action,
          success_payload_json = EXCLUDED.success_payload_json,
          is_form_active = EXCLUDED.is_form_active,
          updated_at_utc = NOW()
      `;
    }

    // 6. Seed media assets (including binary bytea decoded from base64 or read from apps/landing-hub/public/sites)
    const siteIdToCode = Object.fromEntries((rawData.sites || []).map((s) => [s.landing_site_id, s.landing_site_code]));
    const publicDir = path.resolve(__dirname, '../apps/landing-hub/public');
    for (const m of rawData.media || []) {
      let byteaBuf = m.file_content_base64 ? Buffer.from(m.file_content_base64, 'base64') : null;
      if (!byteaBuf && m.file_path) {
        const sc = siteIdToCode[m.landing_site_id] || '';
        const rel = String(m.file_path).replace(/^\/+/, '');
        const p1 = sc ? path.join(publicDir, 'sites', sc, rel) : path.join(publicDir, rel);
        const p2 = path.join(publicDir, rel);
        if (fs.existsSync(p1) && fs.statSync(p1).isFile()) {
          byteaBuf = fs.readFileSync(p1);
        } else if (fs.existsSync(p2) && fs.statSync(p2).isFile()) {
          byteaBuf = fs.readFileSync(p2);
        }
      }
      await sql`
        INSERT INTO cic_landing.landing_media_assets (
          landing_media_asset_id, landing_site_id, media_slot_code,
          file_name, file_path, mime_type, file_size_bytes,
          width_px, height_px, alt_text_vi, alt_text_en,
          storage_provider, file_content_bytea
        ) VALUES (
          ${m.landing_media_asset_id}, ${m.landing_site_id || null}, ${m.media_slot_code || null},
          ${m.file_name}, ${m.file_path}, ${m.mime_type}, ${Number(m.file_size_bytes || (byteaBuf ? byteaBuf.length : 0))},
          ${m.width_px || null}, ${m.height_px || null}, ${m.alt_text_vi || null}, ${m.alt_text_en || null},
          ${m.storage_provider || 'supabase_pg_bytea'}, ${byteaBuf}
        )
        ON CONFLICT (landing_media_asset_id) DO UPDATE SET
          file_name = EXCLUDED.file_name,
          file_path = EXCLUDED.file_path,
          mime_type = EXCLUDED.mime_type,
          file_size_bytes = EXCLUDED.file_size_bytes,
          file_content_bytea = COALESCE(EXCLUDED.file_content_bytea, cic_landing.landing_media_assets.file_content_bytea),
          updated_at_utc = NOW()
      `;
    }

    // 7. Seed historical leads (never overwrite existing records on Host)
    for (const l of rawData.leads || []) {
      await sql`
        INSERT INTO cic_landing.landing_lead_submissions (
          landing_lead_submission_id, landing_form_id, landing_site_id, landing_page_id,
          customer_full_name, customer_phone, customer_email, customer_company,
          submitted_fields_json, utm_source, utm_medium, utm_campaign, submitted_at_utc
        ) VALUES (
          ${l.landing_lead_submission_id}, ${l.landing_form_id}, ${l.landing_site_id}, ${l.landing_page_id || null},
          ${l.customer_full_name || null}, ${l.customer_phone || null}, ${l.customer_email || null}, ${l.customer_company || null},
          ${sql.json(l.submitted_fields_json || {})}, ${l.utm_source || null}, ${l.utm_medium || null},
          ${l.utm_campaign || null}, ${l.submitted_at_utc}
        )
        ON CONFLICT (landing_lead_submission_id) DO NOTHING
      `;
    }

    // 8. Seed baseline page views (keep GREATEST so live server counts on Host are never reduced)
    for (const v of rawData.pageViews || []) {
      await sql`
        INSERT INTO cic_landing.landing_page_views (
          landing_site_id, view_date, views_count, unique_visitors_count
        ) VALUES (
          ${v.landing_site_id}, ${v.view_date}, ${v.views_count || 0}, ${v.unique_visitors_count || 0}
        )
        ON CONFLICT (landing_site_id, view_date) DO UPDATE SET
          views_count = GREATEST(cic_landing.landing_page_views.views_count, EXCLUDED.views_count),
          unique_visitors_count = GREATEST(cic_landing.landing_page_views.unique_visitors_count, EXCLUDED.unique_visitors_count),
          updated_at_utc = NOW()
      `;
    }

    // 9. Seed admin accounts (per-site auth + super admin)
    for (const acc of rawData.adminAccounts || []) {
      await sql`
        INSERT INTO cic_landing.landing_admin_accounts (
          username, password_hash, display_name, role, landing_site_code, is_active
        ) VALUES (
          ${acc.username}, ${acc.password_hash}, ${acc.display_name},
          ${acc.role || 'site_admin'}, ${acc.landing_site_code || null}, ${acc.is_active ?? true}
        )
        ON CONFLICT (username) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          display_name = EXCLUDED.display_name,
          role = EXCLUDED.role,
          landing_site_code = EXCLUDED.landing_site_code,
          is_active = EXCLUDED.is_active,
          updated_at_utc = NOW()
      `;
    }

    // 10. Auto-pull latest leads from configured Google Sheets on first run if Service Account credentials exist
    try {
      const credDir = process.env.GOOGLE_CREDENTIALS_DIR
        ? path.resolve(process.env.GOOGLE_CREDENTIALS_DIR)
        : path.resolve(__dirname, '../credentials');
      const credFiles =
        fs.existsSync(credDir) && fs.statSync(credDir).isDirectory()
          ? fs.readdirSync(credDir).filter((f) => f.endsWith('.json'))
          : [];

      if (credFiles.length > 0 || (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)) {
        const { JWT } = await import('google-auth-library');
        const { sheets: googleSheets } = await import('googleapis/build/src/apis/sheets/index.js');

        const creds = [];
        for (const cf of credFiles) {
          try {
            const p = JSON.parse(fs.readFileSync(path.join(credDir, cf), 'utf8'));
            if (p.client_email && p.private_key) {
              creds.push({
                email: p.client_email,
                key: String(p.private_key).replace(/\\n/g, '\n'),
              });
            }
          } catch {}
        }
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
          creds.push({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim(),
            key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
          });
        }

        const parseDate = (raw) => {
          const s = String(raw || '').trim();
          const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
          if (m) {
            return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0));
          }
          const d = new Date(s);
          return Number.isNaN(d.getTime()) ? new Date() : d;
        };

        let syncedCount = 0;
        for (const f of rawData.forms || []) {
          const cfg = f.google_sheet_config_json || {};
          const spreadsheetId = cfg.spreadsheet_id;
          if (!spreadsheetId || spreadsheetId.startsWith('16E6Z')) continue;

          const siteCode = siteIdToCode[f.landing_site_id] || '';
          const tabs = new Set([cfg.sheet_name || 'LADIPAGE']);
          if (cfg.sheet_name_conditional_map) {
            for (const t of Object.values(cfg.sheet_name_conditional_map)) {
              if (typeof t === 'string' && t.trim()) tabs.add(t.trim());
            }
          }

          for (const tabName of tabs) {
            for (const cred of creds) {
              try {
                const auth = new JWT({
                  email: cred.email,
                  key: cred.key,
                  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
                });
                const api = googleSheets({ version: 'v4', auth });
                const range = `'${String(tabName).replace(/'/g, "''")}'!A1:ZZ`;
                const res = await api.spreadsheets.values.get({
                  spreadsheetId,
                  range,
                  valueRenderOption: 'FORMATTED_VALUE',
                });
                const rows = res.data.values || [];
                let headerOffset = 0;
                if ((rows[0] || []).filter(Boolean).length <= 1 && (rows[1] || []).filter(Boolean).length >= 3) {
                  headerOffset = 1;
                }
                for (const rawRow of rows.slice(headerOffset + 1)) {
                  const r = rawRow.map((c) => String(c ?? '').trim());
                  const fullName = r[1] || '';
                  const phone = (r[2] || '').replace(/^'/, '');
                  const email = r[3] || '';
                  const company = r[4] || '';
                  if (!fullName && !phone && !email) continue;

                  const isCad = siteCode === 'cms-intellicad';
                  const isLisp = String(tabName).toUpperCase().includes('LISP');
                  const payload = isCad
                    ? isLisp
                      ? { primary_need: r[5] || 'receive_lisp', requirements: r[6] || '', source_label: r[7] || 'Trực tiếp', care_status: r[8] || '', pic: r[9] || '', care_note: r[10] || '', sheet_tab: tabName }
                      : { primary_need: r[5] || '', product_version: r[6] || '', device_quantity: r[7] || '', requirements: r[8] || '', source_label: r[9] || 'Trực tiếp', care_status: r[10] || '', pic: r[11] || '', care_note: r[12] || '', sheet_tab: tabName }
                    : { primary_need: r[5] || '', requirements: r[6] || '', care_status: r[7] || '', pic: r[8] || '', care_note: r[9] || '', sheet_tab: tabName };

                  const existing = await sql`
                    SELECT landing_lead_submission_id FROM cic_landing.landing_lead_submissions
                    WHERE landing_site_id = ${f.landing_site_id}
                      AND COALESCE(customer_phone, '') = ${phone}
                      AND COALESCE(customer_email, '') = ${email}
                      AND COALESCE(customer_full_name, '') = ${fullName}
                    LIMIT 1
                  `;
                  if (existing.length === 0) {
                    await sql`
                      INSERT INTO cic_landing.landing_lead_submissions (
                        landing_form_id, landing_site_id, customer_full_name, customer_phone,
                        customer_email, customer_company, submitted_fields_json, utm_source, submitted_at_utc
                      ) VALUES (
                        ${f.landing_form_id}, ${f.landing_site_id}, ${fullName || null}, ${phone || null},
                        ${email || null}, ${company || null}, ${sql.json(payload)},
                        ${payload.source_label || 'Google Sheets Sync'}, ${parseDate(r[0])}
                      )
                    `;
                  }
                  syncedCount++;
                }
                break;
              } catch {}
            }
          }
        }
        if (syncedCount > 0) {
          console.log(`[Auto-Seed] Đã đồng bộ trực tiếp ${syncedCount} dòng khách hàng từ Google Sheets.`);
        }
      }
    } catch {}

    console.log(
      `[Auto-Seed] Hoàn tất nạp Database: ${(rawData.sites || []).length} website, ${(rawData.sections || []).length} mục nội dung, ${(rawData.media || []).length} tệp media, ${(rawData.leads || []).length} khách hàng từ Google Sheets.`
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
