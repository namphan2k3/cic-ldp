import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION976\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"PARAGRAPH977\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>•\tThao tác quen thuộc, không mất thời gian tìm hiểu và học phần mềm<br>•\tThực hiện trên từng khối một cách nhanh chóng<br>•\tTrình bày theo tiêu chuẩn Việt Nam<br></div></div><div id=\"HEADLINE978\" class='ladi-element'><h3 class='ladi-headline ladi-transition'><span style=\"font-weight: 700;\">TỰ ĐỘNG TẠO, RẢI THÉP, THỐNG KÊ CHO DẦM</span><br></h3></div><div id=\"VIDEO993\" class='ladi-element'><div class='ladi-video'><div class=\"ladi-video-background\"></div><div id=\"SHAPE993\" class='ladi-element'><div class='ladi-shape ladi-transition'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" viewBox=\"0 0 408.7 408.7\" fill=\"rgba(0, 0, 0, 0.5)\"><use xlink:href=\"#shape_rLFFIMmWMe\"></use></svg></div></div></div></div></div></div>";

export function ComparisonSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="comparison" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
