import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION948\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"VIDEO949\" class='ladi-element'><div class='ladi-video'><div class=\"ladi-video-background\"></div><div id=\"SHAPE949\" class='ladi-element'><div class='ladi-shape ladi-transition'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" viewBox=\"0 0 408.7 408.7\" fill=\"rgba(0, 0, 0, 0.5)\"><use xlink:href=\"#shape_rLFFIMmWMe\"></use></svg></div></div></div></div><div id=\"PARAGRAPH951\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Mô hình thép dễ dàng<br>Thống kê tự động, nhanh chóng và chuẩn xác<br>Hỗ trợ tự động nối thép, rải thép theo chuẩn Việt Nam<br></div></div><div id=\"HEADLINE952\" class='ladi-element'><h3 class='ladi-headline ladi-transition'><span style=\"font-weight: 700;\">Mô hình thép và thống kê thép hiệu quả nhất</span><br></h3></div></div></div>";

export function CatalogSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="catalog" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
