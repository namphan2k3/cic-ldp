import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAllLandingSites, getDb } from '@cic/db';
import { getAdminSession } from '@/lib/adminAuth';
import { MasterHeader } from './components/master/MasterHeader';
import {
  TrafficAnalyticsTab,
  type DailyTrafficPoint,
} from './components/master/TrafficAnalyticsTab';
import { SitesDirectoryTab, SiteSummaryItem } from './components/master/SitesDirectoryTab';
import { UnifiedLeadsTab, UnifiedLeadItem } from './components/master/UnifiedLeadsTab';
import { SystemUtilitiesTab, GlobalRevisionItem } from './components/master/SystemUtilitiesTab';
import { FormBuilderTab } from './components/FormBuilderTab';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hệ thống Quản trị Landing Page CIC',
  robots: {
    index: false,
    follow: false,
  },
};

const NEED_LABEL_MAP: Record<string, string> = {
  quote_consultation: 'Đăng ký nhận báo giá & tư vấn bản quyền',
  free_trial_30_days: 'Đăng ký dùng thử miễn phí 30 ngày',
  trial_30_days: 'Đăng ký dùng thử miễn phí 30 ngày',
  receive_lisp: 'Đăng ký nhận bộ LISP miễn phí',
  concrete_finishing: 'Robot hoàn thiện sàn bê tông',
  wall_finishing: 'Robot phun bả và xả nhám',
  floor_tiling: 'Robot lát gạch nền',
  site_measurement: 'Robot đo lường hiện trường',
  underwater_inspection: 'Robot kiểm tra dưới nước',
  sewer_cleaning: 'Robot vệ sinh cống ngầm',
  needs_assessment: 'Cần CIC tư vấn lựa chọn robot',
};

interface MasterAdminPageProps {
  searchParams: Promise<{
    tab?: string;
    site?: string;
  }>;
}

export default async function MasterAdminHubPage({ searchParams }: MasterAdminPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login?next=/admin');
  }

  const sp = await searchParams;
  const activeTab = sp.tab || 'dashboard';
  const envSiteCode = process.env.DEFAULT_SITE_CODE?.trim() || null;
  const lockedSiteCode =
    envSiteCode || (session.role === 'site_admin' ? session.allowedSiteCode : null);
  const selectedSite = lockedSiteCode || sp.site || 'ALL';

  const rawSites = await getAllLandingSites();
  const sites = lockedSiteCode
    ? rawSites.filter((s) => s.landing_site_code === lockedSiteCode)
    : rawSites;
  const sql = getDb();

  const [siteMetrics, dailyViewsRaw, allLeadsRaw, allFormsRaw, allRevisionsRaw] = await Promise.all(
    [
      sql<
        {
          landing_site_id: string;
          leads_count: number;
          media_count: number;
          sections_count: number;
          views_7d: number;
          views_30d: number;
        }[]
      >`
        SELECT
          s.landing_site_id,
          (SELECT COUNT(*)::int FROM cic_landing.landing_lead_submissions l WHERE l.landing_site_id = s.landing_site_id) AS leads_count,
          (SELECT COUNT(*)::int FROM cic_landing.landing_media_assets m WHERE m.landing_site_id = s.landing_site_id) AS media_count,
          (
            SELECT COUNT(*)::int
            FROM cic_landing.landing_page_sections sec
            JOIN cic_landing.landing_pages p ON p.landing_page_id = sec.landing_page_id
            WHERE p.landing_site_id = s.landing_site_id AND p.landing_page_locale = 'vi'
          ) AS sections_count,
          COALESCE((
            SELECT SUM(v.views_count)::int
            FROM cic_landing.landing_page_views v
            WHERE v.landing_site_id = s.landing_site_id AND v.view_date >= CURRENT_DATE - INTERVAL '6 days'
          ), 0) AS views_7d,
          COALESCE((
            SELECT SUM(v.views_count)::int
            FROM cic_landing.landing_page_views v
            WHERE v.landing_site_id = s.landing_site_id AND v.view_date >= CURRENT_DATE - INTERVAL '29 days'
          ), 0) AS views_30d
        FROM cic_landing.landing_sites s
      `,
      sql<
        {
          iso_date: string;
          date_label: string;
          landing_site_code: string;
          views_count: number;
          unique_visitors_count: number;
        }[]
      >`
        SELECT
          TO_CHAR(v.view_date, 'YYYY-MM-DD') AS iso_date,
          TO_CHAR(v.view_date, 'DD/MM') AS date_label,
          s.landing_site_code,
          v.views_count,
          v.unique_visitors_count
        FROM cic_landing.landing_page_views v
        JOIN cic_landing.landing_sites s ON s.landing_site_id = v.landing_site_id
        WHERE v.view_date >= CURRENT_DATE - INTERVAL '29 days'
        ORDER BY v.view_date ASC
      `,
      sql<
        {
          landing_lead_submission_id: string;
          landing_site_code: string;
          landing_site_name: string;
          customer_full_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          customer_company: string | null;
          submitted_fields_json: Record<string, any>;
          utm_source: string | null;
          utm_campaign: string | null;
          submitted_at_utc: Date;
          iso_date: string;
          date_label: string;
        }[]
      >`
        SELECT
          l.landing_lead_submission_id,
          s.landing_site_code,
          s.landing_site_name,
          l.customer_full_name,
          l.customer_phone,
          l.customer_email,
          l.customer_company,
          l.submitted_fields_json,
          l.utm_source,
          l.utm_campaign,
          l.submitted_at_utc,
          TO_CHAR(l.submitted_at_utc AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS iso_date,
          TO_CHAR(l.submitted_at_utc AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM') AS date_label
        FROM cic_landing.landing_lead_submissions l
        JOIN cic_landing.landing_sites s ON s.landing_site_id = l.landing_site_id
        ORDER BY l.submitted_at_utc DESC
        LIMIT 500
      `,
      sql<
        {
          landing_form_id: string;
          form_code: string;
          form_name: string;
          fields_schema_json: any[];
          google_sheet_config_json: Record<string, any>;
          success_action: string;
          success_payload_json: Record<string, any>;
          landing_site_code: string;
          landing_site_name: string;
        }[]
      >`
        SELECT f.*, s.landing_site_code, s.landing_site_name
        FROM cic_landing.landing_forms f
        JOIN cic_landing.landing_sites s ON s.landing_site_id = f.landing_site_id
        ORDER BY s.landing_site_code ASC, f.form_code ASC
      `,
      sql<
        {
          landing_content_revision_id: string;
          landing_site_code: string;
          landing_site_name: string;
          revision_number: number;
          revision_summary: string | null;
          created_by: string;
          created_at_utc: Date;
        }[]
      >`
        SELECT
          r.landing_content_revision_id,
          s.landing_site_code,
          s.landing_site_name,
          r.revision_number,
          r.revision_summary,
          r.created_by,
          r.created_at_utc
        FROM cic_landing.landing_content_revisions r
        JOIN cic_landing.landing_pages p ON p.landing_page_id = r.landing_page_id
        JOIN cic_landing.landing_sites s ON s.landing_site_id = p.landing_site_id
        ORDER BY r.created_at_utc DESC
        LIMIT 50
      `,
    ]
  );

  const siteAccounts = await sql<{ landing_site_code: string; username: string }[]>`
    SELECT landing_site_code, username
    FROM cic_landing.landing_admin_accounts
    WHERE role = 'site_admin' AND landing_site_code IS NOT NULL
  `;
  const accountMap = new Map(siteAccounts.map((a) => [a.landing_site_code, a.username]));

  const metricsMap = new Map(siteMetrics.map((m) => [m.landing_site_id, m]));

  const allSiteSummaryList: SiteSummaryItem[] = sites.map((s) => {
    const m = metricsMap.get(s.landing_site_id);
    return {
      id: s.landing_site_id,
      code: s.landing_site_code,
      name: s.landing_site_name,
      domain: s.primary_domain,
      status: s.site_status,
      locales: s.supported_locales_json,
      leadsCount: m?.leads_count || 0,
      mediaCount: m?.media_count || 0,
      sectionsCount: m?.sections_count || 0,
      views7d: m?.views_7d || 0,
      views30d: m?.views_30d || 0,
      trackingConfig: (s.tracking_config_json || {}) as Record<string, any>,
      brandConfig: (s.brand_config_json || {}) as Record<string, any>,
      seoMeta: (s.seo_meta_json || {}) as Record<string, any>,
      adminUsername: accountMap.get(s.landing_site_code) || `${s.landing_site_code}_admin`,
    };
  });

  // Apply global Header website filter (selectedSite = 'ALL' or a specific site code)
  const scopedSites =
    selectedSite === 'ALL'
      ? allSiteSummaryList
      : allSiteSummaryList.filter((s) => s.code === selectedSite);

  const scopedLeadsRaw =
    selectedSite === 'ALL'
      ? allLeadsRaw
      : allLeadsRaw.filter((l) => l.landing_site_code === selectedSite);

  const scopedViewsRaw =
    selectedSite === 'ALL'
      ? dailyViewsRaw
      : dailyViewsRaw.filter((v) => v.landing_site_code === selectedSite);

  const scopeLabel =
    selectedSite === 'ALL'
      ? `Tất cả website (${allSiteSummaryList.length} trang)`
      : scopedSites[0]?.name || selectedSite;

  // Build 100% real daily series combining Real Leads (from Google Sheets) + Real Server Pageviews
  const dailyMap = new Map<string, DailyTrafficPoint>();
  for (const v of scopedViewsRaw) {
    const cur = dailyMap.get(v.iso_date) || {
      isoDate: v.iso_date,
      date: v.date_label,
      views: 0,
      uniqueVisitors: 0,
      leads: 0,
      sampleCustomers: [],
    };
    cur.views += v.views_count;
    cur.uniqueVisitors += v.unique_visitors_count;
    dailyMap.set(v.iso_date, cur);
  }

  for (const l of [...scopedLeadsRaw].reverse()) {
    const cur = dailyMap.get(l.iso_date) || {
      isoDate: l.iso_date,
      date: l.date_label,
      views: 0,
      uniqueVisitors: 0,
      leads: 0,
      sampleCustomers: [],
    };
    cur.leads += 1;
    if (l.customer_full_name && cur.sampleCustomers && cur.sampleCustomers.length < 4) {
      cur.sampleCustomers.push(l.customer_full_name);
    }
    dailyMap.set(l.iso_date, cur);
  }

  const dailySeries = Array.from(dailyMap.values()).sort((a, b) =>
    a.isoDate.localeCompare(b.isoDate)
  );

  const totalMedia = scopedSites.reduce((acc, s) => acc + s.mediaCount, 0);

  const unifiedLeads: UnifiedLeadItem[] = scopedLeadsRaw.map((l) => ({
    id: l.landing_lead_submission_id,
    siteCode: l.landing_site_code,
    siteName: l.landing_site_name,
    fullName: l.customer_full_name,
    phone: l.customer_phone,
    email: l.customer_email,
    companyName: l.customer_company,
    jobTitle: (l.submitted_fields_json?.role as string) || null,
    leadPayload: l.submitted_fields_json || {},
    utmJson: { utm_source: l.utm_source, utm_campaign: l.utm_campaign },
    leadStatus: 'new',
    googleSheetSyncStatus: 'synced',
    submittedAt: l.submitted_at_utc.toISOString(),
  }));

  const utmCounts = new Map<string, number>();
  const needCounts = new Map<string, { label: string; siteName: string; count: number }>();

  for (const l of scopedLeadsRaw) {
    const src = l.utm_source || 'Truy cập trực tiếp';
    utmCounts.set(src, (utmCounts.get(src) || 0) + 1);

    const rawNeed = String(l.submitted_fields_json?.primary_need || '').trim();
    const label = NEED_LABEL_MAP[rawNeed] || rawNeed || 'Tư vấn chung';
    const key = `${l.landing_site_code}::${label}`;
    const existing = needCounts.get(key) || {
      label,
      siteName: l.landing_site_name,
      count: 0,
    };
    existing.count += 1;
    needCounts.set(key, existing);
  }

  const utmBreakdown =
    utmCounts.size > 0
      ? Array.from(utmCounts.entries()).map(([source, count]) => ({ source, count }))
      : [{ source: 'Truy cập trực tiếp', count: unifiedLeads.length }];

  const needBreakdown = Array.from(needCounts.values()).sort((a, b) => b.count - a.count);

  const scopedRevisionsRaw =
    selectedSite === 'ALL'
      ? allRevisionsRaw
      : allRevisionsRaw.filter((r) => r.landing_site_code === selectedSite);

  const globalRevisions: GlobalRevisionItem[] = scopedRevisionsRaw.map((r) => ({
    id: r.landing_content_revision_id,
    siteCode: r.landing_site_code,
    siteName: r.landing_site_name,
    revisionNumber: r.revision_number,
    summary: r.revision_summary,
    createdBy: r.created_by,
    createdAt: r.created_at_utc.toISOString(),
  }));

  const scopedFormsRaw =
    selectedSite === 'ALL'
      ? allFormsRaw
      : allFormsRaw.filter((f) => f.landing_site_code === selectedSite);

  const formsWithSiteLabel = scopedFormsRaw.map((f) => ({
    ...f,
    form_name: `${f.landing_site_name} — ${f.form_name}`,
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <MasterHeader
        activeTab={activeTab}
        selectedSite={selectedSite}
        sites={allSiteSummaryList.map((s) => ({
          code: s.code,
          name: s.name,
          domain: s.domain,
          status: s.status,
        }))}
        totalLeadsCount={unifiedLeads.length}
        totalFormsCount={formsWithSiteLabel.length}
        totalRevisionsCount={globalRevisions.length}
        currentUser={{
          username: session.username,
          displayName: session.displayName,
          role: session.role,
        }}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {activeTab === 'dashboard' && (
          <TrafficAnalyticsTab
            sites={scopedSites}
            scopeLabel={scopeLabel}
            totalLeads={unifiedLeads.length}
            totalMedia={totalMedia}
            utmBreakdown={utmBreakdown}
            needBreakdown={needBreakdown}
            dailySeries={dailySeries}
          />
        )}

        {activeTab === 'sites' && <SitesDirectoryTab sites={scopedSites} />}

        {activeTab === 'leads' && (
          <UnifiedLeadsTab
            leads={unifiedLeads}
            sites={scopedSites.map((s) => ({
              code: s.code,
              name: s.name,
            }))}
          />
        )}

        {activeTab === 'forms' && <FormBuilderTab forms={formsWithSiteLabel} />}

        {activeTab === 'utilities' && (
          <SystemUtilitiesTab sites={scopedSites} revisions={globalRevisions} />
        )}
      </main>
    </div>
  );
}
