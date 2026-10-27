import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION23\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"HEADLINE294\" class='ladi-element'><h3 class='ladi-headline ladi-transition'>CHUM - Cross Hole Ultrasonic Monitor</h3></div><div id=\"LINE295\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div id=\"PARAGRAPH296\" class='ladi-element'><div class='ladi-paragraph ladi-transition'><span style=\"font-weight: bold;\">Cross Hole Ultrasonic Monitor (CHUM)</span>&nbsp;sử dụng phương pháp Crosshole Sonic Logging (CSL) để thực hiện việc kiểm tra chất lượng các hệ thống móng sâu.\n<br>Hệ thống sử dụng sóng siêu âm được gửi đi từ đầu phát tới đầu thu qua môi trường ống có đầy nước được nhúng trong lòng bê tông. Chất lượng bê tông được thể hiện trên phần mềm CHUM.\n<br>Đầu phát và đầu thu có thể lắp lẫn giúp giảm chi phí cho hàng lưu kho.\n<br>Không giống với các hệ thống sử dụng máy tính nhúng (có thể sắp bị lỗi thời) khác, CHUM có sẵn kết nối tới các cổng USB của máy tính xách tay hoặc máy tính bảng thông thường.\n<br></div></div><div id=\"IMAGE382\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div></div></div>";

export function IntroSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="intro" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
