import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<footer class=\"footer\">\r\n\t\t\t\t<div class=\"title\"><p>CIC &copy; 2015</p></div>\r\n<!--\t\t\t\t<div><p>Power by <a href=\"#\">CIC</a></p></div>-->\r\n\t\t\t\t<div><p>All right reserved</p></div>\r\n\t\t\t</footer>";

export function FooterSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="footer" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
