import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION69\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"HEADLINE297\" class='ladi-element'><h3 class='ladi-headline ladi-transition'>BIT - Borehole Inclination Tester</h3></div><div id=\"LINE298\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div id=\"PARAGRAPH301\" class='ladi-element'><div class='ladi-paragraph ladi-transition'><span style=\"font-weight: 700;\">BIT - Borehole Inclination Tester </span>không giống như các hệ thống truyền thống, BIT sử dụng luôn bản thân mũi khoan của máy khoan làm trục thẳng đứng, cho phép loại trừ những hệ thống cồng kênh, khó di chuyển, nhằm xác định độ nghiêng của cọc trong cả lỗ khoan khô và ướt.\r<br>\r<br>Đối với những lỗ khoan lớn, chỉ cần thực hiện xác định độ nghiêng vài lần trong quá trình đào nhằm có thể điều chỉnh kịp thời. Độ nghiêng của cọc đã hoàn thành có thể được đo thông qua ống siêu âm chôn sẵn. Đặc biệt, BIT đo độ nghiên của cọc theo 2 phương chỉ với 1 lần đo.<br></div></div><div id=\"IMAGE302\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div data-action=\"true\" id=\"IMAGE394\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div></div></div>";

export function CatalogSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="catalog" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
