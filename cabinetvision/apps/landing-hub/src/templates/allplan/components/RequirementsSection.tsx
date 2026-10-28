import React from 'react';
import type { ModularSectionProps } from '../../shared/types';
import { hydrateSectionHtml } from '../../shared/sectionHtmlHydrator';

const SECTION_HTML = "<div id=\"SECTION958\" class='ladi-section'><div class='ladi-section-background'></div><div class=\"ladi-container\"><div id=\"PARAGRAPH961\" class='ladi-element'><div class='ladi-paragraph ladi-transition'>Lần đầu tiên các tệp Revit có thể được nhập trực tiếp trong phạm vi chế độ xem trước về mặt kỹ thuật. Điều này có nghĩa là các mô hình Revit có thể được nhập vào Allplan và sử dụng mà không cần chuyển đổi chúng sang định dạng IFC trước. Trong quá trình nhập, các đối tượng Allplan nguyên bản như tường, cột, trần nhà, dầm, cửa sổ, cửa ra vào và mái nhà được tạo ra.\r<br>\r<br>Khi nhập tệp DWG / DXF, hiện có thể chuyển đổi tọa độ UTM ở chế độ chuyên gia, bao gồm việc lựa chọn trực tiếp tệp NTv2.<br></div></div><div id=\"HEADLINE962\" class='ladi-element'><h3 class='ladi-headline ladi-transition'><span style=\"font-weight: 700;\">Xem trước các tệp nhập trực tiếp từ Revit</span><br></h3></div><div id=\"IMAGE971\" class='ladi-element'><div class='ladi-image ladi-transition'><div class=\"ladi-image-background\"></div></div></div></div></div>";

export function RequirementsSection({ payload, allPayloads }: ModularSectionProps) {
  const html = hydrateSectionHtml(SECTION_HTML, payload, allPayloads);
  return <article data-anchor="requirements" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
