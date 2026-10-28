import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION580\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"VIDEO917\" class='ladi-element'><div class='ladi-video'><div class=\"ladi-video-background\"></div><div id=\"SHAPE917\" class='ladi-element'><div class='ladi-shape ladi-transition'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" viewBox=\"0 0 408.7 408.7\" fill=\"rgba(0, 0, 0, 0.5)\"><use xlink:href=\"#shape_rLFFIMmWMe\"></use></svg></div></div></div></div><div id=\"PARAGRAPH918\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Tạo mô hình nhanh chóng từ AutoCAD;<br>Giao diện đa màn hình, 2D và 3D xuất hiện cùng lúc giúp cho người dùng thao tác trong môi trường 2D nhưng tạo ra mô hình 3D;<br>Tuỳ chỉnh cao độ các cấu kiện từ đơn giản tới nâng cao giúp cho việc tiết kiệm thời gian cho việc thay đổi thiết kế;<br>Quản lý bản vẽ, cấu kiện khoa học giúp tăng tốc độ làm việc, tối ưu hoá mô hình và dung lựng file.<br></div></div><div id=\"HEADLINE920\" class='ladi-element'><h3 class='ladi-headline ladi-transition'><span style=\"font-weight: 700;\">Nền tảng 3D mạnh mẽ</span><br></h3></div></div></div>";

export function AdvantagesSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="advantages" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
