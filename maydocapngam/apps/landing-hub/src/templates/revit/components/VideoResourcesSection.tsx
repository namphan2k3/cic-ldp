import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div class=\"section color-darkblue download\" id=\"video\">\r\n\t\t\t\t\t<div class=\"feature small centered desc-left row\">\r\n\t\t\t\t\t\t<div class=\"text medium-12 columns\">\r\n\t\t\t\t\t\t\t<!-- Icon -->\r\n\t\t\t\t\t\t\t<div class=\"section-icon wow fadeInDown\">\r\n\t\t\t\t\t\t\t\t<span class=\"icon\">\r\n\t\t\t\t\t\t\t\t\t<i class=\"ion ion-archive\"></i>\r\n\t\t\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t<!-- Text -->\r\n\t\t\t\t\t\t\t<h2 class=\"title big wow fadeIn\">Giới thiệu Autodesk Building Suites 2016</h2>\r\n\t\t\t\t\t\t\t<p class=\"desc white wow fadeIn\"></p>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"medium-12 columns\">\r\n\t\t\t\t\t\t\t<ul class=\"download-btns wow fadeIn\">\r\n\t\t\t\t\t\t\t\t<li class=\"\">\r\n                                <iframe width=\"653\" height=\"480\" src=\"https://www.youtube.com/embed/8bhbBiJ5wdo\" frameborder=\"0\" allowfullscreen></iframe>\r\n\t\t\t\t\t\t\t\t</li>\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t</ul>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<!-- END OF video from store section -->\r\n\t\t\t\t\r\n\t\t\t\t<!-- BEGIN OF alt price list  section -->\r\n\t\t\t\t";

export function VideoResourcesSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="resources" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
