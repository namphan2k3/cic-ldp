import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<section id=\"download\" class=\"downlaod\">\r\n\t\t\t<div class=\"color-overlay\">\r\n\t\t\t\t<div class=\"container\">\r\n\t\t\t\t\t<div class=\"row\">\r\n\t\t\t\t\t\t<div class=\"col-sm-12 text-center\">\r\n\t\t\t\t\t\t\t<div class=\"title wow animated fadeInUp\">\r\n\t\t\t\t\t\t\t\t<h2>DOWNLOAD</h2>\r\n\t\t\t\t\t\t\t\t<div class=\"sub-heading\">\r\n\t\t\t\t\t\t\t\t\t<p>Phần mềm dự toán ESCON Version 15 <br>\r\n\t\t\t\t\t\t\t\t     . Nhấn vào đường link bên dưới tải về cài đặt</p>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<!-- .title end -->\r\n\t\t\t\t\t\t\t<a href=\"http://www.cic.com.vn/DuToan/EsconSetup.exe\" class=\"btn default-btn wow animated fadeInUp\" data-wow-delay=\".6s\" data-wow-duration=\"1s\" target=\"_blank\"><i class=\"fa fa-windows\"></i> Tải về</a>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div> <!-- transpharent background -->\r\n\t\t</section>\r\n    <!-- /.download end -->\r\n\t<!-- faq start --> \r\n\t\t";

export function DownloadResourcesSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="resources" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
