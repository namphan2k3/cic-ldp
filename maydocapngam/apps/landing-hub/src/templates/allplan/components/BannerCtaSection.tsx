import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION2\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-overlay\"></div><div class=\"ladi-container\"><div id=\"IMAGE904\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"HEADLINE905\" class='ladi-element'><h2 class='ladi-headline ladi-transition'>DÙNG THỬ ALLPLAN</h2></div><div id=\"PARAGRAPH906\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Kỹ sư có thể dựng mô hình nhanh chóng, trình bày chi tiết gia cố bê tông hiệu quả và tạo ra bản vẽ chất lượng cao với cùng một phần mềm. \n<br>\n<br>&gt; Tạo bản vẽ và dựng mô hình hiệu quả và chính xác\n<br>\n<br>&gt; Trực quan chuyên nghiệp và tài liệu mới nhất\n<br>\n<br>&gt; Bóc tách khối lượng chính xác giúp giảm thiểu chi phí\n<br>\n<br><span style=\"font-weight: bold;\">Thử nghiệm phiên bản đầy đủ của Allplan 2021 trong 30 ngày hoàn toàn miễn phí. Hãy tải xuống ngay phần mềm và tận tay trải nghiệm.</span><br></div></div><div data-action=\"true\" id=\"BUTTON907\" class='ladi-element'><div class='ladi-button ladi-transition'><div class=\"ladi-button-background\"></div><div id=\"BUTTON_TEXT907\" class='ladi-element ladi-button-headline'><p class='ladi-headline ladi-transition'>DÙNG THỬ</p></div></div></div></div></div>";

export function BannerCtaSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="hero" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
