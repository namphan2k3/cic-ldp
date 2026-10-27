import fs from 'node:fs';
import path from 'node:path';
import postgres from '../../node_modules/postgres/src/index.js';

const sql = postgres({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'cic_supabase_2026',
  database: 'postgres',
  ssl: false,
});

const contentFilePath = new URL('./migrated-cms-content.json', import.meta.url);
const rawData = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));

async function main() {
  console.log('Seeding cic_landing schema with 100% accurate content & Supabase media assets...');

  // 1. Seed landing_section_types
  console.log('-> Seeding landing_section_types...');
  const sectionTypes = [
    { code: 'header', name: 'Header Navigation & Brand Bar', category: 'header' },
    { code: 'hero', name: 'Hero Ken Burns / Highlight Banner', category: 'hero' },
    { code: 'intro', name: 'Introduction & Industrial Story', category: 'content' },
    { code: 'catalog', name: 'Product Catalog & Showcase Cards', category: 'catalog' },
    { code: 'advantages', name: 'Key Advantages & Features Matrix', category: 'feature' },
    { code: 'comparison', name: 'AutoCAD vs Alternative Comparison', category: 'comparison' },
    { code: 'requirements', name: 'System Requirements & File Formats', category: 'content' },
    { code: 'resources', name: 'Downloads, Brochures & Learning Center', category: 'content' },
    { code: 'video_slider', name: 'YouTube Video Showcase Slider', category: 'media' },
    { code: 'infrastructure', name: 'Infrastructure & Specialized Machinery', category: 'catalog' },
    { code: 'consultation_form', name: 'Dynamic Consultation & Lead Capture Form', category: 'form' },
    { code: 'faq', name: 'Searchable FAQ Accordion', category: 'faq' },
    { code: 'footer', name: 'Corporate Footer & Legal Notice', category: 'footer' },
    { code: 'floating_cta', name: 'Floating Action Shortcuts & Quick Contact', category: 'cta' },
  ];

  for (const st of sectionTypes) {
    await sql`
      INSERT INTO cic_landing.landing_section_types (
        landing_section_type_code,
        landing_section_type_name,
        category,
        is_active
      ) VALUES (
        ${st.code},
        ${st.name},
        ${st.category},
        true
      )
      ON CONFLICT (landing_section_type_code) DO UPDATE SET
        landing_section_type_name = EXCLUDED.landing_section_type_name,
        category = EXCLUDED.category,
        updated_at_utc = NOW();
    `;
  }

  // 2. Seed landing_sites: cms-intellicad & robot-cong-trinh
  console.log('-> Seeding landing_sites...');

  // cms-intellicad
  const [cmsSite] = await sql`
    INSERT INTO cic_landing.landing_sites (
      landing_site_code,
      landing_site_name,
      landing_site_type,
      primary_domain,
      custom_domains_json,
      supported_locales_json,
      default_locale,
      site_status,
      brand_config_json,
      seo_meta_json,
      tracking_config_json
    ) VALUES (
      'cms-intellicad',
      'CMS IntelliCAD Vietnam',
      'landing',
      'intellicad.cic.com.vn',
      ${sql.json(['cms-intellicad.test', 'localhost:3000'])},
      ${sql.json(['vi', 'en'])},
      'vi',
      'active',
      ${sql.json({
        hotline: '0866 059 659',
        hotline_display: '0866.059.659',
        email: 'intellicad@cic.com.vn',
        address: 'Tầng 3, Tòa nhà CIC, 37 Lê Văn Thiêm, Thanh Xuân, Hà Nội',
        primary_color: '#005baa',
        accent_color: '#ff6600',
        logo_url: '/api/landing/media/cms-intellicad/images/logo.png',
        company_logo_url: '/api/landing/media/cms-intellicad/images/company_logo.png',
        favicon_url: '/api/landing/media/cms-intellicad/images/favicon.ico'
      })},
      ${sql.json(rawData['cms-intellicad']['vi']['seo'] || {})},
      ${sql.json({
        gtm_id: 'GTM-XXXXXX',
        fb_pixel_id: '1234567890'
      })}
    )
    ON CONFLICT (landing_site_code) DO UPDATE SET
      landing_site_name = EXCLUDED.landing_site_name,
      primary_domain = EXCLUDED.primary_domain,
      custom_domains_json = EXCLUDED.custom_domains_json,
      brand_config_json = EXCLUDED.brand_config_json,
      seo_meta_json = EXCLUDED.seo_meta_json,
      updated_at_utc = NOW()
    RETURNING *;
  `;

  // robot-cong-trinh
  const [robotSite] = await sql`
    INSERT INTO cic_landing.landing_sites (
      landing_site_code,
      landing_site_name,
      landing_site_type,
      primary_domain,
      custom_domains_json,
      supported_locales_json,
      default_locale,
      site_status,
      brand_config_json,
      seo_meta_json,
      tracking_config_json
    ) VALUES (
      'robot-cong-trinh',
      'Robot Công Trình CIC',
      'landing',
      'robot.cic.com.vn',
      ${sql.json(['robot-cong-trinh.test'])},
      ${sql.json(['vi'])},
      'vi',
      'active',
      ${sql.json({
        hotline_1: '0866 059 659',
        hotline_2: '0976 267 834',
        email_1: 'contact@cic.com.vn',
        email_2: 'truongvv@cic.com.vn',
        address: 'Tòa nhà CIC, 37 Lê Văn Thiêm, Thanh Xuân, Hà Nội',
        primary_color: '#102d43',
        accent_color: '#e95124',
        logo_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-8d323f9c6754.png',
        favicon_url: '/api/landing/media/robot-cong-trinh/images/favicon.ico',
        footer_banner_url: '/api/landing/media/robot-cong-trinh/images/robot/banner_footer_4.jpg'
      })},
      ${sql.json(rawData['robot-cong-trinh']['vi']['seo'] || {})},
      ${sql.json({
        gtm_id: 'GTM-ROBOTXX',
        fb_pixel_id: '9876543210'
      })}
    )
    ON CONFLICT (landing_site_code) DO UPDATE SET
      landing_site_name = EXCLUDED.landing_site_name,
      primary_domain = EXCLUDED.primary_domain,
      brand_config_json = EXCLUDED.brand_config_json,
      seo_meta_json = EXCLUDED.seo_meta_json,
      updated_at_utc = NOW()
    RETURNING *;
  `;

  // 3. Seed landing_pages & sections for cms-intellicad (vi & en)
  console.log('-> Seeding pages & sections for cms-intellicad...');
  for (const locale of ['vi', 'en']) {
    const cmsLocaleData = rawData['cms-intellicad'][locale] || {};
    const [cmsPage] = await sql`
      INSERT INTO cic_landing.landing_pages (
        landing_site_id,
        landing_page_slug,
        landing_page_locale,
        page_title,
        page_status,
        is_home_page,
        page_seo_json,
        published_at_utc
      ) VALUES (
        ${cmsSite.landing_site_id},
        'home',
        ${locale},
        ${cmsLocaleData.seo?.title || 'CMS IntelliCAD Vietnam'},
        'published',
        ${locale === 'vi'},
        ${sql.json(cmsLocaleData.seo || {})},
        NOW()
      )
      ON CONFLICT (landing_site_id, landing_page_slug, landing_page_locale) DO UPDATE SET
        page_title = EXCLUDED.page_title,
        page_seo_json = EXCLUDED.page_seo_json,
        updated_at_utc = NOW()
      RETURNING *;
    `;

    await sql`DELETE FROM cic_landing.landing_page_sections WHERE landing_page_id = ${cmsPage.landing_page_id}`;

    // Ensure image paths use /api/landing/media/...
    const heroPayload = {
      ...(cmsLocaleData.hero || {}),
      hero_visual_url: '/api/landing/media/cms-intellicad/images/intellicad_3d_laptop_1785898332833.jpg',
      backup_visual_url: '/api/landing/media/cms-intellicad/images/intellicad-hero.jpg',
    };

    const advantagesPayload = {
      ...(cmsLocaleData.advantages || {}),
      background_image_url: '/api/landing/media/cms-intellicad/images/cad_engineers_bg_1785984144734.jpg',
    };

    const resourcesPayload = {
      ...(cmsLocaleData.resources || {}),
      visual_image_url: '/api/landing/media/cms-intellicad/images/cms_box_monitor_1785990083366.jpg',
      comparison_download_url: '/api/landing/media/cms-intellicad/downloads/TechAZ_So_Sanh_IntelliCAD_AutoCAD.pdf',
      lisp_download_url: '/api/landing/media/cms-intellicad/downloads/Lisp Intellicad.rar',
    };

    const headerPayload = {
      ...(cmsLocaleData.header || {}),
      logo_url: '/api/landing/media/cms-intellicad/images/logo.png',
      company_logo_url: '/api/landing/media/cms-intellicad/images/company_logo.png',
    };

    const footerPayload = {
      ...(cmsLocaleData.footer || {}),
      logo_url: '/api/landing/media/cms-intellicad/images/logo.png',
      company_logo_url: '/api/landing/media/cms-intellicad/images/company_logo.png',
    };

    const cmsSections = [
      { code: 'header', anchor: 'header', order: 0, payload: headerPayload },
      { code: 'hero', anchor: 'hero', order: 1, payload: heroPayload },
      { code: 'advantages', anchor: 'advantages', order: 2, payload: advantagesPayload },
      { code: 'comparison', anchor: 'comparison', order: 3, payload: cmsLocaleData.compare || {} },
      { code: 'requirements', anchor: 'requirements', order: 4, payload: cmsLocaleData.requirements || {} },
      { code: 'resources', anchor: 'resources', order: 5, payload: resourcesPayload },
      { code: 'faq', anchor: 'faq', order: 6, payload: cmsLocaleData.faq || {} },
      { code: 'consultation_form', anchor: 'dang-ky', order: 7, payload: cmsLocaleData.form || {} },
      { code: 'footer', anchor: 'footer', order: 8, payload: footerPayload },
      { code: 'floating_cta', anchor: 'floating-cta', order: 9, payload: cmsLocaleData.floating || {} },
    ];

    const typographyStyles = cmsLocaleData.styles || {};

    for (const sec of cmsSections) {
      await sql`
        INSERT INTO cic_landing.landing_page_sections (
          landing_page_id,
          landing_section_type_code,
          section_anchor_id,
          section_order,
          is_section_enabled,
          published_payload_json,
          typography_config_json
        ) VALUES (
          ${cmsPage.landing_page_id},
          ${sec.code},
          ${sec.anchor},
          ${sec.order},
          true,
          ${sql.json(sec.payload)},
          ${sql.json(typographyStyles)}
        );
      `;
    }

    await sql`
      INSERT INTO cic_landing.landing_content_revisions (
        landing_page_id,
        revision_number,
        revision_snapshot_json,
        revision_summary,
        created_by
      ) VALUES (
        ${cmsPage.landing_page_id},
        1,
        ${sql.json({ sections: cmsSections, typography: typographyStyles, seo: cmsLocaleData.seo })},
        'Supabase persistent storage import',
        'System Migrator'
      )
      ON CONFLICT (landing_page_id, revision_number) DO UPDATE SET
        revision_snapshot_json = EXCLUDED.revision_snapshot_json,
        revision_summary = EXCLUDED.revision_summary;
    `;
  }

  // 4. Seed landing_pages & sections for robot-cong-trinh (vi)
  console.log('-> Seeding pages & sections for robot-cong-trinh...');
  const robotLocaleData = rawData['robot-cong-trinh']['vi'] || {};
  const [robotPage] = await sql`
    INSERT INTO cic_landing.landing_pages (
      landing_site_id,
      landing_page_slug,
      landing_page_locale,
      page_title,
      page_status,
      is_home_page,
      page_seo_json,
      published_at_utc
    ) VALUES (
      ${robotSite.landing_site_id},
      'home',
      'vi',
      ${robotLocaleData.seo?.title || 'Robot Công Trình - CIC'},
      'published',
      true,
      ${sql.json(robotLocaleData.seo || {})},
      NOW()
    )
    ON CONFLICT (landing_site_id, landing_page_slug, landing_page_locale) DO UPDATE SET
      page_title = EXCLUDED.page_title,
      page_seo_json = EXCLUDED.page_seo_json,
      updated_at_utc = NOW()
    RETURNING *;
  `;

  await sql`DELETE FROM cic_landing.landing_page_sections WHERE landing_page_id = ${robotPage.landing_page_id}`;

  const robotHeaderPayload = {
    ...(robotLocaleData.header || {}),
    logo_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-8d323f9c6754.png',
  };

  const robotHeroPayload = {
    ...(robotLocaleData.hero || {}),
    visual_url_1: '/api/landing/media/robot-cong-trinh/images/robot/robot-1874acec2e24.jpg',
    visual_url_2: '/api/landing/media/robot-cong-trinh/images/robot/robot-1874acec2e23.jpg',
  };

  const robotCatalogPayload = {
    ...(robotLocaleData.catalog || {}),
    items: [
      {
        label: 'SÀN BÊ TÔNG',
        tag: 'Hoàn thiện sàn',
        title: 'Robot hoàn thiện sàn bê tông',
        model: 'ZP420C · MG210B',
        price: '1.014.000.000 VNĐ · 1.091.000.000 VNĐ',
        description: 'San phẳng bê tông bằng laser với ZP420C; xoa nền và xoa mịn bê tông với MG210B.',
        application: 'Nhà xưởng, kho logistics, bãi đỗ xe và mặt bằng bê tông quy mô lớn.',
        cta: 'Xem chi tiết',
        image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-c575d3e750b7.png',
        image_alt: 'Robot gạt phẳng bê tông ZP420C'
      },
      {
        label: 'TƯỜNG & TRẦN',
        tag: 'Hoàn thiện bề mặt',
        title: 'Robot tích hợp phun bả và xả nhám',
        model: 'JPD433D',
        price: '2.086.000.000 VNĐ',
        description: 'Phun sơn nước, phun bả, gạt phẳng bả và xả nhám thông qua việc thay đổi đầu công tác.',
        application: 'Chung cư, khách sạn, văn phòng có diện tích tường, trần lớn và thiết kế lặp lại.',
        cta: 'Xem chi tiết',
        image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-e8ec0ecd53b7.png',
        image_alt: 'Robot tích hợp phun bả JPD433D'
      },
      {
        label: 'LÁT GẠCH',
        tag: 'Thi công gạch nền',
        title: 'Robot lát gạch nền bằng keo dán gạch',
        model: 'TZ432B',
        price: '2.636.000.000 VNĐ',
        description: 'Kết hợp cánh tay sáu trục, cảm biến và xe tự hành để hỗ trợ gắp, bôi keo và đặt gạch.',
        application: 'Gạch khổ lớn tại chung cư, trung tâm thương mại, khách sạn, sân bay và nhà ga.',
        cta: 'Xem chi tiết',
        image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-5ae49108c24d.png',
        image_alt: 'Robot lát gạch nền TZ432B'
      },
      {
        label: 'ĐO LƯỜNG',
        tag: 'Dữ liệu hiện trường',
        title: 'Robot cán vữa sàn tự động',
        model: 'JP210C',
        price: '337.000.000',
        description: 'Chuyên dụng cho công tác cán vữa sàn với hiệu suất cao đạt 100m2/1h; độ chính xác cao: Dung sai độ phẳng ±1 mm/7 m và sử dụng nguồn điện linh hoạt.',
        application: 'Các dự án thi công như nhà ở dân dụng, hạ tầng giáo dục, đầu mối giao thông, tòa nhà thương mại và nhà xưởng công nghiệp.',
        cta: 'Xem chi tiết',
        image_url: '/api/landing/media/robot-cong-trinh/images/cms/b7fd48602d24924178b80f6df4b588d8.png',
        image_alt: 'Robot cán vữa sàn tự động JP210C'
      }
    ]
  };

  const robotVideoSliderPayload = {
    title: 'Video thực tế tại công trình',
    subtitle: 'Theo dõi các robot vận hành trực tiếp trên các đại dự án thi công',
    items: [
      {
        youtube_id: 'ZsjXqYKYeYw',
        title: 'Robot cán phẳng bê tông laser ZP420C',
        caption: 'Robot gạt phẳng bê tông thi công thực tế tại công trình'
      },
      {
        youtube_id: 'VlaRWTbqR10',
        title: 'Robot xoa nền siêu mịn MG210B',
        caption: 'Robot xoa nền MG210B hoàn thiện bề mặt sàn siêu phẳng'
      },
      {
        youtube_id: 'dnCv71DL71o',
        title: 'Robot phun vữa & xoa trát tường tự động',
        caption: 'Robot phun vữa trát tường tự động năng suất cao'
      },
      {
        youtube_id: 'A8rCWo780Bc',
        title: 'Robot cán vữa sàn tự động JP210C',
        caption: 'Robot cán vữa sàn tự động đạt chuẩn độ phẳng cao'
      }
    ]
  };

  const robotInfraPayload = {
    ...(robotLocaleData.infrastructure || {}),
    title: 'Robot kiểm tra & bảo trì hạ tầng ngầm',
    items: [
      {
        title: 'Robot nạo vét cống ngầm dưới nước',
        subtitle: 'Thi công nạo vét bùn đất sâu trong lòng cống ngập nước không cần người chui vào',
        image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-ef7d081caac2.png',
        videos: [
          { id: 'poVO5OeM3RA', label: 'Vận hành dưới bùn sâu' },
          { id: 'EAzc6FuEOfs', label: 'Thi công thực tế dự án' }
        ]
      },
      {
        title: 'Robot kiểm tra & khảo sát đường ống thoát nước CCTV',
        subtitle: 'Bánh xích camera xoay 360 độ siêu nét phát hiện nứt vỡ, rò rỉ và dị vật đường ống ngầm',
        image_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-e6e6f41c09de.png',
        videos: [
          { id: 'ga0pU5Apcu4', label: 'Khảo sát camera đường kính lớn' },
          { id: 'PhEulGAeC0o', label: 'Báo cáo dị tật đường ống' }
        ]
      }
    ]
  };

  const robotFooterPayload = {
    ...(robotLocaleData.footer || {}),
    banner_footer_url: '/api/landing/media/robot-cong-trinh/images/robot/banner_footer_4.jpg',
    logo_url: '/api/landing/media/robot-cong-trinh/images/robot/robot-8d323f9c6754.png',
  };

  const robotSections = [
    { code: 'header', anchor: 'header', order: 0, payload: robotHeaderPayload },
    { code: 'hero', anchor: 'hero', order: 1, payload: robotHeroPayload },
    { code: 'intro', anchor: 'gioi-thieu', order: 2, payload: robotLocaleData.intro || {} },
    { code: 'catalog', anchor: 'robot', order: 3, payload: robotCatalogPayload },
    { code: 'video_slider', anchor: 'video-slider', order: 4, payload: robotVideoSliderPayload },
    { code: 'infrastructure', anchor: 'robot-ha-tang', order: 5, payload: robotInfraPayload },
    { code: 'consultation_form', anchor: 'dang-ky', order: 6, payload: robotLocaleData.form || {} },
    { code: 'faq', anchor: 'faq', order: 7, payload: robotLocaleData.faq || {} },
    { code: 'footer', anchor: 'footer', order: 8, payload: robotFooterPayload },
  ];

  for (const sec of robotSections) {
    await sql`
      INSERT INTO cic_landing.landing_page_sections (
        landing_page_id,
        landing_section_type_code,
        section_anchor_id,
        section_order,
        is_section_enabled,
        published_payload_json
      ) VALUES (
        ${robotPage.landing_page_id},
        ${sec.code},
        ${sec.anchor},
        ${sec.order},
        true,
        ${sql.json(sec.payload)}
      );
    `;
  }

  await sql`
    INSERT INTO cic_landing.landing_content_revisions (
      landing_page_id,
      revision_number,
      revision_snapshot_json,
      revision_summary,
      created_by
    ) VALUES (
      ${robotPage.landing_page_id},
      1,
      ${sql.json({ sections: robotSections, seo: robotLocaleData.seo })},
      'Accurate Supabase media and video links update',
      'System Migrator'
    )
    ON CONFLICT (landing_page_id, revision_number) DO UPDATE SET
      revision_snapshot_json = EXCLUDED.revision_snapshot_json,
      revision_summary = EXCLUDED.revision_summary;
  `;

  // 5. Seed landing_forms
  console.log('-> Seeding landing_forms...');

  // CMS IntelliCAD form
  await sql`
    INSERT INTO cic_landing.landing_forms (
      landing_site_id,
      form_code,
      form_name,
      fields_schema_json,
      notification_emails_json,
      google_sheet_config_json,
      success_action,
      success_payload_json,
      is_form_active
    ) VALUES (
      ${cmsSite.landing_site_id},
      'cms_consult_form',
      'Đăng Ký Tư Vấn & Trải Nghiệm CMS IntelliCAD',
      ${sql.json([
        { name: 'name', label: 'Họ và tên *', type: 'text', placeholder: 'Nguyễn Văn A', required: true },
        { name: 'phone', label: 'Số điện thoại *', type: 'tel', placeholder: '0912 345 678', required: true },
        { name: 'email', label: 'Email công việc *', type: 'email', placeholder: 'name@company.com', required: true },
        { name: 'company', label: 'Tên công ty / Doanh nghiệp', type: 'text', placeholder: 'Công ty Cổ phần Xây dựng ABC', required: false },
        { name: 'interest_lisp', label: 'Tôi quan tâm giải pháp LISP / API mở rộng', type: 'checkbox', default_value: false, required: false },
        { 
          name: 'software_version', 
          label: 'Phiên bản quan tâm', 
          type: 'select', 
          options: [
            { label: 'CMS IntelliCAD PE Plus (Khuyên dùng)', value: 'pe_plus' },
            { label: 'CMS IntelliCAD PE', value: 'pe' },
            { label: 'CMS IntelliCAD Easy Run (Cloud)', value: 'easy_run' }
          ],
          default_value: 'pe_plus',
          required: false,
          conditional_visible_on: { field: 'interest_lisp', value: false }
        },
        { 
          name: 'quantity', 
          label: 'Số lượng license dự kiến', 
          type: 'number', 
          placeholder: '1', 
          default_value: 1,
          required: false,
          conditional_visible_on: { field: 'interest_lisp', value: false }
        },
        { name: 'notes', label: 'Nhu cầu hoặc yêu cầu đặc thù', type: 'textarea', placeholder: 'Vui lòng mô tả chi tiết nhu cầu...', required: false }
      ])},
      ${sql.json(['intellicad@cic.com.vn'])},
      ${sql.json({
        spreadsheet_id: '16E6ZJb2P8L1_V123',
        sheet_name: 'LADIPAGE',
        sheet_name_conditional_map: {
          interest_lisp: 'CMS INTELLICAD LISP'
        }
      })},
      'modal_download',
      ${sql.json({
        modal_title: 'Đăng Ký Thành Công!',
        modal_description: 'Cảm ơn Quý khách. Đội ngũ chuyên gia CIC sẽ liên hệ sớm nhất. Quý khách có thể tải bản dùng thử hoặc tài liệu so sánh bên dưới:',
        default_download_url: '/api/landing/media/cms-intellicad/downloads/TechAZ_So_Sanh_IntelliCAD_AutoCAD.pdf',
        download_url_map: {
          interest_lisp: '/api/landing/media/cms-intellicad/downloads/Lisp Intellicad.rar'
        }
      })},
      true
    )
    ON CONFLICT (landing_site_id, form_code) DO UPDATE SET
      form_name = EXCLUDED.form_name,
      fields_schema_json = EXCLUDED.fields_schema_json,
      google_sheet_config_json = EXCLUDED.google_sheet_config_json,
      success_payload_json = EXCLUDED.success_payload_json,
      updated_at_utc = NOW();
  `;

  // Robot Công Trình form
  await sql`
    INSERT INTO cic_landing.landing_forms (
      landing_site_id,
      form_code,
      form_name,
      fields_schema_json,
      notification_emails_json,
      google_sheet_config_json,
      success_action,
      success_payload_json,
      is_form_active
    ) VALUES (
      ${robotSite.landing_site_id},
      'robot_consult_form',
      'Đăng Ký Tư Vấn & Khảo Sát Robot Công Trình',
      ${sql.json([
        { name: 'name', label: 'Họ và tên *', type: 'text', placeholder: 'Nguyễn Văn A', required: true },
        { name: 'phone', label: 'Số điện thoại *', type: 'tel', placeholder: '0912 345 678', required: true },
        { name: 'email', label: 'Email công việc *', type: 'email', placeholder: 'name@company.com', required: true },
        { name: 'company', label: 'Đơn vị / Dự án thi công', type: 'text', placeholder: 'Tổng công ty Xây dựng ...', required: false },
        {
          name: 'robot_needs',
          label: 'Nhu cầu quan tâm cụ thể',
          type: 'checkbox_group',
          options: [
            { label: 'Nhận trọn bộ tài liệu sản phẩm và video thực tế', value: 'nhan_tai_lieu' },
            { label: 'Báo giá chi tiết sản phẩm', value: 'bao_gia' },
            { label: 'Trải nghiệm & demo trực tiếp tại công trình', value: 'demo' },
            { label: 'Tư vấn giải pháp kỹ thuật theo dự án', value: 'tu_van_ky_thuat' },
            { label: 'Tư vấn robot nạo vét cống & kiểm tra cống', value: 'robot_ha_tang' },
            { label: 'Chính sách đại lý & hợp tác chuyển giao công nghệ', value: 'chinh_sach_dai_ly' },
            { label: 'Nhu cầu khác', value: 'khac' }
          ],
          default_value: ['nhan_tai_lieu'],
          required: false
        },
        { name: 'notes', label: 'Quy mô công trình / Nhu cầu cụ thể', type: 'textarea', placeholder: 'Diện tích sàn, tiến độ dự án...', required: false }
      ])},
      ${sql.json(['contact@cic.com.vn', 'truongvv@cic.com.vn'])},
      ${sql.json({
        spreadsheet_id: '16E6ZJb2P8L1_V123',
        sheet_name: 'ROBOT_LEADS'
      })},
      'modal_download',
      ${sql.json({
        modal_title: 'Đăng Ký Thành Công!',
        modal_description: 'Cảm ơn Quý khách! Đội ngũ giải pháp Robot Công Trình CIC sẽ liên hệ tư vấn trong vòng 15 phút. Quý khách có thể tải trọn bộ Catalog Robot bên dưới:',
        default_download_url: '/api/landing/media/robot-cong-trinh/file/robot-xay-dung.pdf'
      })},
      true
    )
    ON CONFLICT (landing_site_id, form_code) DO UPDATE SET
      form_name = EXCLUDED.form_name,
      fields_schema_json = EXCLUDED.fields_schema_json,
      google_sheet_config_json = EXCLUDED.google_sheet_config_json,
      success_payload_json = EXCLUDED.success_payload_json,
      updated_at_utc = NOW();
  `;

  // 6. Verify seeded data counts
  console.log('-> Verifying seeded data...');
  const [typesCount] = await sql`SELECT count(*) FROM cic_landing.landing_section_types`;
  const [sitesCount] = await sql`SELECT count(*) FROM cic_landing.landing_sites`;
  const [pagesCount] = await sql`SELECT count(*) FROM cic_landing.landing_pages`;
  const [sectionsCount] = await sql`SELECT count(*) FROM cic_landing.landing_page_sections`;
  const [formsCount] = await sql`SELECT count(*) FROM cic_landing.landing_forms`;
  const [revsCount] = await sql`SELECT count(*) FROM cic_landing.landing_content_revisions`;

  console.log('=== Seed Results ===');
  console.log(`- Section Types: ${typesCount.count}`);
  console.log(`- Sites: ${sitesCount.count}`);
  console.log(`- Pages: ${pagesCount.count}`);
  console.log(`- Sections: ${sectionsCount.count}`);
  console.log(`- Forms: ${formsCount.count}`);
  console.log(`- Revisions: ${revsCount.count}`);
  console.log('Accurate seeding completed successfully!');
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
}).finally(() => sql.end());
