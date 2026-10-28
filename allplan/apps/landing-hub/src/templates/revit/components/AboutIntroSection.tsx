import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div class=\"section\" id=\"about\">\r\n\t\t\t\t\t<div class=\"feature small centered desc-left row\">\r\n\t\t\t\t\t\t<div class=\"text medium-12 columns\">\r\n\t\t\t\t\t\t\t<!-- Icon -->\r\n\t\t\t\t\t\t\t<div class=\"section-icon wow fadeInDown\">\r\n\t\t\t\t\t\t\t\t<span class=\"icon\">\r\n\t\t\t\t\t\t\t\t\t<i class=\"ion ion-flash\"></i>\r\n\t\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<!-- Text -->\r\n\t\t\t\t\t\t\t<h2 class=\"title big wow fadeIn\">AUTODESK BUILDING DESIGN SUITE 2016 </h2>\r\n\t\t\t\t\t\t\t<p class=\"desc wow fadeIn\">Phân Phối Chính Hãng Bởi Công Ty Cổ Phần Tin Học Và Xây Dựng (CIC).<br> \r\nLà Bộ Sản Phẩm Kết Hợp Giữa Mô Hình Thông Tin Xây Dựng BIM Và Công Cụ CAD,<br> Giúp Thiết Kế, Mô Phỏng, Xây Dựng<br> Các Tòa Nhà Đạt Hiệu Quả Cao, Chất Lượng Tốt Nhất.</p>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<!-- END OF What is it  section -->\r\n\t\t\t\t\r\n\t\t\t\t<!-- BEGIN OF Why section -->\r\n\t\t\t\t";

export function AboutIntroSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="intro" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
