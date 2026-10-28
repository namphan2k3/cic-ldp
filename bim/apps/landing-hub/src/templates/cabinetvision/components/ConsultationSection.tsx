import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION1197\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-overlay\"></div><div class=\"ladi-container\"><div  id=\"GROUP1166\" class='ladi-element'><div class='ladi-group'><div  id=\"PARAGRAPH1157\" class='ladi-element'><p class='ladi-paragraph'>GIẢM GIÁ</p></div><div  id=\"HEADLINE1158\" class='ladi-element'><h3 class='ladi-headline'>10%</h3></div><div  id=\"PARAGRAPH1159\" class='ladi-element'><p class='ladi-paragraph'>ĐẾN HẾT NGÀY 26/10</p></div></div></div><div  id=\"GROUP1165\" class='ladi-element'><div class='ladi-group'><div  id=\"IMAGE1163\" class='ladi-element'><div class='ladi-image'><div class=\"ladi-image-background\"></div></div></div><div  id=\"IMAGE1164\" class='ladi-element'><div class='ladi-image'><div class=\"ladi-image-background\"></div></div></div></div></div><div data-action=\"true\" id=\"BUTTON1191\" class='ladi-element'><div class='ladi-button ladi-transition'><div class=\"ladi-button-background\"></div><div  id=\"BUTTON_TEXT1191\" class='ladi-element'><p class='ladi-headline'>ĐĂNG KÝ</p></div></div></div><div  id=\"HEADLINE1213\" class='ladi-element'><h3 class='ladi-headline'>ƯU ĐÃI<br></h3></div></div></div>";

export function ConsultationSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="consultation_form" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
