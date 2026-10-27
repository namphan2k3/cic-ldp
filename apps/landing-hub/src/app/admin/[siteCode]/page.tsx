import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  getAllLandingSites,
  getLandingSiteByCode,
  getLandingPageWithSections,
  getLandingFormsBySite,
  getDb,
} from '@cic/db';
import { getAdminSession } from '@/lib/adminAuth';
import { SiteCmsHeader } from '../components/cms/SiteCmsHeader';
import { SiteCmsEditorLayout } from '../components/cms/SiteCmsEditorLayout';
import { SiteMediaManagerTab } from '../components/cms/SiteMediaManagerTab';
import { CmsUserGuideView } from '../components/cms/CmsUserGuideView';
import { FormBuilderTab } from '../components/FormBuilderTab';
import { RevisionsTab } from '../components/RevisionsTab';
import { AdminSessionBoundary } from '../components/AdminSessionBoundary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trình Quản trị Nội dung Landing Page CIC',
  robots: {
    index: false,
    follow: false,
  },
};

interface SiteCmsPageProps {
  params: Promise<{ siteCode: string }>;
  searchParams: Promise<{
    lang?: string;
    tab?: string;
  }>;
}

export default async function SiteSpecificCmsPage({
  params,
  searchParams,
}: SiteCmsPageProps) {
  const { siteCode } = await params;
  const sp = await searchParams;

  const session = await getAdminSession(siteCode);
  if (!session) {
    redirect(`/admin/login?next=/admin/${siteCode}`);
  }

  const envSiteCode = process.env.DEFAULT_SITE_CODE?.trim() || null;
  const lockedSiteCode =
    envSiteCode || (session.role === 'site_admin' ? session.allowedSiteCode : null);

  if (lockedSiteCode && lockedSiteCode !== siteCode) {
    redirect(`/admin/${lockedSiteCode}`);
  }

  const [rawSites, site] = await Promise.all([
    getAllLandingSites(),
    getLandingSiteByCode(siteCode),
  ]);
  const sites = lockedSiteCode
    ? rawSites.filter((s) => s.landing_site_code === lockedSiteCode)
    : rawSites;

  if (!site) {
    notFound();
  }

  const rawLang = (sp.lang || 'vi').toLowerCase();
  const normalizedLang = rawLang === 'cn' || rawLang === 'chn' ? 'zh' : rawLang;
  const locale =
    (normalizedLang === 'en' || normalizedLang === 'zh') &&
    site.supported_locales_json.includes(normalizedLang)
      ? normalizedLang
      : 'vi';
  const activeTab = sp.tab || 'edit';

  const [initialPageData, forms] = await Promise.all([
    getLandingPageWithSections(site.landing_site_id, 'home', locale),
    getLandingFormsBySite(site.landing_site_id),
  ]);
  const pageData =
    initialPageData ??
    (locale !== 'vi'
      ? await getLandingPageWithSections(site.landing_site_id, 'home', 'vi')
      : null);

  const sql = getDb();
  const revisions = pageData?.page
    ? await sql<
        {
          landing_content_revision_id: string;
          revision_number: number;
          revision_summary: string | null;
          created_by: string;
          created_at_utc: Date;
          revision_snapshot_json: any;
        }[]
      >`
        SELECT *
        FROM cic_landing.landing_content_revisions
        WHERE landing_page_id = ${pageData.page.landing_page_id}
        ORDER BY revision_number DESC
      `
    : [];

  const headerSection = pageData?.sections.find(
    (s) => s.landing_section_type_code === 'header'
  );
  const headerPayload =
    (headerSection?.draft_payload_json as Record<string, any>) ||
    (headerSection?.published_payload_json as Record<string, any>) ||
    {};

  const logoUrl =
    headerPayload.logo_url ||
    `/api/landing/media/${site.landing_site_code}/images/logo_cic.png`;

  const langQuery = locale !== 'vi' ? `?lang=${locale}` : '';
  const publicUrl = site.primary_domain
    ? `https://${site.primary_domain}${langQuery}`
    : `http://localhost:3000/s/${site.landing_site_code}${langQuery}`;

  const mappedSections = (pageData?.sections || []).map((s) => ({
    id: s.landing_page_section_id,
    section_code: s.landing_section_type_code,
    section_type: s.landing_section_type_code,
    sort_order: s.section_order,
    is_enabled: s.is_section_enabled,
    published_payload_json: (s.published_payload_json || {}) as Record<string, any>,
    draft_payload_json: (s.draft_payload_json || null) as Record<string, any> | null,
  }));

  const seoJson = (pageData?.page.page_seo_json || {}) as Record<string, any>;
  const initialSeoTitle =
    String(seoJson.title || pageData?.page.page_title || site.landing_site_name);
  const initialSeoDesc = String(
    seoJson.description || site.seo_meta_json?.description || ''
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminSessionBoundary clearOnMount={false} />
      <SiteCmsHeader
        siteCode={site.landing_site_code}
        siteName={site.landing_site_name}
        logoUrl={logoUrl}
        locale={locale}
        activeTab={activeTab}
        allSites={sites.map((s) => ({
          code: s.landing_site_code,
          name: s.landing_site_name,
        }))}
      />

      <main className="mx-auto max-w-[1900px] px-4 py-4 sm:px-6">
        {activeTab === 'edit' && pageData && (
          <SiteCmsEditorLayout
            siteCode={site.landing_site_code}
            publicUrl={publicUrl}
            locale={locale}
            supportedLocales={site.supported_locales_json}
            pageId={pageData.page.landing_page_id}
            initialSeoTitle={initialSeoTitle}
            initialSeoDesc={initialSeoDesc}
            sections={mappedSections}
            isStandalone={sites.length <= 1}
          />
        )}

        {activeTab === 'media' && (
          <SiteMediaManagerTab
            siteCode={site.landing_site_code}
            siteName={site.landing_site_name}
          />
        )}

        {activeTab === 'forms' && (
          <FormBuilderTab forms={forms} siteId={site.landing_site_id} />
        )}

        {activeTab === 'revisions' && pageData && (
          <RevisionsTab
            pageId={pageData.page.landing_page_id}
            revisions={revisions}
          />
        )}

        {activeTab === 'guide' && (
          <CmsUserGuideView siteCode={site.landing_site_code} locale={locale} />
        )}
      </main>
    </div>
  );
}
