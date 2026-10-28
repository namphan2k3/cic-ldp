import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<section id=\"home\" class=\"home-wrapper parallax image-bg\">\r\n\t\t<div class=\"home-contain\">\r\n\t\t  <img src=\"/sites/autocad/img/bg-autocad2016.png\" class=\"img-banner\" alt=\"Đặt mua AutoCAD\" />\r\n\t\t</div>\r\n\t</section>\r\n\t<!--End home-->\t\r\n\t<!--Start counter down-->\r\n\t";

export function HeroHomeSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="hero" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
