import React from 'react';
import type { CmsIntellicadTemplateProps } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LicenseCards } from './components/LicenseCards';
import { AdvantagesSection } from './components/AdvantagesSection';
import { ComparisonSection } from './components/ComparisonSection';
import { RequirementsSection } from './components/RequirementsSection';
import { ResourcesSection } from './components/ResourcesSection';
import { FaqSection } from './components/FaqSection';
import { ConsultationFormSection } from './components/ConsultationFormSection';
import { Footer } from './components/Footer';
import { FloatingCta } from './components/FloatingCta';

export function CmsIntellicadTemplate({
  site,
  sections,
  locale,
  formConfig,
}: CmsIntellicadTemplateProps) {
  // Map sections by type code
  const secMap = new Map<string, Record<string, unknown>>();
  for (const s of sections) {
    if (s.is_section_enabled) {
      secMap.set(s.landing_section_type_code, s.published_payload_json || {});
    }
  }

  const headerPayload = secMap.get('header') || {};
  const heroPayload = secMap.get('hero') || {};
  const advantagesPayload = secMap.get('advantages') || {};
  const comparisonPayload = secMap.get('comparison') || {};
  const requirementsPayload = secMap.get('requirements') || {};
  const resourcesPayload = secMap.get('resources') || {};
  const faqPayload = secMap.get('faq') || {};
  const formPayload = secMap.get('consultation_form') || {};
  const footerPayload = secMap.get('footer') || {};
  const floatingPayload = secMap.get('floating_cta') || {};

  const hotline = site.brand_config_json?.hotline || '0866 059 659';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Header Navigation */}
      <Header payload={headerPayload} locale={locale} hotline={hotline} />

      {/* 2. Hero Section */}
      <HeroSection payload={heroPayload} locale={locale} />

      {/* 3. Licensing / Versions */}
      <LicenseCards payload={heroPayload} locale={locale} />

      {/* 4. Advantages / Key Features */}
      <AdvantagesSection payload={advantagesPayload} locale={locale} />

      {/* 5. AutoCAD vs IntelliCAD Comparison */}
      <ComparisonSection payload={comparisonPayload} locale={locale} />

      {/* 6. Hardware & System Requirements */}
      <RequirementsSection payload={requirementsPayload} locale={locale} />

      {/* 7. Resources & Downloads Callout */}
      <ResourcesSection payload={resourcesPayload} locale={locale} />

      {/* 8. Interactive Searchable FAQ */}
      <FaqSection payload={faqPayload} locale={locale} />

      {/* 9. Lead Consultation Form & Trial Dialog */}
      <ConsultationFormSection payload={formPayload} locale={locale} formConfig={formConfig} />

      {/* 10. Corporate Footer */}
      <Footer payload={footerPayload} locale={locale} />

      {/* 11. Floating Sticky Bottom Bar */}
      <FloatingCta payload={floatingPayload} locale={locale} hotline={hotline} />
    </div>
  );
}
