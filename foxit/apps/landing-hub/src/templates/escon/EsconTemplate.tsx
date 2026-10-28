import React from 'react';
import type { ModularTemplateProps } from '../shared/types';
import { hydrateStyleCss } from '../shared/sectionHtmlHydrator';
import { SiteRuntimeInit } from '../shared/SiteRuntimeInit';
import { STYLESHEET_HREFS, INLINE_CSS } from './styles';
import { HeaderSection } from './components/HeaderSection';
import { HeroBannerSection } from './components/HeroBannerSection';
import { IntroSection } from './components/IntroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { MoreFeaturesSection } from './components/MoreFeaturesSection';
import { WhyChooseSection } from './components/WhyChooseSection';
import { PricingComparisonSection } from './components/PricingComparisonSection';
import { DownloadResourcesSection } from './components/DownloadResourcesSection';
import { FaqSection } from './components/FaqSection';
import { ContactFormSection } from './components/ContactFormSection';
import { FooterSection } from './components/FooterSection';

export function EsconTemplate({
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
    <main className="cic-modular-escon-root">
      {STYLESHEET_HREFS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {hydratedInlineCss && <style dangerouslySetInnerHTML={{ __html: hydratedInlineCss }} />}

      {isEnabled('header') && (
        <HeaderSection
          payload={getPayload('header')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}
      {isEnabled('hero') && (
        <HeroBannerSection
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
        <FeaturesSection
          payload={getPayload('advantages')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}
      {isEnabled('catalog') && (
        <MoreFeaturesSection
          payload={getPayload('catalog')}
          allPayloads={allPayloads}
          locale={locale}
        />
      )}
      {isEnabled('requirements') && (
        <WhyChooseSection
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
        <FaqSection
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
        siteCode="escon"
        siteName={site.landing_site_name}
        locale={locale}
        isPreview={isPreview}
        hotline={hotline}
        sections={runtimeSections}
        formConfig={formConfig}
        bitrixLoaderUrl={(site.brand_config_json?.bitrix_loader_url as string) || undefined}
        vendorScripts={[
          "/sites/escon/assets/js/jquery.js",
          "/sites/escon/assets/js/bootstrap.min.js",
          "/sites/escon/assets/js/smoothscroll.js",
          "/sites/escon/assets/js/jquery.scrollTo.min.js",
          "/sites/escon/assets/js/jquery.localScroll.min.js",
          "/sites/escon/assets/js/owl.carousel.js",
          "/sites/escon/assets/js/jquery.flexslider-min.js",
          "/sites/escon/assets/js/jquery.magnific-popup.js",
          "/sites/escon/assets/js/jquery.ajaxchimp.min.js",
          "/sites/escon/assets/js/jquery.nav.js",
          "/sites/escon/assets/js/jquery.placeholder.js",
          "/sites/escon/assets/js/wow.js",
          "/sites/escon/assets/js/script.js",
          "https://maps.googleapis.com/maps/api/js"
]}
        inlineInitScripts={[
          "if (window.jQuery && jQuery.fn.placeholder) { jQuery('input, textarea').placeholder(); }",
          "if (window.google && window.google.maps && document.getElementById('map')) {\n          var styles = [\n            { stylers: [{ hue: \"#0AABE1\" }, { saturation: 0 }] },\n            { featureType: 'water', stylers: [{ visibility: \"on\" }, { color: \"#9a9efd\" }, { weight: 2.2 }, { gamma: 2.54 }] },\n            { featureType: \"road\", elementType: \"geometry\", stylers: [{ lightness: 100 }, { visibility: \"simplified\" }] },\n            { featureType: \"road\", elementType: \"labels\", stylers: [{ visibility: \"off\" }] }\n          ];\n          var styledMap = new google.maps.StyledMapType(styles, { name: \"Styled Map\" });\n          var mapCanvas = document.getElementById('map');\n          var hanoi = new google.maps.LatLng(21.011097, 105.848623);\n          var mapOptions = {\n            zoom: 13,\n            center: hanoi,\n            mapTypeControlOptions: {\n              mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']\n            },\n            scrollwheel: true,\n            disableDefaultUI: false\n          };\n          var map = new google.maps.Map(mapCanvas, mapOptions);\n          map.mapTypes.set('map_style', styledMap);\n          map.setMapTypeId('map_style');\n          new google.maps.Marker({\n            position: hanoi,\n            map: map,\n            title: \"Địa chỉ (CIC): Số 37 Lê Đại Hành - Hai Bà Trưng - Hà Nội\",\n            icon: '/sites/escon/images/marker1.png'\n          });\n        }"
]}
      />
    </main>
  );
}
