import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML_VI = "<div id=\"SECTION971\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"IMAGE972\" class='ladi-element ladi-animation-hidden'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"HEADLINE973\" class='ladi-element'><h3 class='ladi-headline ladi-transition'    >Mua enjiCAD<br>Nhận ngay iPad !!!<br></h3> </div><div id=\"PARAGRAPH974\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Nhận ngay <span style=\"font-weight: bold;\">1 iPad Wifi 32GB trị giá 8.500.000 VNĐ</span> khi mua 2 licenses bản quyền phần mềm enjiCAD Professional hoặc 3 licenses bản quyền phần mềm enjiCAD Standard</div></div><div id=\"IMAGE975\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"IMAGE976\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"PARAGRAPH977\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Mỗi khách hàng <span style=\"font-weight: bold;\">có thể nhận nhiều phần quà (iPAD Wifi 32GB)</span>, tùy theo số lượng license bản quyền được mua</div></div><div id=\"IMAGE978\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"PARAGRAPH979\" class='ladi-element'><div class='ladi-paragraph ladi-transition'><span style=\"font-weight: bold;\">Quà tặng có thể quy đổi thành tiền</span> và chiết khấu trực tiếp vào giá mua phần mềm</div></div><div id=\"IMAGE980\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"PARAGRAPH981\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Chương trình bắt đầu từ ngày 12/12/2019 đến hết ngày 11/01/2020</div></div><div id=\"HEADLINE982\" class='ladi-element'><h3 class='ladi-headline ladi-transition'    >Khuyến mãi</h3> </div><div data-action=\"true\" id=\"BUTTON983\" class='ladi-element'><div class='ladi-button ladi-transition'><div class=\"ladi-button-background\"></div><div id=\"BUTTON_TEXT983\" class='ladi-element ladi-button-headline'><p class='ladi-headline ladi-transition'    ><span style=\"font-weight: 700;\">Đăng ký nhận quà<br></span></p> </div></div></div></div></div>";
const SECTION_HTML_EN = "";
const SECTION_HTML_ZH = "";

export function FooterSection({ payload, allPayloads, locale = 'vi' }: ModularSectionProps) {
  const baseHtml =
    locale === 'zh'
      ? SECTION_HTML_ZH
      : locale === 'en'
      ? SECTION_HTML_EN
      : SECTION_HTML_VI;
  const html = hydrateSectionHtml(baseHtml, payload, allPayloads);
  return <article data-anchor="footer" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
