'use client';

import React from 'react';
import { HeaderForm } from './forms/HeaderForm';
import { HeroForm } from './forms/HeroForm';
import { IntroForm } from './forms/IntroForm';
import { CatalogForm } from './forms/CatalogForm';
import { VideoSliderForm } from './forms/VideoSliderForm';
import { FaqForm } from './forms/FaqForm';
import { FooterForm } from './forms/FooterForm';
import { GenericFallbackForm } from './forms/GenericFallbackForm';

interface GuidedSectionFormProps {
  sectionCode: string;
  payload: Record<string, any>;
  onChange: (updatedPayload: Record<string, any>) => void;
  onOpenMediaDrawer: (slotKey: string) => void;
}

export function GuidedSectionForm({
  sectionCode,
  payload,
  onChange,
  onOpenMediaDrawer,
}: GuidedSectionFormProps) {
  switch (sectionCode) {
    case 'header':
      return <HeaderForm payload={payload} onChange={onChange} onOpenMediaDrawer={onOpenMediaDrawer} />;
    case 'hero':
      return <HeroForm payload={payload} onChange={onChange} onOpenMediaDrawer={onOpenMediaDrawer} />;
    case 'intro':
      return <IntroForm payload={payload} onChange={onChange} />;
    case 'catalog':
      return <CatalogForm payload={payload} onChange={onChange} onOpenMediaDrawer={onOpenMediaDrawer} />;
    case 'video_slider':
      return <VideoSliderForm payload={payload} onChange={onChange} />;
    case 'faq':
      return <FaqForm payload={payload} onChange={onChange} />;
    case 'footer':
      return <FooterForm payload={payload} onChange={onChange} onOpenMediaDrawer={onOpenMediaDrawer} />;
    default:
      return <GenericFallbackForm payload={payload} onChange={onChange} onOpenMediaDrawer={onOpenMediaDrawer} />;
  }
}
