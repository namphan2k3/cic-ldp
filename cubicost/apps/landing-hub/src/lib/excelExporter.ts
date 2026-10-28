export interface ExcelLeadRecord {
  submittedAt: string;
  siteName: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  companyName: string | null;
  leadPayload: Record<string, any>;
}

const NEED_LABELS: Record<string, string> = {
  quote_consultation: 'Đăng ký nhận báo giá & tư vấn bản quyền',
  free_trial_30_days: 'Đăng ký dùng thử miễn phí 30 ngày',
  trial_30_days: 'Đăng ký dùng thử miễn phí 30 ngày',
  receive_lisp: 'Đăng ký nhận bộ LISP miễn phí',
  concrete_finishing: 'Robot hoàn thiện sàn bê tông',
  wall_finishing: 'Robot phun bả và xả nhám',
  floor_tiling: 'Robot lát gạch nền',
  site_measurement: 'Robot đo lường hiện trường',
  underwater_inspection: 'Robot kiểm tra dưới nước',
  sewer_cleaning: 'Robot vệ sinh cống ngầm',
  needs_assessment: 'Cần CIC tư vấn lựa chọn robot',
};

function escapeXml(raw: unknown): string {
  const str = String(raw ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\n/g, '&#10;');
}

export function buildLeadsExcelXml(leads: ExcelLeadRecord[], scopeName: string): string {
  const nowStr = new Date().toLocaleString('vi-VN');

  const rowsXml = leads
    .map((l, idx) => {
      const rowStyle = idx % 2 === 0 ? 'CellEven' : 'CellOdd';
      const centerStyle = idx % 2 === 0 ? 'CellEvenCenter' : 'CellOddCenter';
      const phoneStyle = idx % 2 === 0 ? 'CellEvenPhone' : 'CellOddPhone';

      const rawNeed = String(l.leadPayload?.primary_need || '');
      const needDisplay = NEED_LABELS[rawNeed] || rawNeed || 'Tư vấn giải pháp';

      const detailsParts: string[] = [];
      if (l.leadPayload?.product_version) {
        detailsParts.push(`Phiên bản: ${l.leadPayload.product_version}`);
      }
      if (l.leadPayload?.device_quantity) {
        detailsParts.push(`SL máy: ${l.leadPayload.device_quantity}`);
      }
      if (l.leadPayload?.requirements) {
        detailsParts.push(String(l.leadPayload.requirements));
      }
      const detailsStr = detailsParts.join(' | ') || '—';

      const careStatus = String(l.leadPayload?.care_status || 'Mới tiếp nhận');
      const picAndNote = [
        l.leadPayload?.pic ? `PIC: ${l.leadPayload.pic}` : '',
        l.leadPayload?.care_note ? String(l.leadPayload.care_note) : '',
      ]
        .filter(Boolean)
        .join(' - ') || '—';

      const dateStr = new Date(l.submittedAt).toLocaleString('vi-VN');

      return [
        '      <Row ss:AutoFitHeight="1" ss:Height="24">',
        `        <Cell ss:StyleID="${centerStyle}"><Data ss:Type="Number">${idx + 1}</Data></Cell>`,
        `        <Cell ss:StyleID="${centerStyle}"><Data ss:Type="String">${escapeXml(dateStr)}</Data></Cell>`,
        `        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(l.siteName)}</Data></Cell>`,
        `        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(l.fullName || '—')}</Data></Cell>`,
        `        <Cell ss:StyleID="${phoneStyle}"><Data ss:Type="String">${escapeXml(l.phone || '—')}</Data></Cell>`,
        `        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(l.email || '—')}</Data></Cell>`,
        `        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(l.companyName || '—')}</Data></Cell>`,
        `        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(needDisplay)}</Data></Cell>`,
        `        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(detailsStr)}</Data></Cell>`,
        `        <Cell ss:StyleID="${centerStyle}"><Data ss:Type="String">${escapeXml(careStatus)}</Data></Cell>`,
        `        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(picAndNote)}</Data></Cell>`,
        '      </Row>',
      ].join('\r\n');
    })
    .join('\r\n');

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:o="urn:schemas-microsoft-com:office:office"',
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:html="http://www.w3.org/TR/REC-html40">',
    '  <Styles>',
    '    <Style ss:ID="Default" ss:Name="Normal">',
    '      <Alignment ss:Vertical="Center"/>',
    '      <Font ss:FontName="Arial" ss:Size="10" ss:Color="#0F172A"/>',
    '    </Style>',
    '    <Style ss:ID="ReportTitle">',
    '      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>',
    '      <Font ss:FontName="Arial" ss:Size="13" ss:Bold="1" ss:Color="#FFFFFF"/>',
    '      <Interior ss:Color="#0B1B36" ss:Pattern="Solid"/>',
    '    </Style>',
    '    <Style ss:ID="ReportMeta">',
    '      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>',
    '      <Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#334155"/>',
    '      <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>',
    '    </Style>',
    '    <Style ss:ID="TableHeader">',
    '      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>',
    '      <Borders>',
    '        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0B1B36"/>',
    '        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>',
    '        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>',
    '        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0B1B36"/>',
    '      </Borders>',
    '      <Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>',
    '      <Interior ss:Color="#EA580C" ss:Pattern="Solid"/>',
    '    </Style>',
    '    <Style ss:ID="CellEven">',
    '      <Alignment ss:Vertical="Center" ss:WrapText="1"/>',
    '      <Borders>',
    '        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '      </Borders>',
    '      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>',
    '    </Style>',
    '    <Style ss:ID="CellOdd">',
    '      <Alignment ss:Vertical="Center" ss:WrapText="1"/>',
    '      <Borders>',
    '        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>',
    '      </Borders>',
    '      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>',
    '    </Style>',
    '    <Style ss:ID="CellEvenCenter" ss:Parent="CellEven">',
    '      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>',
    '    </Style>',
    '    <Style ss:ID="CellOddCenter" ss:Parent="CellOdd">',
    '      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>',
    '    </Style>',
    '    <Style ss:ID="CellEvenPhone" ss:Parent="CellEven">',
    '      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>',
    '      <NumberFormat ss:Format="@"/>',
    '    </Style>',
    '    <Style ss:ID="CellOddPhone" ss:Parent="CellOdd">',
    '      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>',
    '      <NumberFormat ss:Format="@"/>',
    '    </Style>',
    '  </Styles>',
    '  <Worksheet ss:Name="Danh sach Khach hang">',
    '    <Table>',
    '      <Column ss:Width="42"/>',
    '      <Column ss:Width="125"/>',
    '      <Column ss:Width="140"/>',
    '      <Column ss:Width="155"/>',
    '      <Column ss:Width="105"/>',
    '      <Column ss:Width="185"/>',
    '      <Column ss:Width="200"/>',
    '      <Column ss:Width="215"/>',
    '      <Column ss:Width="220"/>',
    '      <Column ss:Width="120"/>',
    '      <Column ss:Width="180"/>',
    '      <Row ss:Height="32">',
    '        <Cell ss:MergeAcross="10" ss:StyleID="ReportTitle">',
    '          <Data ss:Type="String">CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TƯ VẤN CIC — BÁO CÁO KHÁCH HÀNG ĐĂNG KÝ</Data>',
    '        </Cell>',
    '      </Row>',
    '      <Row ss:Height="22">',
    '        <Cell ss:MergeAcross="10" ss:StyleID="ReportMeta">',
    `          <Data ss:Type="String">Phạm vi: ${escapeXml(scopeName)}   |   Thời gian xuất: ${escapeXml(nowStr)}   |   Tổng số: ${leads.length} khách hàng</Data>`,
    '        </Cell>',
    '      </Row>',
    '      <Row ss:Height="28">',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">STT</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Thời gian đăng ký</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Website</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Họ và tên</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Số điện thoại</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Email</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Công ty / Đơn vị</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Nhu cầu đăng ký</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Chi tiết / Phiên bản</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Trạng thái chăm sóc</Data></Cell>',
    '        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Phụ trách &amp; Ghi chú</Data></Cell>',
    '      </Row>',
    rowsXml,
    '    </Table>',
    '  </Worksheet>',
    '</Workbook>',
  ];

  return lines.join('\r\n');
}
