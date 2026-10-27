import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"Caitien\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div  id=\"HEADLINE297\" class='ladi-element'><h3 class='ladi-headline'>Các cải tiến mới</h3></div><div id=\"LINE298\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div  id=\"PARAGRAPH301\" class='ladi-element'><p class='ladi-paragraph ladi-transition'><span style=\"font-weight: 700;\">Hệ thống cảnh báo rung lắc: </span>Máy dò&nbsp;phải được giữ vuông góc với mặt đất để có độ chính xác cao nhất. RD8200 và RD7200 có hệ thống đo lường tích hợp con quay hồi chuyển, cảnh báo người dùng về việc rung lắc quá mức.\n<br>\n<br><span style=\"font-weight: bold;\">Hệ thống âm thanh hiệu suất cao cho phép hoạt động trong môi trường nhiều tiếng ồn:&nbsp;</span>Bộ định vị mới có vỏ loa chống thấm nước, được định vị để phản hồi tối đa cho người vận hành và được điều chỉnh để có được sự cộng hưởng tối ưu cho các tần số âm đã chọn. Với 5 mức công suất đầu ra hỗ trợ kỹ thuật viên làm việc trong các môi trường nhiều tiếng ồn.<br></p></div><div  id=\"IMAGE441\" class='ladi-element'><div class='ladi-image'><div class=\"ladi-image-background\"></div></div></div></div></div>";

export function CatalogSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="catalog" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
