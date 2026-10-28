import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION853\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-overlay\"></div><div class=\"ladi-container\"><div id=\"HEADLINE854\" class='ladi-element'><h3 class='ladi-headline ladi-transition'    >DỊCH VỤ ĐÀO TẠO BIM 5D<br></h3> </div><div id=\"LINE855\" class='ladi-element'><div class='ladi-line'><div class=\"ladi-line-container\"></div></div></div><div id=\"BOX856\" class='ladi-element'><div class='ladi-box ladi-transition'></div></div><div id=\"IMAGE857\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div><div id=\"PARAGRAPH858\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Khi khách hàng trang bị <span style=\"font-weight: bold;\">phần mềm Cubicost</span>, CIC sẽ triển khai&nbsp;<span style=\"font-weight: bold;\">Dịch vụ đào tạo phần mềm bóc tách khối lượng trên nền tảng BIM 5D bằng phần mềm Cubicost </span>giúp doanh nghiệp khai thác tối đa nền tảng BIM:<br><br>⦁ Đội ngũ chuyên gia đào tạo chuyên sâu, giàu kinh nghiệm về nền tảng BIM nói chung và <span style=\"font-weight: bold;\">phần mềm Cubicost</span> nói riêng<br><br>⦁ Song hành đào tạo cùng triển khai trên dự án thực tế, đem lại khả năng ứng dụng cao nhất<br><br>⦁ So sánh, đối chiếu với khối lượng bóc tay<br><br>⦁ Hỗ trợ liên tục sau đào tạo<br><br><span style=\"font-weight: bold;\">Để được tư vấn, vui lòng liên hệ:</span> Mr.Hưng - 088 691 6666<br></div></div></div></div>";

export function ComparisonSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="comparison" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
