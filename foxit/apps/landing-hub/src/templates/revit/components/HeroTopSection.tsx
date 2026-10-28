import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<header class=\"cover header small\">\r\n\t\t\t\t<!-- BEGIN OF Background -->\r\n\t\t\t\t<!-- Static image -->\r\n\t\t\t\t<div class=\"background bg-img\" data-bgsrc=\"/sites/revit/img/bg-cover.jpg\"></div>\r\n\t\t\t\t<!-- bg mask -->\r\n\t\t\t\t<div class=\"bg-mask bg-color\" data-bgcolor=\"rgba(232, 187, 10, 1)\">\r\n                </div>\r\n\t\t\t\t<!-- END OF Background -->\t\t\r\n\t\t\t\t<!-- Page Titles -->\r\n\t\t\t  <div class=\"title\">\r\n<!--\t\t\t\t\t<h3 class=\"wow fadeInRight\">Phân phối chính hãng bởi CIC</h3>\r\n-->\t\t\t\t\t<ul class=\"btn-groups clearfix\">\r\n\t\t\t\t\t\t<!-- Call to action button -->\r\n\t\t\t\t\t\t<li><a class=\"cta s-scroll\" href=\"#pricing\">Tôi muốn mua</a></li>\r\n\t\t\t\t\t</ul>\r\n\t\t\t\t</div>\t\t\t\t\r\n\t\t\t\t<!-- Scroll down indication -->\r\n\t\t  <div class=\"scroll-down \">\r\n\t\t\t\t\t<p><a href=\"#about_content\" class=\"s-scroll\">Cuộn xuống <span class=\"highlight\">xem nhiều thông tin hơn</span> <i class=\"ion-chevron-down icon\"></i></a></p>\r\n\t\t\t\t</div>\r\n\t\t\t</header>\r\n\t\t\t<!-- END OF Header cover of page -->\t\t\t\r\n\t\t\t<!-- BEGIN OF Page contents -->";

export function HeroTopSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="hero" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
