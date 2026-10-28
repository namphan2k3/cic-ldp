import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<section id=\"counter-wrapper\">\r\n\t\t\t\t<div class=\"row text-center appear stats wow fadeInDown\" data-wow-delay=\"0.2s\">\r\n\t\t\t\t\t<!--Insert timer inline-->\r\n\t\t\t\t\t<div class=\"timer\">\r\n                    \t\t<div class=\"col-lg-12\" style=\"margin-top:20px\">\r\n                            \t<div class=\"counter\">                                \r\n\t\t\t\t\t\t\t\t<ul class=\"list-inline\">\r\n                                <div id=\"getting-started\"></div>\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t <div class=\"btn-inlinetime\"><a href=\"#register\" class=\"btn btn-bordered btn-lg zoom\"> HÃY NHẤN ĐĂNG KÝ TRƯỚC THỜI ĐIỂM NÀY BẠN SẼ ĐƯỢC MUA ƯU ĐÃI</a></div>\r\n\t\t\t\t\t\t\t\t  </ul>\r\n\t\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t\t\r\n                          </div>                            \t\t\t\t\t\t\r\n\t\t\t\t</div>\r\n                    <!--end insert timer inline-->\t\t\t\r\n\t\t\t\t</div>\r\n\t\t\t\r\n\t\t\r\n\t</section>\r\n\t<!--End counter down-->    \r\n\t<div class=\"clearfix\"></div>\r\n<!--Start features-->\r\n\t";

export function CounterIntroSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="intro" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
