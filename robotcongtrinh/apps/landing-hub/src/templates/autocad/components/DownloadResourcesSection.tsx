import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<section id=\"download\">\r\n\t\t<div class=\"download-wrapper\">\r\n\t\t\t<div class=\"container\">\r\n\t\t\t\t<div class=\"row wow fadeInUp\" data-wow-delay=\"0.2s\">\r\n\t\t\t\t\t<div class=\"col-md-8 col-md-offset-2\">\r\n\t\t\t\t\t\t<h3><span>Khách hàng tiêu biểu</span></h3>\r\n\t\t\t\t\t\t<p>Đã mua sản phẩm AutoCAD 2016.</p>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</section>\r\n\t<!--End download-->\r\n\t<!--Start client-->\r\n\t";

export function DownloadResourcesSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="resources" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
