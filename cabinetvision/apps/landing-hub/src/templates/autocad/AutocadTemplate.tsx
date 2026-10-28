import React from 'react';
import type { ModularTemplateProps } from '../shared/types';
import { hydrateStyleCss } from '../shared/sectionHtmlHydrator';
import { SiteRuntimeInit } from '../shared/SiteRuntimeInit';
import { STYLESHEET_HREFS, INLINE_CSS } from './styles';
import { HeaderNavSection } from './components/HeaderNavSection';
import { HeroHomeSection } from './components/HeroHomeSection';
import { CounterIntroSection } from './components/CounterIntroSection';
import { FeaturesAdvantagesSection } from './components/FeaturesAdvantagesSection';
import { WhyReasonCatalogSection } from './components/WhyReasonCatalogSection';
import { ScreenshotSection } from './components/ScreenshotSection';
import { PricingComparisonSection } from './components/PricingComparisonSection';
import { DownloadResourcesSection } from './components/DownloadResourcesSection';
import { ClientFaqSection } from './components/ClientFaqSection';
import { ContactFormSection } from './components/ContactFormSection';
import { FooterSection } from './components/FooterSection';

export function AutocadTemplate({
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
    <main className="cic-modular-autocad-root">
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
      {isEnabled('hero') && (
        <HeroHomeSection
          payload={getPayload('hero')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}
      {isEnabled('intro') && (
        <CounterIntroSection
          payload={getPayload('intro')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}
      {isEnabled('advantages') && (
        <FeaturesAdvantagesSection
          payload={getPayload('advantages')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}
      {isEnabled('catalog') && (
        <WhyReasonCatalogSection
          payload={getPayload('catalog')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}
      {isEnabled('requirements') && (
        <ScreenshotSection
          payload={getPayload('requirements')}
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
      {isEnabled('resources') && (
        <DownloadResourcesSection
          payload={getPayload('resources')}
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
      {isEnabled('footer') && (
        <FooterSection
          payload={getPayload('footer')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}

      <SiteRuntimeInit
        siteCode="autocad"
        siteName={site.landing_site_name}
        locale={locale}
        isPreview={isPreview}
        hotline={hotline}
        sections={runtimeSections}
        formConfig={formConfig}
        bitrixLoaderUrl={(site.brand_config_json?.bitrix_loader_url as string) || undefined}
        vendorScripts={[
          "/sites/autocad/js/jquery.js",
          "/sites/autocad/js/counters/jquery.countdown.js",
          "/sites/autocad/js/bootstrap.min.js",
          "/sites/autocad/js/jquery-easing-1.3.js",
          "/sites/autocad/js/navigation/waypoints.min.js",
          "/sites/autocad/js/navigation/jquery.smooth-scroll.js",
          "/sites/autocad/js/navigation/navbar.js",
          "/sites/autocad/js/wow/wow.min.js",
          "/sites/autocad/js/wow/setting.js",
          "/sites/autocad/js/parallax/jquery.parallax-1.1.3.js",
          "/sites/autocad/js/parallax/setting.js",
          "/sites/autocad/js/flexslider/jquery.flexslider.js",
          "/sites/autocad/js/flexslider/setting.js",
          "/sites/autocad/js/prettyPhoto/jquery.prettyPhoto.js",
          "/sites/autocad/js/prettyPhoto/setting.js",
          "/sites/autocad/js/counters/jquery.appear.js",
          "/sites/autocad/js/counters/stellar.js",
          "/sites/autocad/js/counters/setting.js",
          "/sites/autocad/js/owlcarousel/owl.carousel.js",
          "/sites/autocad/js/owlcarousel/setting.js",
          "/sites/autocad/js/totop/jquery.ui.totop.js",
          "/sites/autocad/js/totop/setting.js",
          "/sites/autocad/js/custom.js"
]}
        inlineInitScripts={[
          "if (window.jQuery && jQuery.fn.countdown) {\n          jQuery('[id=\"getting-started\"]').each(function() {\n            jQuery(this).countdown(\"2015/10/31 23:59:00\", function(event) {\n              jQuery(this).html(event.strftime(\n                '<li><div class=\"accordion-toggle\"><h5>Tháng 10 năm 2015 AutoCAD LT ngừng bán bản quyền vĩnh viễn chỉ còn:</h5></div></li> ' +\n                '<li><div class=\"counter-box\"><div class=\"number\"><span class=\"days\">%D</span> <div class=\"duration\">Ngày</div></div></div></li> ' +\n                '<li><div class=\"counter-box\"><div class=\"number\"><span class=\"hours\">%H</span> <div class=\"duration\">Giờ</div></div></div></li> ' +\n                '<li><div class=\"counter-box\"><div class=\"number\"><span class=\"minutes\">%M</span> <div class=\"duration\">Phút</div></div></div></li> ' +\n                '<li><div class=\"counter-box\"><div class=\"number\"><span class=\"seconds\">%S</span> <div class=\"duration\">Giây</div></div></div></li> '\n              ));\n            });\n          });\n        }"
]}
      />
    </main>
  );
}
