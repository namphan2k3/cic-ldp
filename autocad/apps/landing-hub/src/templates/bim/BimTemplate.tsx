import React from 'react';
import type { ModularTemplateProps } from '../shared/types';
import { hydrateStyleCss } from '../shared/sectionHtmlHydrator';
import { SiteRuntimeInit } from '../shared/SiteRuntimeInit';
import {
  STYLESHEET_HREFS_VI,
  STYLESHEET_HREFS_EN,
  STYLESHEET_HREFS_ZH,
  INLINE_CSS_VI,
  INLINE_CSS_EN,
  INLINE_CSS_ZH,
  EVENT_DATA_VI,
  EVENT_DATA_EN,
  EVENT_DATA_ZH,
  SVG_SYMBOLS_VI,
  SVG_SYMBOLS_EN,
  SVG_SYMBOLS_ZH,
  LADI_CDN_URL_VI,
  LADI_CDN_URL_EN,
  LADI_CDN_URL_ZH,
  LADI_JS_URL_VI,
  LADI_JS_URL_EN,
  LADI_JS_URL_ZH,
} from './styles';
import { HeaderHeroSection } from './components/HeaderHeroSection';
import { IntroSection } from './components/IntroSection';
import { AdvantagesSection } from './components/AdvantagesSection';
import { CatalogSection } from './components/CatalogSection';
import { ComparisonRequirementsSection } from './components/ComparisonRequirementsSection';
import { ResourcesFaqSection } from './components/ResourcesFaqSection';
import { ConsultationSection } from './components/ConsultationSection';
import { FooterSection } from './components/FooterSection';
import { PopupSection } from './components/PopupSection';

export function BimTemplate({
  site,
  sections,
  locale,
  formConfig,
  isPreview = false,
}: ModularTemplateProps) {
  const enabledMap = new Map<string, boolean>();
  const payloadMap = new Map<string, Record<string, any>>();
  const allPayloads: Record<string, any>[] = [];

  for (const s of sections) {
    enabledMap.set(s.landing_section_type_code, s.is_section_enabled);
    const p = (s.published_payload_json as Record<string, any>) || {};
    payloadMap.set(s.landing_section_type_code, p);
    if (s.is_section_enabled) {
      allPayloads.push(p);
    }
  }

  const isEnabled = (code: string) => enabledMap.get(code) !== false;
  const getPayload = (code: string) => payloadMap.get(code) || {};

  const stylesheetHrefs =
    locale === 'zh'
      ? STYLESHEET_HREFS_ZH
      : locale === 'en'
      ? STYLESHEET_HREFS_EN
      : STYLESHEET_HREFS_VI;
  const rawInlineCss =
    locale === 'zh'
      ? INLINE_CSS_ZH
      : locale === 'en'
      ? INLINE_CSS_EN
      : INLINE_CSS_VI;
  const hydratedInlineCss = hydrateStyleCss(rawInlineCss, allPayloads);
  const eventDataJson =
    locale === 'zh'
      ? EVENT_DATA_ZH
      : locale === 'en'
      ? EVENT_DATA_EN
      : EVENT_DATA_VI;
  const svgSymbols =
    locale === 'zh'
      ? SVG_SYMBOLS_ZH
      : locale === 'en'
      ? SVG_SYMBOLS_EN
      : SVG_SYMBOLS_VI;
  const ladiCdnUrl =
    locale === 'zh'
      ? LADI_CDN_URL_ZH
      : locale === 'en'
      ? LADI_CDN_URL_EN
      : LADI_CDN_URL_VI;
  const ladiJsUrl =
    locale === 'zh'
      ? LADI_JS_URL_ZH
      : locale === 'en'
      ? LADI_JS_URL_EN
      : LADI_JS_URL_VI;
  const hotline = (site.brand_config_json?.hotline as string) || '0866 059 659';

  const runtimeSections = sections.map((s) => ({
    section_code: s.landing_section_type_code,
    is_enabled: s.is_section_enabled,
    payload: (s.published_payload_json as Record<string, any>) || {},
  }));

  return (
    <main className="cic-modular-ladi-root">
      {stylesheetHrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style dangerouslySetInnerHTML={{ __html: hydratedInlineCss }} />
      {svgSymbols && (
        <div
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{ __html: svgSymbols }}
        />
      )}

      <div className="ladi-wraper">
        {isEnabled('hero') && (
          <HeaderHeroSection
            payload={getPayload('hero')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('intro') && (
          <IntroSection
            payload={getPayload('intro')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('advantages') && (
          <AdvantagesSection
            payload={getPayload('advantages')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('catalog') && (
          <CatalogSection
            payload={getPayload('catalog')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('comparison') && (
          <ComparisonRequirementsSection
            payload={getPayload('comparison')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('faq') && (
          <ResourcesFaqSection
            payload={getPayload('faq')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('consultation_form') && (
          <ConsultationSection
            payload={getPayload('consultation_form')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('footer') && (
          <FooterSection
            payload={getPayload('footer')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
        {isEnabled('consultation_form') && (
          <PopupSection
            payload={getPayload('consultation_form')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
      </div>

      <div id="backdrop-popup" className="backdrop-popup" />
      <div id="backdrop-dropbox" className="backdrop-dropbox" />
      <div id="lightbox-screen" className="lightbox-screen" />

      <SiteRuntimeInit
        siteCode="bim"
        siteName={site.landing_site_name}
        locale={locale}
        isPreview={isPreview}
        hotline={hotline}
        sections={runtimeSections}
        formConfig={formConfig}
        isLadiPage={true}
        ladiEventDataJson={eventDataJson}
        ladiCdnUrl={ladiCdnUrl}
        bitrixLoaderUrl={(site.brand_config_json?.bitrix_loader_url as string) || "https://crm.cic.com.vn/upload/crm/site_button/loader_9_cqbl2r.js"}
        vendorScripts={[ladiJsUrl]}
      />
    </main>
  );
}
