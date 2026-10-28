import React from 'react';
import type { RobotCongTrinhTemplateProps } from './types';
import './robot.css';

import { Header } from './components/Header';
import { HeroKenBurns } from './components/HeroKenBurns';
import { IntroStory } from './components/IntroStory';
import { RobotCatalog } from './components/RobotCatalog';
import { VideoSlider } from './components/VideoSlider';
import { InfrastructureRobots } from './components/InfrastructureRobots';
import { ConsultSection } from './components/ConsultSection';
import { FaqAccordion } from './components/FaqAccordion';
import { Footer } from './components/Footer';

export function RobotCongTrinhTemplate({
  site,
  sections,
  locale,
  formConfig,
}: RobotCongTrinhTemplateProps) {
  const secMap = new Map<string, Record<string, unknown>>();
  for (const s of sections) {
    if (s.is_section_enabled) {
      secMap.set(s.landing_section_type_code, s.published_payload_json || {});
    }
  }

  const headerPayload = secMap.get('header') || {};
  const heroPayload = secMap.get('hero') || {};
  const introPayload = secMap.get('intro') || {};
  const catalogPayload = secMap.get('catalog') || {};
  const videoSliderPayload = secMap.get('video_slider') as
    | { items?: any[] }
    | undefined;
  const infrastructurePayload = secMap.get('infrastructure') || {};
  const formPayload = secMap.get('consultation_form') || {};
  const faqPayload = secMap.get('faq') || {};
  const footerPayload = secMap.get('footer') || {};

  return (
    <div className="robot-landing min-h-screen">
      {/* 1. Header Navigation */}
      <Header payload={headerPayload} />

      {/* 2. Hero with Subtle Ken Burns */}
      <HeroKenBurns payload={heroPayload} />

      {/* 3. Introduction Story */}
      <IntroStory payload={introPayload} />

      {/* 4, 5, 6: Combined Catalog Section containing Catalog, Video Slider, and Infrastructure */}
      <section className="section catalog" id="robot">
        <div className="wrap">
          <RobotCatalog payload={catalogPayload} />
          <VideoSlider
            slides={videoSliderPayload?.items}
            payload={videoSliderPayload}
            catalogPayload={catalogPayload}
          />
          <InfrastructureRobots payload={infrastructurePayload} />
        </div>
      </section>

      {/* 7. Consultation Form */}
      <ConsultSection payload={formPayload} formConfig={formConfig} />

      {/* 8. FAQ Accordion */}
      <FaqAccordion payload={faqPayload} />

      {/* 9. Corporate Footer */}
      <Footer payload={footerPayload} />
    </div>
  );
}
