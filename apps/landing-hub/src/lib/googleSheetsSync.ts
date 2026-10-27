import { getDb } from '@cic/db';
import {
  appendGoogleSheetRowValues,
  readFullSheetRows,
  loadAllServiceAccountCredentials,
} from '@cic/sheets';

const ROBOT_NEED_LABELS: Record<string, string> = {
  concrete_finishing: 'Hoàn thiện sàn bê tông',
  wall_finishing: 'Phun bả và xả nhám',
  floor_tiling: 'Lát gạch nền',
  site_measurement: 'Đo lường hiện trường',
  underwater_inspection: 'Kiểm tra dưới nước',
  sewer_cleaning: 'Vệ sinh cống ngầm',
  needs_assessment: 'Cần CIC tư vấn lựa chọn',
};

function parseSheetDate(raw: string): Date {
  const s = String(raw || '').trim();
  if (!s) return new Date();
  // Match DD/MM/YYYY HH:mm:ss or DD/MM/YYYY
  const vnMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (vnMatch) {
    const [, d, m, y, hh = '0', mm = '0', ss = '0'] = vnMatch;
    return new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      Number(ss)
    );
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatVnDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function getConfiguredServiceAccounts() {
  return loadAllServiceAccountCredentials().map((c) => ({
    email: c.clientEmail,
    projectId: c.projectId,
    sourceFile: c.sourceFile,
  }));
}

export async function pushLeadToGoogleSheet(params: {
  siteCode: string;
  spreadsheetId: string;
  sheetName: string;
  conditionalMap?: Record<string, string>;
  fields: Record<string, any>;
}): Promise<{ syncedSheet: string; updatedRange?: string | null }> {
  const { siteCode, spreadsheetId, sheetName, conditionalMap, fields } = params;
  const fullName = fields.full_name || fields.name || '';
  const phone = fields.phone || '';
  const email = fields.work_email || fields.email || '';
  const company = fields.company || '';
  const primaryNeed = fields.primary_need || fields.solution || '';
  const requirements = fields.requirements || fields.message || fields.note || '';
  const source = fields.utm_source || 'Trực tiếp';

  let targetTab = sheetName || 'LADIPAGE';
  const isLisp = primaryNeed === 'receive_lisp' || fields.receive_lisp === true;
  if (isLisp && conditionalMap?.primary_need) {
    targetTab = conditionalMap.primary_need;
  }

  let rowValues: unknown[];
  if (siteCode === 'cms-intellicad') {
    const isoNow = new Date().toISOString();
    rowValues = isLisp
      ? [isoNow, fullName, phone, email, company, primaryNeed, requirements, source]
      : [
          isoNow,
          fullName,
          phone,
          email,
          company,
          primaryNeed,
          fields.product_version || '',
          fields.device_quantity || '',
          requirements,
          source,
        ];
  } else {
    const vnNow = formatVnDateTime(new Date());
    const needLabel = ROBOT_NEED_LABELS[primaryNeed] || primaryNeed;
    rowValues = [vnNow, fullName, phone, email, company, needLabel, requirements];
  }

  const res = await appendGoogleSheetRowValues(spreadsheetId, targetTab, rowValues);
  return { syncedSheet: targetTab, updatedRange: res.updatedRange };
}

export async function pullLeadsFromGoogleSheets(targetSiteCode?: string): Promise<{
  totalRead: number;
  inserted: number;
  updated: number;
  details: Array<{ siteCode: string; sheetTab: string; read: number; inserted: number; updated: number }>;
}> {
  const sql = getDb();
  const forms = await sql<
    {
      landing_form_id: string;
      landing_site_id: string;
      landing_site_code: string;
      google_sheet_config_json: Record<string, any>;
    }[]
  >`
    SELECT f.landing_form_id, f.landing_site_id, s.landing_site_code, f.google_sheet_config_json
    FROM cic_landing.landing_forms f
    JOIN cic_landing.landing_sites s ON s.landing_site_id = f.landing_site_id
    WHERE f.is_form_active = true
      ${targetSiteCode ? sql`AND s.landing_site_code = ${targetSiteCode}` : sql``}
  `;

  let totalRead = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  const details: Array<{
    siteCode: string;
    sheetTab: string;
    read: number;
    inserted: number;
    updated: number;
  }> = [];

  for (const form of forms) {
    const cfg = form.google_sheet_config_json || {};
    const spreadsheetId = cfg.spreadsheet_id;
    if (!spreadsheetId || spreadsheetId.startsWith('16E6Z')) continue;

    const tabsToSync = new Set<string>([cfg.sheet_name || 'LADIPAGE']);
    if (cfg.sheet_name_conditional_map) {
      for (const t of Object.values(cfg.sheet_name_conditional_map)) {
        if (typeof t === 'string' && t.trim()) tabsToSync.add(t.trim());
      }
    }

    for (const tabName of tabsToSync) {
      try {
        const raw = await readFullSheetRows(spreadsheetId, tabName, 1);
        let tabInserted = 0;
        let tabUpdated = 0;
        let validRowsRead = 0;

        for (let idx = 0; idx < raw.formattedRows.length; idx++) {
          const r = raw.formattedRows[idx].map((c) => String(c ?? '').trim());
          const rawTime = r[0] || '';
          const fullName = r[1] || '';
          const phone = (r[2] || '').replace(/^'/, '');
          const email = r[3] || '';
          const company = r[4] || '';

          if (!fullName && !phone && !email) continue;
          validRowsRead++;

          const isCad = form.landing_site_code === 'cms-intellicad';
          const isLispTab = tabName.toUpperCase().includes('LISP');

          const payload: Record<string, any> = isCad
            ? isLispTab
              ? {
                  primary_need: r[5] || 'receive_lisp',
                  requirements: r[6] || '',
                  source_label: r[7] || 'Trực tiếp',
                  care_status: r[8] || '',
                  pic: r[9] || '',
                  care_note: r[10] || '',
                  sheet_tab: tabName,
                }
              : {
                  primary_need: r[5] || '',
                  product_version: r[6] || '',
                  device_quantity: r[7] || '',
                  requirements: r[8] || '',
                  source_label: r[9] || 'Trực tiếp',
                  care_status: r[10] || '',
                  pic: r[11] || '',
                  care_note: r[12] || '',
                  sheet_tab: tabName,
                }
            : {
                primary_need: r[5] || '',
                requirements: r[6] || '',
                care_status: r[7] || '',
                pic: r[8] || '',
                care_note: r[9] || '',
                sheet_tab: tabName,
              };

          const utmSource = payload.source_label || 'Google Sheets Sync';
          const submittedAt = parseSheetDate(rawTime);

          const existing = await sql<{ landing_lead_submission_id: string }[]>`
            SELECT landing_lead_submission_id
            FROM cic_landing.landing_lead_submissions
            WHERE landing_site_id = ${form.landing_site_id}
              AND COALESCE(customer_phone, '') = ${phone}
              AND COALESCE(customer_email, '') = ${email}
              AND COALESCE(customer_full_name, '') = ${fullName}
            LIMIT 1
          `;

          if (existing.length > 0) {
            await sql`
              UPDATE cic_landing.landing_lead_submissions
              SET submitted_fields_json = ${sql.json(payload as never)},
                  customer_company = COALESCE(NULLIF(${company}, ''), customer_company)
              WHERE landing_lead_submission_id = ${existing[0].landing_lead_submission_id}
            `;
            tabUpdated++;
          } else {
            await sql`
              INSERT INTO cic_landing.landing_lead_submissions (
                landing_form_id,
                landing_site_id,
                customer_full_name,
                customer_phone,
                customer_email,
                customer_company,
                submitted_fields_json,
                utm_source,
                submitted_at_utc
              ) VALUES (
                ${form.landing_form_id},
                ${form.landing_site_id},
                ${fullName || null},
                ${phone || null},
                ${email || null},
                ${company || null},
                ${sql.json(payload as never)},
                ${utmSource},
                ${submittedAt}
              )
            `;
            tabInserted++;
          }
        }

        totalRead += validRowsRead;
        totalInserted += tabInserted;
        totalUpdated += tabUpdated;
        details.push({
          siteCode: form.landing_site_code,
          sheetTab: tabName,
          read: validRowsRead,
          inserted: tabInserted,
          updated: tabUpdated,
        });
      } catch (err) {
        console.warn(`[pullLeadsFromGoogleSheets] Tab ${tabName} warning:`, err);
      }
    }

    // Record initial migration sync timestamp and initialize baseline historical activity dates
    // for dates where historical leads occurred (never overwriting higher server counter values)
    const updatedCfg = {
      ...cfg,
      initial_sync_completed: true,
      initial_sync_completed_at: cfg.initial_sync_completed_at || new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
    };
    await sql`
      UPDATE cic_landing.landing_forms
      SET google_sheet_config_json = ${sql.json(updatedCfg as never)},
          updated_at_utc = NOW()
      WHERE landing_form_id = ${form.landing_form_id}
    `;

    await sql`
      INSERT INTO cic_landing.landing_page_views (
        landing_site_id,
        view_date,
        views_count,
        unique_visitors_count
      )
      SELECT
        landing_site_id,
        (submitted_at_utc AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS view_date,
        COUNT(*)::int AS views_count,
        COUNT(DISTINCT COALESCE(NULLIF(customer_phone, ''), NULLIF(customer_email, ''), customer_full_name))::int AS unique_visitors_count
      FROM cic_landing.landing_lead_submissions
      WHERE landing_site_id = ${form.landing_site_id}
      GROUP BY landing_site_id, (submitted_at_utc AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
      ON CONFLICT (landing_site_id, view_date) DO UPDATE
      SET views_count = GREATEST(cic_landing.landing_page_views.views_count, EXCLUDED.views_count),
          unique_visitors_count = GREATEST(cic_landing.landing_page_views.unique_visitors_count, EXCLUDED.unique_visitors_count),
          updated_at_utc = NOW()
    `;
  }

  return { totalRead, inserted: totalInserted, updated: totalUpdated, details };
}
