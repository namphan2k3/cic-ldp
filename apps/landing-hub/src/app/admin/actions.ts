'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@cic/db';
import { pullLeadsFromGoogleSheets } from '@/lib/googleSheetsSync';

export async function syncGoogleSheetsLeadsAction(siteCode?: string) {
  const res = await pullLeadsFromGoogleSheets(siteCode);
  revalidatePath('/admin');
  if (siteCode) {
    revalidatePath(`/admin/${siteCode}`);
  }
  return {
    success: true,
    ...res,
  };
}

export async function saveMultipleSectionsPayloadAction(
  items: Array<{ sectionId: string; payload: Record<string, unknown> }>,
  isPublish: boolean = false
) {
  const sql = getDb();
  for (const item of items) {
    if (isPublish) {
      await sql`
        UPDATE cic_landing.landing_page_sections
        SET published_payload_json = ${sql.json(item.payload as never)},
            draft_payload_json = NULL,
            updated_at_utc = NOW()
        WHERE landing_page_section_id = ${item.sectionId}
      `;
    } else {
      await sql`
        UPDATE cic_landing.landing_page_sections
        SET draft_payload_json = ${sql.json(item.payload as never)},
            updated_at_utc = NOW()
        WHERE landing_page_section_id = ${item.sectionId}
      `;
    }
  }
  revalidatePath('/admin');
  revalidatePath('/admin/[siteCode]', 'page');
  revalidatePath('/s/[code]', 'page');
  return { success: true };
}

export async function updatePageSeoAction(
  pageId: string,
  seoTitle: string,
  seoDescription: string
) {
  const sql = getDb();
  const [page] = await sql<{ page_seo_json: Record<string, any> }[]>`
    SELECT page_seo_json FROM cic_landing.landing_pages
    WHERE landing_page_id = ${pageId}
  `;
  const nextSeo = {
    ...(page?.page_seo_json || {}),
    title: seoTitle,
    description: seoDescription,
  };
  await sql`
    UPDATE cic_landing.landing_pages
    SET page_title = ${seoTitle},
        page_seo_json = ${sql.json(nextSeo as never)},
        updated_at_utc = NOW()
    WHERE landing_page_id = ${pageId}
  `;
  revalidatePath('/admin');
  revalidatePath('/admin/[siteCode]', 'page');
  revalidatePath('/s/[code]', 'page');
  return { success: true };
}

export async function updateSiteConfigAction(
  siteId: string,
  input: {
    site_status?: 'active' | 'maintenance' | 'archived';
    primary_domain?: string;
    hotline?: string;
    email?: string;
    zalo_url?: string;
    ga4_id?: string;
    gtm_id?: string;
    fb_pixel_id?: string;
    zalo_pixel_id?: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    admin_username?: string;
    admin_password?: string;
  }
) {
  const sql = getDb();
  const [site] = await sql<
    {
      landing_site_code: string;
      landing_site_name: string;
      site_status: string;
      primary_domain: string;
      brand_config_json: Record<string, any>;
      seo_meta_json: Record<string, any>;
      tracking_config_json: Record<string, any>;
    }[]
  >`
    SELECT landing_site_code, landing_site_name, site_status, primary_domain, brand_config_json, seo_meta_json, tracking_config_json
    FROM cic_landing.landing_sites
    WHERE landing_site_id = ${siteId}
  `;
  if (!site) return { success: false };

  const nextStatus = input.site_status || site.site_status;
  const nextDomain = input.primary_domain ?? site.primary_domain;
  const nextBrand = {
    ...(site.brand_config_json || {}),
    ...(input.hotline !== undefined ? { hotline: input.hotline } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.zalo_url !== undefined ? { zalo_url: input.zalo_url } : {}),
  };
  const nextSeo = {
    ...(site.seo_meta_json || {}),
    ...(input.seo_title !== undefined ? { title: input.seo_title } : {}),
    ...(input.seo_description !== undefined ? { description: input.seo_description } : {}),
    ...(input.seo_keywords !== undefined ? { keywords: input.seo_keywords } : {}),
  };
  const nextTracking = {
    ...(site.tracking_config_json || {}),
    ...(input.ga4_id !== undefined ? { ga4_id: input.ga4_id } : {}),
    ...(input.gtm_id !== undefined ? { gtm_id: input.gtm_id } : {}),
    ...(input.fb_pixel_id !== undefined ? { fb_pixel_id: input.fb_pixel_id } : {}),
    ...(input.zalo_pixel_id !== undefined ? { zalo_pixel_id: input.zalo_pixel_id } : {}),
  };

  await sql`
    UPDATE cic_landing.landing_sites
    SET site_status = ${nextStatus},
        primary_domain = ${nextDomain},
        brand_config_json = ${sql.json(nextBrand as never)},
        seo_meta_json = ${sql.json(nextSeo as never)},
        tracking_config_json = ${sql.json(nextTracking as never)},
        updated_at_utc = NOW()
    WHERE landing_site_id = ${siteId}
  `;

  if (input.seo_title || input.seo_description) {
    await sql`
      UPDATE cic_landing.landing_pages
      SET page_title = COALESCE(NULLIF(${input.seo_title || ''}, ''), page_title),
          page_seo_json = page_seo_json || ${sql.json({
            ...(input.seo_title ? { title: input.seo_title } : {}),
            ...(input.seo_description ? { description: input.seo_description } : {}),
            ...(input.seo_keywords ? { keywords: input.seo_keywords } : {}),
          } as never)},
          updated_at_utc = NOW()
      WHERE landing_site_id = ${siteId}
        AND landing_page_locale = 'vi'
    `;
  }

  if (input.admin_username && input.admin_username.trim()) {
    const { upsertSiteAdminAccount } = await import('@/lib/adminAuth');
    await upsertSiteAdminAccount({
      siteCode: site.landing_site_code,
      siteName: site.landing_site_name,
      username: input.admin_username,
      newPassword: input.admin_password,
    });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/[siteCode]', 'page');
  revalidatePath('/s/[code]', 'page');
  return { success: true };
}

export async function createLandingSiteAction(input: {
  code: string;
  name: string;
  primary_domain: string;
  hotline?: string;
  ga4_id?: string;
  gtm_id?: string;
}) {
  const sql = getDb();
  const cleanCode = input.code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
  if (!cleanCode || !input.name.trim()) {
    return { success: false, error: 'Mã dự án và Tên dự án là bắt buộc.' };
  }

  const [existing] = await sql<{ landing_site_id: string }[]>`
    SELECT landing_site_id FROM cic_landing.landing_sites
    WHERE landing_site_code = ${cleanCode}
    LIMIT 1
  `;
  if (existing) {
    return { success: false, error: `Mã dự án "${cleanCode}" đã tồn tại trong cơ sở dữ liệu.` };
  }

  const [insertedSite] = await sql<{ landing_site_id: string }[]>`
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
      ${cleanCode},
      ${input.name.trim()},
      'landing',
      ${input.primary_domain.trim() || `${cleanCode}.cic.com.vn`},
      ${sql.json([`${cleanCode}.localhost`])},
      ${sql.json(['vi', 'en'])},
      'vi',
      'active',
      ${sql.json({
        logo_url: '/LOGO - 1990-08.png',
        hotline: input.hotline || '0988 026 858',
        email: 'info@cic.com.vn',
      })},
      ${sql.json({
        title: `${input.name.trim()} — Giải pháp chính hãng CIC`,
        description: `Trang thông tin sản phẩm & giải pháp ${input.name.trim()} phân phối bởi Công ty Cổ phần Công nghệ và Tư vấn CIC.`,
      })},
      ${sql.json({
        ga4_id: input.ga4_id || '',
        gtm_id: input.gtm_id || '',
      })}
    )
    RETURNING landing_site_id
  `;

  for (const locale of ['vi', 'en']) {
    const [insertedPage] = await sql<{ landing_page_id: string }[]>`
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
        ${insertedSite.landing_site_id},
        'home',
        ${locale},
        ${`${input.name.trim()} (${locale.toUpperCase()})`},
        'published',
        true,
        ${sql.json({
          title: `${input.name.trim()} — CIC Vietnam`,
          description: `Giải pháp ${input.name.trim()} chính hãng tại Việt Nam.`,
        })},
        NOW()
      )
      RETURNING landing_page_id
    `;

    await sql`
      INSERT INTO cic_landing.landing_page_sections (
        landing_page_id,
        landing_section_type_code,
        section_anchor_id,
        section_order,
        is_section_enabled,
        published_payload_json
      ) VALUES
      (${insertedPage.landing_page_id}, 'header', 'header', 1, true, ${sql.json({ brand_name: input.name.trim(), cta_label: 'Tư vấn ngay' })}),
      (${insertedPage.landing_page_id}, 'hero', 'hero', 2, true, ${sql.json({ title: input.name.trim(), subtitle: 'Giải pháp công nghệ chuyên ngành phân phối chính thức bởi CIC' })}),
      (${insertedPage.landing_page_id}, 'consultation', 'consultation', 3, true, ${sql.json({ title: 'Đăng ký nhận tư vấn & báo giá', hotline: input.hotline || '0988 026 858' })}),
      (${insertedPage.landing_page_id}, 'footer', 'footer', 4, true, ${sql.json({ company: 'Công ty Cổ phần Công nghệ và Tư vấn CIC' })})
    `;
  }

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
      ${insertedSite.landing_site_id},
      ${`${cleanCode}-lead-form`},
      ${`Form Đăng ký Tư vấn — ${input.name.trim()}`},
      ${sql.json([
        { name: 'full_name', label: 'Họ và tên', type: 'text', required: true },
        { name: 'phone', label: 'Số điện thoại', type: 'tel', required: true },
        { name: 'email', label: 'Email công việc', type: 'email', required: true },
        { name: 'company', label: 'Đơn vị / Công ty', type: 'text', required: false },
      ])},
      ${sql.json(['info@cic.com.vn'])},
      ${sql.json({ spreadsheet_id: '', sheet_name: 'LEADS' })},
      'message',
      ${sql.json({ message: 'Cảm ơn quý khách! Chuyên gia CIC sẽ liên hệ trong 24h.' })},
      true
    )
  `;

  revalidatePath('/admin');
  return { success: true, siteCode: cleanCode };
}

export async function publishPageRevisionsAction(pageId: string, summary: string = 'Xuất bản nội dung từ Visual Editor') {
  const sql = getDb();

  // 1. Promote all drafts to published and clear draft flag
  await sql`
    UPDATE cic_landing.landing_page_sections
    SET published_payload_json = COALESCE(draft_payload_json, published_payload_json),
        draft_payload_json = NULL,
        updated_at_utc = NOW()
    WHERE landing_page_id = ${pageId}
  `;

  // 2. Fetch current sections for revision snapshot
  const currentSections = await sql<
    {
      landing_section_type_code: string;
      section_anchor_id: string | null;
      section_order: number;
      published_payload_json: any;
    }[]
  >`
    SELECT landing_section_type_code, section_anchor_id, section_order, published_payload_json
    FROM cic_landing.landing_page_sections
    WHERE landing_page_id = ${pageId}
    ORDER BY section_order ASC
  `;

  // 3. Determine next revision number
  const [maxRev] = await sql<{ max_num: number | null }[]>`
    SELECT MAX(revision_number) as max_num
    FROM cic_landing.landing_content_revisions
    WHERE landing_page_id = ${pageId}
  `;

  const nextRevNum = (maxRev?.max_num || 0) + 1;

  // 4. Insert revision snapshot
  await sql`
    INSERT INTO cic_landing.landing_content_revisions (
      landing_page_id,
      revision_number,
      revision_snapshot_json,
      revision_summary,
      created_by
    ) VALUES (
      ${pageId},
      ${nextRevNum},
      ${sql.json({ sections: currentSections })},
      ${summary},
      'Admin Editor'
    )
  `;

  revalidatePath('/admin');
  revalidatePath('/s/[code]', 'page');
  return { success: true, revision: nextRevNum };
}

export async function updateFormSchemaAction(formData: FormData) {
  const sql = getDb();
  const formId = String(formData.get('form_id'));
  const fieldsRaw = String(formData.get('fields_schema_json') || '[]');
  const sheetConfigRaw = String(formData.get('sheet_config_json') || '{}');
  const successPayloadRaw = formData.get('success_payload_json');

  const fields = JSON.parse(fieldsRaw);
  const sheetConfig = JSON.parse(sheetConfigRaw);

  if (successPayloadRaw) {
    const successPayload = JSON.parse(String(successPayloadRaw));
    await sql`
      UPDATE cic_landing.landing_forms
      SET fields_schema_json = ${sql.json(fields as never)},
          google_sheet_config_json = ${sql.json(sheetConfig as never)},
          success_payload_json = ${sql.json(successPayload as never)},
          updated_at_utc = NOW()
      WHERE landing_form_id = ${formId}
    `;
  } else {
    await sql`
      UPDATE cic_landing.landing_forms
      SET fields_schema_json = ${sql.json(fields as never)},
          google_sheet_config_json = ${sql.json(sheetConfig as never)},
          updated_at_utc = NOW()
      WHERE landing_form_id = ${formId}
    `;
  }

  revalidatePath('/admin');
  revalidatePath('/admin/[siteCode]', 'page');
  revalidatePath('/s/[code]', 'page');
}

export async function rollbackRevisionAction(formData: FormData) {
  const sql = getDb();
  const pageId = String(formData.get('page_id'));
  const revisionNumber = Number(formData.get('revision_number'));

  const [rev] = await sql<{ revision_snapshot_json: any }[]>`
    SELECT revision_snapshot_json
    FROM cic_landing.landing_content_revisions
    WHERE landing_page_id = ${pageId}
      AND revision_number = ${revisionNumber}
  `;

  if (!rev || !rev.revision_snapshot_json?.sections) {
    throw new Error('Không tìm thấy snapshot revision.');
  }

  const sections = rev.revision_snapshot_json.sections as Array<any>;

  await sql.begin(async (tx) => {
    await tx`DELETE FROM cic_landing.landing_page_sections WHERE landing_page_id = ${pageId}`;

    for (const sec of sections) {
      await tx`
        INSERT INTO cic_landing.landing_page_sections (
          landing_page_id,
          landing_section_type_code,
          section_anchor_id,
          section_order,
          is_section_enabled,
          published_payload_json,
          draft_payload_json
        ) VALUES (
          ${pageId},
          ${sec.code || sec.landing_section_type_code},
          ${sec.anchor || sec.section_anchor_id},
          ${sec.order !== undefined ? sec.order : sec.section_order},
          true,
          ${tx.json(sec.payload || sec.published_payload_json || {})},
          ${tx.json(sec.payload || sec.published_payload_json || {})}
        )
      `;
    }
  });

  revalidatePath('/admin');
  revalidatePath('/s/[code]', 'page');
}

export async function exportDeployPackageAction(
  targetSiteCode?: string,
  customDestDir?: string
) {
  const { exportDeployFolder } = await import('@/lib/deployExporter');
  const summary = await exportDeployFolder(targetSiteCode, customDestDir);
  return {
    success: true,
    ...summary,
  };
}

export async function pickFolderDialogAction(): Promise<{ path: string | null }> {
  if (process.platform !== 'win32') {
    return { path: null };
  }
  try {
    const { execFileSync } = await import('node:child_process');
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms
      $f = New-Object System.Windows.Forms.FolderBrowserDialog
      $f.Description = 'Chọn thư mục lưu gói triển khai (Deploy Package)'
      $f.ShowNewFolderButton = $true
      $top = New-Object System.Windows.Forms.Form
      $top.TopMost = $true
      $res = $f.ShowDialog($top)
      if ($res -eq [System.Windows.Forms.DialogResult]::OK) {
        [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
        Write-Output $f.SelectedPath
      }
    `;
    const out = execFileSync(
      'powershell.exe',
      ['-NoProfile', '-STA', '-Command', psScript],
      { encoding: 'utf8', timeout: 120000 }
    ).trim();
    return { path: out || null };
  } catch {
    return { path: null };
  }
}

export async function loginAdminAction(username: string, password: string) {
  const { cookies, headers } = await import('next/headers');
  const { checkRateLimit } = await import('@/lib/security');
  const {
    authenticateAdminUser,
    createSessionToken,
    getAdminCookieName,
    ADMIN_COOKIE_NAME,
  } = await import('@/lib/adminAuth');

  const reqHeaders = await headers();
  const ip =
    reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    reqHeaders.get('x-real-ip') ||
    '127.0.0.1';
  const rate = checkRateLimit(`admin_login:${ip}:${username.trim().toLowerCase()}`, 8, 10 * 60 * 1000);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Tài khoản tạm khóa đăng nhập do nhập sai nhiều lần. Vui lòng thử lại sau ${rate.retryAfterSeconds} giây.`,
    };
  }

  const instanceSiteCode = process.env.DEFAULT_SITE_CODE?.trim() || null;
  const res = await authenticateAdminUser(username, password, instanceSiteCode);
  if (!res.success || !res.session) {
    return { success: false, error: res.error || 'Đăng nhập thất bại.' };
  }

  const token = createSessionToken(res.session);
  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  };

  cookieStore.set(getAdminCookieName(instanceSiteCode), token, cookieOpts);
  if (!instanceSiteCode) {
    if (res.session.allowedSiteCode) {
      cookieStore.set(getAdminCookieName(res.session.allowedSiteCode), token, cookieOpts);
    }
    cookieStore.set(ADMIN_COOKIE_NAME, token, cookieOpts);
  }

  revalidatePath('/admin');
  return {
    success: true,
    role: res.session.role,
    allowedSiteCode: res.session.allowedSiteCode,
  };
}

export async function logoutAdminAction() {
  const { cookies } = await import('next/headers');
  const { getAdminCookieName, ADMIN_COOKIE_NAME } = await import('@/lib/adminAuth');
  const cookieStore = await cookies();
  cookieStore.delete(getAdminCookieName());
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete('cic_landing_session_cms-intellicad');
  cookieStore.delete('cic_landing_session_robot-cong-trinh');
  revalidatePath('/admin');
  return { success: true };
}



