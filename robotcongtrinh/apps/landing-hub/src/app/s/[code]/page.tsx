import crypto from 'node:crypto';
import nextDynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getLandingSiteByCode,
  getLandingPageWithSections,
  getLandingFormsBySite,
  recordLandingPageView,
} from '@cic/db';
import { CmsPreviewBridge } from './CmsPreviewBridge';
import { TemplateErrorBoundary } from '@/components/TemplateErrorBoundary';
import { TrackingScripts } from '@/components/TrackingScripts';

// Dynamic Code-Splitting Registry: each landing page template is loaded in an isolated chunk
const CmsIntellicadTemplate = nextDynamic(() =>
  import('@/templates/cms-intellicad/CmsIntellicadTemplate').then((m) => m.CmsIntellicadTemplate)
);
const RobotCongTrinhTemplate = nextDynamic(() =>
  import('@/templates/robot-cong-trinh/RobotCongTrinhTemplate').then((m) => m.RobotCongTrinhTemplate)
);
const AllplanTemplate = nextDynamic(() =>
  import('@/templates/allplan/AllplanTemplate').then((m) => m.AllplanTemplate)
);
const BimTemplate = nextDynamic(() =>
  import('@/templates/bim/BimTemplate').then((m) => m.BimTemplate)
);
const EnjicadTemplate = nextDynamic(() =>
  import('@/templates/enjicad/EnjicadTemplate').then((m) => m.EnjicadTemplate)
);
const EsconTemplate = nextDynamic(() =>
  import('@/templates/escon/EsconTemplate').then((m) => m.EsconTemplate)
);
const RevitTemplate = nextDynamic(() =>
  import('@/templates/revit/RevitTemplate').then((m) => m.RevitTemplate)
);
const AutocadTemplate = nextDynamic(() =>
  import('@/templates/autocad/AutocadTemplate').then((m) => m.AutocadTemplate)
);
const CubicostTemplate = nextDynamic(() =>
  import('@/templates/cubicost/CubicostTemplate').then((m) => m.CubicostTemplate)
);
const EnjicadproTemplate = nextDynamic(() =>
  import('@/templates/enjicadpro/EnjicadproTemplate').then((m) => m.EnjicadproTemplate)
);
const PiletestTemplate = nextDynamic(() =>
  import('@/templates/piletest/PiletestTemplate').then((m) => m.PiletestTemplate)
);
const FoxitTemplate = nextDynamic(() =>
  import('@/templates/foxit/FoxitTemplate').then((m) => m.FoxitTemplate)
);
const MaydocapngamTemplate = nextDynamic(() =>
  import('@/templates/maydocapngam/MaydocapngamTemplate').then((m) => m.MaydocapngamTemplate)
);
const CabinetvisionTemplate = nextDynamic(() =>
  import('@/templates/cabinetvision/CabinetvisionTemplate').then((m) => m.CabinetvisionTemplate)
);

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ lang?: string; preview?: string }>;
}

function resolveSiteAndLocale(rawCode: string, langParam?: string): {
  siteCode: string;
  locale: 'vi' | 'en' | 'zh';
} {
  const cleanLang = (langParam || '').toLowerCase();
  if (rawCode.endsWith('-zh') || rawCode.endsWith('-cn') || cleanLang === 'zh' || cleanLang === 'cn' || cleanLang === 'chn') {
    return {
      siteCode: rawCode.replace(/-(?:zh|cn)$/, ''),
      locale: 'zh',
    };
  }
  if (rawCode.endsWith('-en') || cleanLang === 'en') {
    return {
      siteCode: rawCode.replace(/-en$/, ''),
      locale: 'en',
    };
  }
  return { siteCode: rawCode, locale: 'vi' };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { code: rawCode } = await params;
  const { lang } = await searchParams;
  const { siteCode, locale } = resolveSiteAndLocale(rawCode, lang);

  const site = await getLandingSiteByCode(siteCode);
  if (!site) return { title: 'CIC Landing Platform' };

  const data =
    (await getLandingPageWithSections(site.landing_site_id, 'home', locale)) ??
    (locale !== 'vi'
      ? await getLandingPageWithSections(site.landing_site_id, 'home', 'vi')
      : null);
  const pageSeo = (data?.page.page_seo_json as Record<string, string>) || {};
  const siteSeo = (site.seo_meta_json as Record<string, string>) || {};
  const brand = (site.brand_config_json as Record<string, string>) || {};

  const title = pageSeo.title || data?.page.page_title || siteSeo.title || site.landing_site_name;
  const description = pageSeo.description || siteSeo.description || site.landing_site_name;
  const keywords = pageSeo.keywords || siteSeo.keywords || undefined;
  const faviconUrl =
    brand.favicon_url || `/api/landing/media/${site.landing_site_code}/images/favicon.ico`;
  const logoUrl =
    brand.logo_url || `/api/landing/media/${site.landing_site_code}/images/logo.png`;
  const ogImage = pageSeo.og_image || siteSeo.og_image || logoUrl;
  const domainBase = `https://${site.primary_domain || `${site.landing_site_code}.cic.com.vn`}`;
  const canonicalUrl = locale === 'en' ? `${domainBase}?lang=en` : domainBase;

  return {
    title,
    description,
    keywords,
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: logoUrl,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'vi-VN': domainBase,
        'en-US': `${domainBase}?lang=en`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: site.landing_site_name,
      locale: locale === 'en' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LandingSitePage({ params, searchParams }: PageProps) {
  const { code: rawCode } = await params;
  const { lang, preview } = await searchParams;
  const { siteCode, locale } = resolveSiteAndLocale(rawCode, lang);

  const site = await getLandingSiteByCode(siteCode);

  if (site) {
    const isPreview = preview === '1';

    if (site.site_status === 'maintenance' && !isPreview) {
      const hotline = (site.brand_config_json?.hotline as string) || '0866 059 659';
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-center text-white">
          <div className="max-w-md">
            <h1 className="mb-3 text-2xl font-bold">{site.landing_site_name} đang bảo trì</h1>
            <p className="text-slate-400">
              Hệ thống đang được nâng cấp nội dung. Quý khách vui lòng liên hệ Hotline:{' '}
              <strong className="text-amber-400">{hotline}</strong>
            </p>
          </div>
        </div>
      );
    }

    if (!isPreview) {
      const reqHeaders = await headers();
      const forwardedFor =
        reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        reqHeaders.get('x-real-ip') ||
        'direct';
      const userAgent = reqHeaders.get('user-agent') || 'unknown';
      const visitorHash = crypto
        .createHash('sha256')
        .update(`${site.landing_site_id}|${forwardedFor}|${userAgent}`)
        .digest('hex')
        .slice(0, 32);
      await recordLandingPageView(site.landing_site_id, visitorHash);
    }

    const [initialPageData, siteForms] = await Promise.all([
      getLandingPageWithSections(site.landing_site_id, 'home', locale),
      getLandingFormsBySite(site.landing_site_id),
    ]);
    const pageData =
      initialPageData ??
      (locale !== 'vi'
        ? await getLandingPageWithSections(site.landing_site_id, 'home', 'vi')
        : null);
    const primaryFormConfig = siteForms[0] || undefined;

    if (pageData && pageData.sections.length > 0) {
      const effectiveSections = pageData.sections.map((s) => ({
        ...s,
        published_payload_json:
          isPreview && s.draft_payload_json
            ? s.draft_payload_json
            : s.published_payload_json,
      }));

      let content = null;
      const isReactNativeTemplate =
        site.landing_site_code === 'cms-intellicad' ||
        site.landing_site_code === 'robot-cong-trinh';

      const modularProps = {
        site,
        sections: effectiveSections,
        locale: locale as 'vi' | 'en' | 'zh',
        formConfig: primaryFormConfig,
        isPreview,
      };
      const biLocale: 'vi' | 'en' = locale === 'en' ? 'en' : 'vi';

      switch (site.landing_site_code) {
        case 'cms-intellicad':
          content = (
            <CmsIntellicadTemplate
              site={site}
              sections={effectiveSections}
              locale={biLocale}
              formConfig={primaryFormConfig}
            />
          );
          break;
        case 'robot-cong-trinh':
          content = (
            <RobotCongTrinhTemplate
              site={site}
              sections={effectiveSections}
              locale={biLocale}
              formConfig={primaryFormConfig}
            />
          );
          break;
        case 'allplan':
          content = <AllplanTemplate {...modularProps} />;
          break;
        case 'bim':
          content = <BimTemplate {...modularProps} />;
          break;
        case 'enjicad':
          content = <EnjicadTemplate {...modularProps} />;
          break;
        case 'escon':
          content = <EsconTemplate {...modularProps} />;
          break;
        case 'revit':
          content = <RevitTemplate {...modularProps} />;
          break;
        case 'autocad':
          content = <AutocadTemplate {...modularProps} />;
          break;
        case 'cubicost':
          content = <CubicostTemplate {...modularProps} />;
          break;
        case 'enjicadpro':
          content = <EnjicadproTemplate {...modularProps} />;
          break;
        case 'piletest':
          content = <PiletestTemplate {...modularProps} />;
          break;
        case 'foxit':
          content = <FoxitTemplate {...modularProps} />;
          break;
        case 'maydocapngam':
          content = <MaydocapngamTemplate {...modularProps} />;
          break;
        case 'cabinetvision':
          content = <CabinetvisionTemplate {...modularProps} />;
          break;
      }

      if (content) {
        const brand = (site.brand_config_json as Record<string, any>) || {};
        const hotline = (brand.hotline as string) || '0866 059 659';
        const tracking = site.tracking_config_json || {};
        const siteSeo = (site.seo_meta_json as Record<string, string>) || {};
        const domainUrl = `https://${site.primary_domain || `${site.landing_site_code}.cic.com.vn`}`;

        const faqSection = effectiveSections.find(
          (s) => s.landing_section_type_code === 'faq' && s.is_section_enabled
        );
        const faqItems = Array.isArray((faqSection?.published_payload_json as any)?.items)
          ? ((faqSection?.published_payload_json as any).items as Array<{
              q?: string;
              a?: string;
              question?: string;
              answer?: string;
            }>)
          : [];

        const graphNodes: Record<string, unknown>[] = [
          {
            '@type': 'Organization',
            name: 'Công ty Cổ phần Công nghệ và Tư vấn CIC',
            url: domainUrl,
            telephone: hotline,
            email: brand.email || 'info@cic.com.vn',
            address: {
              '@type': 'PostalAddress',
              streetAddress:
                brand.address || 'Tòa nhà CIC, 37 Lê Văn Thiêm, Thanh Xuân, Hà Nội',
              addressLocality: 'Hà Nội',
              addressCountry: 'VN',
            },
          },
          {
            '@type': 'WebSite',
            name: site.landing_site_name,
            url: domainUrl,
            inLanguage: locale === 'en' ? 'en-US' : 'vi-VN',
            description: siteSeo.description || site.landing_site_name,
          },
        ];

        if (faqItems.length > 0) {
          graphNodes.push({
            '@type': 'FAQPage',
            mainEntity: faqItems
              .filter((item) => (item.q || item.question) && (item.a || item.answer))
              .map((item) => ({
                '@type': 'Question',
                name: item.q || item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.a || item.answer,
                },
              })),
          });
        }

        const jsonLd = {
          '@context': 'https://schema.org',
          '@graph': graphNodes,
        };

        return (
          <TemplateErrorBoundary siteName={site.landing_site_name} hotline={hotline}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {!isPreview && (
              <TrackingScripts
                ga4Id={tracking.ga4_id}
                gtmId={tracking.gtm_id}
                fbPixelId={tracking.fb_pixel_id}
              />
            )}
            {isReactNativeTemplate ? (
              <div data-cms-preview={isPreview ? '1' : undefined} className="relative">
                {content}
                <CmsPreviewBridge
                  isPreview={isPreview}
                  sections={effectiveSections.map((s) => ({
                    section_code: s.landing_section_type_code,
                    is_enabled: s.is_section_enabled,
                    payload: (s.published_payload_json as Record<string, any>) || {},
                  }))}
                />
              </div>
            ) : (
              content
            )}
          </TemplateErrorBoundary>
        );
      }
    }
  }

  return notFound();
}
