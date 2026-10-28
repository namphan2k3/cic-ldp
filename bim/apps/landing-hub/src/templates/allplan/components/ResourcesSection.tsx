import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION963\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"PARAGRAPH966\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Để tối ưu hóa sự tương tác giữa Allplan và Allplan Bimplus, bây giờ bạn có thể khởi động BIM Explorer trực tiếp từ Allplan mà không cần bất kỳ bước trung gian nào. Điều này giúp bạn có thể xem mô hình của chính mình cùng với các mô hình từ các ngành khác (ví dụ: MEP) và đặt chúng trong bối cảnh tổng thể. Ngoài ra, hiện đã hỗ trợ tải xuống phần gia cố từ Allplan Bimplus để thêm chi tiết trong Allplan.<br></div></div><div id=\"IMAGE973\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"HEADLINE967\" class='ladi-element'><h3 class='ladi-headline ladi-transition'><span style=\"font-weight: 700;\">Tương tác giữa Allplan và Allplan Bimplus</span><br></h3></div></div></div>";

export function ResourcesSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="resources" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
