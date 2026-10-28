import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"ThongSo\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div  id=\"HEADLINE294\" class='ladi-element'><h3 class='ladi-headline'>Thông số kỹ thuật</h3></div><div id=\"LINE295\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div  id=\"PARAGRAPH296\" class='ladi-element'><p class='ladi-paragraph ladi-transition'><span style=\"font-weight: bold;\">Độ nhạy:</span> 6E-15 Tesla, 5µA at 1 meter (33kHz)\n<br><br><span style=\"font-weight: bold;\">Dải động:</span> 140dB rms/√Hz\n<br><br><span style=\"font-weight: bold;\">Độ sâu tối đa:</span> Cable / Pipe: 30m  Sonde: 19.5m\n<br><br><span style=\"font-weight: bold;\">Độ chính xác: </span>3%\n<br><br><span style=\"font-weight: bold;\">Thời lượng pin: </span>30h<br><br><span style=\"font-weight: bold;\">Tần số:</span> 50 - 200 kHz (21 tần số)<br><br><span style=\"font-weight: bold;\">Tích hợp GPS</span><br><br><span style=\"font-weight: bold;\">Chế độ dò thụ động:</span> Cáp điện, cáp viễn thông, ...<br></p></div><div  id=\"IMAGE438\" class='ladi-element'><div class='ladi-image'><div class=\"ladi-image-background\"></div></div></div></div></div>";

export function IntroSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="intro" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
