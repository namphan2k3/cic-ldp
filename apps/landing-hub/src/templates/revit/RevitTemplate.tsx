import React from 'react';
import type { ModularTemplateProps } from '../shared/types';
import { hydrateStyleCss } from '../shared/sectionHtmlHydrator';
import { SiteRuntimeInit } from '../shared/SiteRuntimeInit';
import { STYLESHEET_HREFS, INLINE_CSS } from './styles';
import { HeaderNavSection } from './components/HeaderNavSection';
import { HeroTopSection } from './components/HeroTopSection';
import { AboutIntroSection } from './components/AboutIntroSection';
import { ReasonAdvantagesSection } from './components/ReasonAdvantagesSection';
import { FeaturesCatalogSection } from './components/FeaturesCatalogSection';
import { BenefitRequirementsSection } from './components/BenefitRequirementsSection';
import { VideoResourcesSection } from './components/VideoResourcesSection';
import { PricingComparisonSection } from './components/PricingComparisonSection';
import { ClientFaqSection } from './components/ClientFaqSection';
import { ContactFormSection } from './components/ContactFormSection';
import { FooterSection } from './components/FooterSection';

export function RevitTemplate({
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
  const hydratedInlineCss = hydrateStyleCss(INLINE_CSS, allPayloads);
  const hotline = (site.brand_config_json?.hotline as string) || '0866 059 659';

  const runtimeSections = sections.map((s) => ({
    section_code: s.landing_section_type_code,
    is_enabled: s.is_section_enabled,
    payload: (s.published_payload_json as Record<string, any>) || {},
  }));

  return (
    <main className="cic-modular-revit-root">
      {STYLESHEET_HREFS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {hydratedInlineCss && <style dangerouslySetInnerHTML={{ __html: hydratedInlineCss }} />}

      {isEnabled('header') && (
        <HeaderNavSection
          payload={getPayload('header')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}

      <div className="main clearfix" id="top">
        {isEnabled('hero') && (
          <HeroTopSection
            payload={getPayload('hero')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}

        <div className="content" id="about_content">
          {isEnabled('intro') && (
            <AboutIntroSection
              payload={getPayload('intro')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
          {isEnabled('advantages') && (
            <ReasonAdvantagesSection
              payload={getPayload('advantages')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
          {isEnabled('catalog') && (
            <FeaturesCatalogSection
              payload={getPayload('catalog')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
          {isEnabled('requirements') && (
            <BenefitRequirementsSection
              payload={getPayload('requirements')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
          {isEnabled('resources') && (
            <VideoResourcesSection
              payload={getPayload('resources')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
          {isEnabled('comparison') && (
            <PricingComparisonSection
              payload={getPayload('comparison')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
          {isEnabled('faq') && (
            <ClientFaqSection
              payload={getPayload('faq')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
          {isEnabled('consultation_form') && (
            <ContactFormSection
              payload={getPayload('consultation_form')}
              allPayloads={allPayloads}
              locale={locale}
            />
          )}
        </div>

        {isEnabled('footer') && (
          <FooterSection
            payload={getPayload('footer')}
            allPayloads={allPayloads}
            locale={locale}
          />
        )}
      </div>

      <SiteRuntimeInit
        siteCode="revit"
        siteName={site.landing_site_name}
        locale={locale}
        isPreview={isPreview}
        hotline={hotline}
        sections={runtimeSections}
        formConfig={formConfig}
        bitrixLoaderUrl={(site.brand_config_json?.bitrix_loader_url as string) || undefined}
        vendorScripts={[
          "/sites/revit/js/vendor/modernizr-2.7.1.min.js",
          "/sites/revit/js/vendor/jquery-1.11.2.min.js",
          "/sites/revit/js/vendor/wow.min.js",
          "/sites/revit/js/vendor/owl.carousel.min.js",
          "/sites/revit/js/vendor/swiper/js/swiper.js",
          "/sites/revit/js/vegas/vegas.min.js",
          "/sites/revit/js/jquery.maximage.js",
          "/sites/revit/js/main.js",
          "/sites/revit/js/form_script.js"
]}
      />
    </main>
  );
}
