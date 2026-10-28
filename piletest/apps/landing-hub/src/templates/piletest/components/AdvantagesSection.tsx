import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION7\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-overlay\"></div><div class=\"ladi-container\"><div id=\"HEADLINE8\" class='ladi-element'><h1 class='ladi-headline ladi-transition'></h1></div><div id=\"PARAGRAPH287\" class='ladi-element'><div class='ladi-paragraph ladi-transition'><span style=\"font-weight: bold;\">Piletest’s Pile Echo Tester (PET) </span>là một giải pháp cơ động cao, thân thiện với người sử dụng trong việc kiểm tra một số lượng lớn các hệ móng sâu một cách nhanh chóng và chính xác.\n<br>\n<br>Không đòi hỏi phải mất nhiều thời gian đào tạo, PET là một hệ mô đun độc lập, dễ dàng kết nối với máy tính, điện thoại thông qua kết nối USB hoặc bluetooth. Để kiểm tra 1 cọc, người sử dụng dùng búa nhẹ trong gói dụng cụ, gõ vào cọc. Tín hiệu kết quả (còn gọi là biểu đồ phản ứng) được ghi lại và phân tích bằng gia tốc kế số của PET, từ đó cung cấp các thông tin về chiều dài và hình dạng của cọc.<br></div></div><div id=\"HEADLINE289\" class='ladi-element'><h3 class='ladi-headline ladi-transition'>PET - Pile Echo Tester</h3></div><div id=\"IMAGE319\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"LINE321\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div></div></div>";

export function AdvantagesSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="advantages" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
