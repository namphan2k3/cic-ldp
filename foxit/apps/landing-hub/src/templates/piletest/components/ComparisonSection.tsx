import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION116\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-overlay\"></div><div class=\"ladi-container\"><div id=\"IMAGE303\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"HEADLINE304\" class='ladi-element'><h3 class='ladi-headline ladi-transition'>PSI - Parallel Seismic Instrument</h3></div><div id=\"LINE305\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div id=\"PARAGRAPH306\" class='ladi-element'><div class='ladi-paragraph ladi-transition'><span style=\"font-weight: bold;\">PSI - Parallel Seismic Instrument</span> sử dụng phương pháp địa chấn song song (Parallel Seismic) để xác định chiều sâu của các móng công trình hiện hữu (đặc biệt là cọc) khi mà các kết cấu bên trên không cho phép chạm tới đầu cọc.</div></div></div></div>";

export function ComparisonSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="comparison" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
