import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION116\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-overlay\"></div><div class=\"ladi-container\"><div  id=\"PARAGRAPH443\" class='ladi-element'><p class='ladi-paragraph ladi-transition'><span style=\"font-weight: 700;\">Hệ thống phản hồi rung để giảm nguy cơ lỡ cảnh báo:</span> Tay cầm máy dò có gắn cảm biến rung khi có cảnh báo, khiến người điều khiển giảm nguy cơ bị lỡ cảnh báo, tập trung vào công việc.<br><br><span style=\"font-weight: 700;\">Hệ thống ghi nhật ký tự động: </span>GPS được tích hợp trên RD8200G và tự động ghi nhật ký định vị cho phép người dùng quản lý công việc tốt hơn.<br></p></div><div  id=\"IMAGE444\" class='ladi-element'><div class='ladi-image'><div class=\"ladi-image-background\"></div></div></div></div></div>";

export function ComparisonSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="comparison" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
