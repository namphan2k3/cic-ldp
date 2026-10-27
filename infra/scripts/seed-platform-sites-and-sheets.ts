import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb } from '@cic/db';
import { syncSheetSourceById } from '@cic/sheets';
import { createSheetSourceBackup, createSiteContentBackup } from '@cic/sync-worker';

async function main() {
  const sql = getDb();
  console.log('=== [1/5] Seeding 8 sites into public.cic_sites ===');

  const siteDefinitions = [
    {
      code: 'cic',
      name: 'CIC Portal — Cổng thông tin chính (cic.com.vn)',
      site_type: 'portal',
      render_mode: 'sections',
      primary_domain: 'cic.com.vn',
      domains: ['www.cic.com.vn'],
      locales: ['vi', 'en'],
      settings: {
        hotline: '024 3976 1381',
        notify_emails: ['info@cic.com.vn', 'nampt@cic.com.vn'],
        seo_title: 'Công ty Cổ phần Công nghệ và Tư vấn CIC',
      },
    },
    {
      code: 'cms-intellicad',
      name: 'CMS IntelliCAD — Giải pháp CAD Bản quyền Vĩnh viễn',
      site_type: 'landing',
      render_mode: 'sections',
      primary_domain: 'cmsintellicad.vn',
      domains: ['www.cmsintellicad.vn', 'intellicad.cic.com.vn'],
      locales: ['vi', 'en'],
      settings: {
        hotline: '0988 123 456',
        notify_emails: ['nampt@cic.com.vn'],
        trial_download_url: 'https://intellicadms.com/download',
        lisp_download_url: '/sites/cms-intellicad/downloads/Lisp Intellicad.rar',
        primary_form_code: 'intellicad_consultation',
        seo_title: 'CMS IntelliCAD – Giải pháp CAD bản quyền tối ưu chi phí | CIC',
        seo_description:
          'CMS IntelliCAD tương thích DWG, LISP và quy trình AutoCAD. Đăng ký tư vấn và dùng thử miễn phí 30 ngày.',
      },
    },
    {
      code: 'robot-cong-trinh',
      name: 'Robot Công Trình — Giải pháp Robot Xây dựng & Hạ tầng CIC',
      site_type: 'landing',
      render_mode: 'sections',
      primary_domain: 'robotcongtrinh.vn',
      domains: ['www.robotcongtrinh.vn', 'robot.cic.com.vn'],
      locales: ['vi'],
      settings: {
        hotline: '036 575 6854',
        notify_emails: ['info@cic.com.vn', 'nampt@cic.com.vn'],
        primary_form_code: 'robot_consultation',
        seo_title: 'Robot công trình | CIC Technology',
        seo_description:
          'Khám phá các giải pháp robot xây dựng, kiểm tra dưới nước và vệ sinh cống ngầm do CIC phân phối.',
      },
    },
    {
      code: 'enjicad',
      name: 'enjiCAD — Phần mềm CAD cho kỹ sư Việt',
      site_type: 'landing',
      render_mode: 'static_html',
      primary_domain: 'enjicad.vn',
      domains: ['www.enjicad.vn'],
      locales: ['vi'],
      settings: {
        hotline: '024 3976 1381',
        notify_emails: ['nampt@cic.com.vn'],
        primary_form_code: 'enjicad_registration',
        seo_title: 'enjiCAD - Phần mềm CAD bản quyền trọn đời',
      },
    },
    {
      code: 'allplan',
      name: 'ALLPLAN — Giải pháp BIM cho Cầu đường & Kết cấu',
      site_type: 'landing',
      render_mode: 'static_html',
      primary_domain: 'allplan.cic.com.vn',
      domains: [],
      locales: ['vi'],
      settings: {
        hotline: '024 3976 1381',
        notify_emails: ['nampt@cic.com.vn'],
        primary_form_code: 'allplan_registration',
        seo_title: 'ALLPLAN — Giải pháp BIM toàn diện | CIC',
      },
    },
    {
      code: 'bim',
      name: 'Tư vấn BIM — Dịch vụ Tư vấn & Đào tạo BIM CIC',
      site_type: 'landing',
      render_mode: 'static_html',
      primary_domain: 'bim.cic.com.vn',
      domains: [],
      locales: ['vi'],
      settings: {
        hotline: '024 3976 1381',
        notify_emails: ['nampt@cic.com.vn'],
        primary_form_code: 'bim_registration',
        seo_title: 'Tư vấn BIM chuyên sâu | CIC Technology',
      },
    },
    {
      code: 'escon',
      name: 'ESCON — Phần mềm Dự toán Công trình',
      site_type: 'landing',
      render_mode: 'static_html',
      primary_domain: 'escon.cic.com.vn',
      domains: [],
      locales: ['vi'],
      settings: {
        hotline: '024 3976 1381',
        notify_emails: ['nampt@cic.com.vn'],
        primary_form_code: 'escon_registration',
        seo_title: 'Phần mềm Dự toán ESCON | CIC',
      },
    },
    {
      code: 'revit',
      name: 'Autodesk Revit — Giải pháp Thiết kế BIM',
      site_type: 'landing',
      render_mode: 'static_html',
      primary_domain: 'revit.cic.com.vn',
      domains: [],
      locales: ['vi'],
      settings: {
        hotline: '024 3976 1381',
        notify_emails: ['nampt@cic.com.vn'],
        primary_form_code: 'revit_registration',
        seo_title: 'Autodesk Revit chính hãng | CIC',
      },
    },
  ];

  const siteIdByCode = new Map<string, string>();

  for (const s of siteDefinitions) {
    const [row] = await sql<{ id: string }[]>`
      INSERT INTO public.cic_sites (
        code, name, site_type, render_mode, primary_domain, domains, locales, status, settings
      ) VALUES (
        ${s.code},
        ${s.name},
        ${s.site_type},
        ${s.render_mode},
        ${s.primary_domain},
        ${s.domains},
        ${s.locales},
        'active',
        ${sql.json(s.settings as never)}
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        site_type = EXCLUDED.site_type,
        render_mode = EXCLUDED.render_mode,
        primary_domain = EXCLUDED.primary_domain,
        domains = EXCLUDED.domains,
        locales = EXCLUDED.locales,
        settings = EXCLUDED.settings,
        updated_at = now()
      RETURNING id
    `;
    siteIdByCode.set(s.code, String(row.id));
    console.log(`  -> Site [${s.code}] id=${row.id}`);
  }

  console.log('=== [2/5] Migrating CMS sections for cms-intellicad & robot-cong-trinh ===');
  const migratedPath = path.resolve(
    process.cwd(),
    'infra/scripts/migrated-cms-content.json'
  );
  const migratedCms = JSON.parse(fs.readFileSync(migratedPath, 'utf8'));

  for (const [siteCode, localesObj] of Object.entries(migratedCms as Record<string, any>)) {
    const siteId = siteIdByCode.get(siteCode);
    if (!siteId) continue;

    for (const [locale, sectionsObj] of Object.entries(localesObj as Record<string, any>)) {
      const seoTitle = String(sectionsObj?.seo?.title || siteCode);
      const seoDesc = String(sectionsObj?.seo?.description || '');

      await sql.begin(async (tx) => {
        const [page] = await tx<{ id: string }[]>`
          INSERT INTO public.cic_content_pages (
            site_id, workspace, code, name, slug, page_type, template_key, system_defined
          ) VALUES (
            ${siteId},
            ${locale},
            'landing_home',
            ${`${siteCode} (${locale.toUpperCase()})`},
            '/',
            'home',
            ${`landing_${siteCode.replace(/-/g, '_')}`},
            true
          )
          ON CONFLICT (site_id, workspace, code) WHERE site_id IS NOT NULL
          DO UPDATE SET
            name = EXCLUDED.name,
            updated_at = now()
          RETURNING id
        `;

        const [rev] = await tx<{ id: string }[]>`
          INSERT INTO public.cic_content_page_revisions (
            page_id, version_number, state, seo_title, seo_description, published_at
          ) VALUES (
            ${page.id}, 1, 'published', ${seoTitle}, ${seoDesc}, now()
          )
          ON CONFLICT (page_id, version_number) DO UPDATE SET
            state = 'published',
            seo_title = EXCLUDED.seo_title,
            seo_description = EXCLUDED.seo_description,
            published_at = now()
          RETURNING id
        `;

        await tx`
          DELETE FROM public.cic_content_page_sections WHERE revision_id = ${rev.id}
        `;

        const entries = Object.entries(sectionsObj);
        for (let i = 0; i < entries.length; i++) {
          const [secKey, secConfig] = entries[i];
          const normalizedConfig =
            typeof secConfig === 'object' && secConfig !== null
              ? secConfig
              : { value: secConfig };

          await tx`
            INSERT INTO public.cic_content_page_sections (
              revision_id, section_key, section_type, position, config
            ) VALUES (
              ${rev.id},
              ${secKey},
              ${`${siteCode}.${secKey}`},
              ${i + 1},
              ${tx.json(normalizedConfig as never)}
            )
          `;
        }

        await tx`
          UPDATE public.cic_content_pages
          SET draft_revision_id = ${rev.id},
              published_revision_id = ${rev.id},
              updated_at = now()
          WHERE id = ${page.id}
        `;
      });

      console.log(
        `  -> Migrated ${Object.keys(sectionsObj).length} sections for ${siteCode} [${locale}]`
      );
    }
  }

  console.log('=== [3/5] Seeding Landing Forms & Google Sheets Destinations ===');
  const landingForms = [
    {
      siteCode: 'cms-intellicad',
      code: 'intellicad_consultation',
      title: 'Đăng ký Tư vấn, Tải bản Dùng thử & LISP CMS IntelliCAD',
      spreadsheetId: '1789qGEPsGXONe_1fDxzA8xYCJDmV-TsHuS5fCiI7GiI',
      sheetName: 'LADIPAGE',
    },
    {
      siteCode: 'robot-cong-trinh',
      code: 'robot_consultation',
      title: 'Đăng ký Tư vấn Giải pháp Robot Công Trình',
      spreadsheetId: '1izAJ8r7SeyicYJ2tNnCxXlSah-6meMlpYwQqvaU_A24',
      sheetName: 'Landing Page',
    },
    {
      siteCode: 'enjicad',
      code: 'enjicad_registration',
      title: 'Đăng ký Tư vấn & Báo giá enjiCAD',
      spreadsheetId: null,
      sheetName: null,
    },
    {
      siteCode: 'allplan',
      code: 'allplan_registration',
      title: 'Đăng ký Tư vấn Giải pháp ALLPLAN BIM',
      spreadsheetId: null,
      sheetName: null,
    },
    {
      siteCode: 'bim',
      code: 'bim_registration',
      title: 'Đăng ký Tư vấn & Đào tạo BIM CIC',
      spreadsheetId: null,
      sheetName: null,
    },
    {
      siteCode: 'escon',
      code: 'escon_registration',
      title: 'Đăng ký Phần mềm Dự toán ESCON',
      spreadsheetId: null,
      sheetName: null,
    },
    {
      siteCode: 'revit',
      code: 'revit_registration',
      title: 'Đăng ký Tư vấn Bản quyền Autodesk Revit',
      spreadsheetId: null,
      sheetName: null,
    },
  ];

  const defaultFields = [
    { key: 'full_name', label: 'Họ và tên', pos: 10, req: true },
    { key: 'phone', label: 'Số điện thoại', pos: 20, req: true },
    { key: 'email', label: 'Email', pos: 30, req: true },
    { key: 'company', label: 'Công ty / Đơn vị', pos: 40, req: false },
    { key: 'needs', label: 'Nhu cầu quan tâm', pos: 50, req: false },
    { key: 'message', label: 'Ghi chú thêm', pos: 60, req: false },
    { key: 'traffic_source', label: 'Nguồn truy cập', pos: 70, req: false },
  ];

  for (const lf of landingForms) {
    const siteId = siteIdByCode.get(lf.siteCode) || null;
    const [formRow] = await sql<{ id: string }[]>`
      INSERT INTO public.cic_forms (
        workspace, code, is_system, admin_name, title, status, current_version,
        submit_button_text, success_message, site_id
      ) VALUES (
        'vi',
        ${lf.code},
        false,
        ${lf.title},
        ${lf.title},
        'published',
        1,
        'Gửi thông tin',
        'Cảm ơn Quý khách! Bộ phận chuyên gia CIC đã nhận thông tin và sẽ liên hệ sớm nhất.',
        ${siteId}
      )
      ON CONFLICT (workspace, code) DO UPDATE SET
        site_id = EXCLUDED.site_id,
        title = EXCLUDED.title,
        status = 'published',
        updated_at = now()
      RETURNING id
    `;

    for (const df of defaultFields) {
      await sql`
        INSERT INTO public.cic_form_fields (
          form_id, field_key, field_type, label, is_required, is_locked, position
        ) VALUES (
          ${formRow.id}, ${df.key}, 'text', ${df.label}, ${df.req}, false, ${df.pos}
        )
        ON CONFLICT (form_id, field_key) DO NOTHING
      `;
    }

    if (lf.spreadsheetId && lf.sheetName) {
      const existingDest = await sql<{ id: string }[]>`
        SELECT id FROM public.cic_form_destinations
        WHERE form_id = ${formRow.id} AND destination_type = 'google_sheets' AND deleted_at IS NULL
        LIMIT 1
      `;
      if (existingDest.length === 0) {
        await sql`
          INSERT INTO public.cic_form_destinations (
            form_id, destination_type, name, is_enabled, config
          ) VALUES (
            ${formRow.id},
            'google_sheets',
            ${`Google Sheet: ${lf.sheetName}`},
            true,
            ${sql.json({
              spreadsheetId: lf.spreadsheetId,
              sheetName: lf.sheetName,
            } as never)}
          )
        `;
      }
    }
    console.log(`  -> Seeded form [${lf.code}] id=${formRow.id}`);
  }

  console.log('=== [4/5] Seeding & Pulling Live Google Sheets Sources ===');
  const sheetSourcesToOnboard = [
    {
      siteCode: 'cms-intellicad',
      code: 'intellicad_ladipage',
      name: 'CMS IntelliCAD — Khách đăng ký tư vấn & dùng thử (LADIPAGE)',
      spreadsheetId: '1789qGEPsGXONe_1fDxzA8xYCJDmV-TsHuS5fCiI7GiI',
      sheetName: 'LADIPAGE',
      headerRow: 2,
      keyColumns: ['thoi_gian_gui', 'so_dien_thoai'],
    },
    {
      siteCode: 'cms-intellicad',
      code: 'intellicad_lisp',
      name: 'CMS IntelliCAD — Khách tải bộ LISP (CMS INTELLICAD LISP)',
      spreadsheetId: '1789qGEPsGXONe_1fDxzA8xYCJDmV-TsHuS5fCiI7GiI',
      sheetName: 'CMS INTELLICAD LISP',
      headerRow: 2,
      keyColumns: ['thoi_gian_gui', 'so_dien_thoai'],
    },
    {
      siteCode: 'robot-cong-trinh',
      code: 'robot_landing_page',
      name: 'Robot Công Trình — Khách đăng ký tư vấn (Landing Page)',
      spreadsheetId: '1izAJ8r7SeyicYJ2tNnCxXlSah-6meMlpYwQqvaU_A24',
      sheetName: 'Landing Page',
      headerRow: 2,
      keyColumns: ['thoi_gian_gui', 'so_dien_thoai'],
    },
  ];

  const syncedSourceIds: string[] = [];

  for (const src of sheetSourcesToOnboard) {
    const siteId = siteIdByCode.get(src.siteCode) || null;
    const secret = crypto.randomBytes(16).toString('hex');

    const [sourceRow] = await sql<{ id: string }[]>`
      INSERT INTO public.cic_sheet_sources (
        site_id, code, name, spreadsheet_id, sheet_name, header_row, key_columns,
        sync_mode, interval_minutes, is_enabled, next_run_at, webhook_secret
      ) VALUES (
        ${siteId},
        ${src.code},
        ${src.name},
        ${src.spreadsheetId},
        ${src.sheetName},
        ${src.headerRow},
        ${src.keyColumns},
        'pull',
        5,
        true,
        now(),
        ${secret}
      )
      ON CONFLICT (spreadsheet_id, sheet_name) DO UPDATE SET
        site_id = EXCLUDED.site_id,
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        header_row = EXCLUDED.header_row,
        key_columns = EXCLUDED.key_columns,
        column_schema = '[]'::jsonb,
        is_enabled = true,
        deleted_at = NULL,
        updated_at = now()
      RETURNING id
    `;

    syncedSourceIds.push(String(sourceRow.id));
    const syncRes = await syncSheetSourceById(sourceRow.id, {
      trigger: 'manual',
      force: true,
    });
    console.log(
      `  -> Synced [${src.code}]: status=${syncRes.status}, read=${syncRes.rowsRead}, inserted=${syncRes.rowsInserted}, updated=${syncRes.rowsUpdated}${syncRes.errorMessage ? ` (error: ${syncRes.errorMessage})` : ''}`
    );
  }

  console.log('=== [5/5] Creating Initial Backups for Sheet Sources & Sites ===');
  for (const sourceId of syncedSourceIds) {
    const bk = await createSheetSourceBackup(sourceId, 'manual');
    console.log(`  -> Sheet backup #${bk.id}: ${bk.file_path} (${bk.status})`);
  }
  const intellicadSiteId = siteIdByCode.get('cms-intellicad');
  if (intellicadSiteId) {
    const siteBk = await createSiteContentBackup(intellicadSiteId, 'manual');
    console.log(`  -> Site content backup #${siteBk.id}: ${siteBk.file_path} (${siteBk.status})`);
  }

  console.log('=== ALL PLATFORM SITES, CMS SECTIONS, FORMS, AND GOOGLE SHEETS SEEDED & SYNCED ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
