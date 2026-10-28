import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"Uudiem\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-overlay\"></div><div class=\"ladi-container\"><div  id=\"HEADLINE8\" class='ladi-element'><h1 class='ladi-headline'></h1></div><div  id=\"PARAGRAPH287\" class='ladi-element'><p class='ladi-paragraph ladi-transition'>Độ chính xác và độ tin cậy cao<br><br>Khả năng chống nước và bụi IP65\n<br><br>Chức năng lọc nguồn cho phép xác định được các sợi cáp ngầm đi song song gần nhau\n<br><br>Chức năng iLOC™ cho phép điều khiển máy phát từ xa thông qua Bluetooth (khoảng cách kết nối đến 450m)<br><br>Chức năng Trudepth™:  đo chính xác độ  sâu của cáp và ống ngầm<br><br>RD Map: Lập bản đồ các tiện ích ngầm theo thời gian thực, tương thích với Google Map<br><br>Thời gian bảo hành 3 năm<br></p></div><div  id=\"HEADLINE289\" class='ladi-element'><h3 class='ladi-headline'>Ưu điểm thiết bị RadioDetection</h3></div><div id=\"LINE321\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div  id=\"IMAGE442\" class='ladi-element'><div class='ladi-image'><div class=\"ladi-image-background\"></div></div></div></div></div>";

export function AdvantagesSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="advantages" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
