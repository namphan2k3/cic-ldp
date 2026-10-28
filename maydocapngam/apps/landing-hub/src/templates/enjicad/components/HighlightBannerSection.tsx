import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML_VI = "<div id=\"SECTION1221\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><a href=\"https://www.cic.com.vn/tai-sao-tim-kiem-giai-phap-thay-the-auticad-n976.html\" target=\"_blank\" id=\"HEADLINE1254\" class='ladi-element'><h3 class='ladi-headline ladi-transition'    ><span style=\"color: rgb(0, 0, 0);\">Xem thêm:</span> Tại sao bạn nên chọn phần mềm enjiCAD thay cho giải pháp CAD khác</h3> </a><div id=\"LINE1218\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div></div></div>";
const SECTION_HTML_EN = "";
const SECTION_HTML_ZH = "";

export function HighlightBannerSection({ payload, allPayloads, locale = 'vi' }: ModularSectionProps) {
  const baseHtml =
    locale === 'zh'
      ? SECTION_HTML_ZH
      : locale === 'en'
      ? SECTION_HTML_EN
      : SECTION_HTML_VI;
  const html = hydrateSectionHtml(baseHtml, payload, allPayloads);
  return <article data-anchor="advantages" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
