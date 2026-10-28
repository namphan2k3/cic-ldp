import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML_VI = "<div id=\"SECTION1078\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"HEADLINE1079\" class='ladi-element'><h3 class='ladi-headline ladi-transition'    >enjiCAD Education</h3> </div><div id=\"LINE1080\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div id=\"PARAGRAPH1081\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>enjiCAD Education là phiên bản hoàn toàn miễn phí dành cho sinh viên, giảng viên cũng như các trường Đại học, Cao đẳng, Trung cấp và các Tổ chức đào tạo khác nhằm tạo hiệu quả giảng dạy, học tập và nghiên cứu tốt nhất với phần mềm CAD có bản quyền.</div></div><div id=\"IMAGE1082\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"PARAGRAPH1083\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Sinh viên, Giảng viên có thể đăng ký nhận bản quyền sử dụng phần mềm enjiCAD Education bằng cách đăng ký tại đây, chúng tôi sẽ xác minh thông tin và gửi file cài đặt tới bạn. Nếu bạn là Sinh viên, bản quyền sẽ được cấp hàng năm cho đến khi bạn ra trường.<br></div></div><div id=\"PARAGRAPH1086\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Với các trường Đại học, Cao đẳng, Trung cấp và các Tổ chức đào tạo, sau khi Quý nhà trường đăng ký, chúng tôi sẽ liên hệ lại để hoàn thiện các thủ tục hợp tác.<br></div></div><a href=\"https://docs.google.com/forms/d/191eS-N0Cj06J9LD2S8yirLXs7aJ6IsawtaUhfGb1l-8/viewform?pli=1&edit_requested=true\" target=\"_blank\" rel=\"nofollow\" id=\"BUTTON1087\" class='ladi-element'><div class='ladi-button ladi-transition'><div class=\"ladi-button-background\"></div><div id=\"BUTTON_TEXT1087\" class='ladi-element ladi-button-headline'><p class='ladi-headline ladi-transition'    ><span style=\"font-weight: 700;\">Đăng ký</span></p> </div></div></a><div id=\"PARAGRAPH1089\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>*Lưu ý: Các license Education không được phép sử dụng với mục đích thương mại hoặc bất kì mục đích vì lợi nhuận nào khác<br></div></div></div></div>";
const SECTION_HTML_EN = "";
const SECTION_HTML_ZH = "";

export function ResourcesSection({ payload, allPayloads, locale = 'vi' }: ModularSectionProps) {
  const baseHtml =
    locale === 'zh'
      ? SECTION_HTML_ZH
      : locale === 'en'
      ? SECTION_HTML_EN
      : SECTION_HTML_VI;
  const html = hydrateSectionHtml(baseHtml, payload, allPayloads);
  return <article data-anchor="resources" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
