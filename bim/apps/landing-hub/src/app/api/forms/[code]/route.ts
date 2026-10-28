import { NextRequest, NextResponse } from 'next/server';
import { getDb, logPlatformActivity, type CicSiteRow } from '@cic/db';
import { processPendingFormDeliveries } from '@cic/sync-worker';

const recentSubmissionFingerprints = new Map<string, number>();

function resolveTrafficSource(
  payload: Record<string, unknown>,
  referer: string | null
): string {
  const utmSource = String(payload.utm_source || '').trim();
  const utmMedium = String(payload.utm_medium || '').trim();
  const utmCampaign = String(payload.utm_campaign || '').trim();
  const fbclid = String(payload.fbclid || '').trim();
  const gclid = String(payload.gclid || '').trim();

  if (utmSource) {
    const parts = [utmSource];
    if (utmMedium) parts.push(utmMedium);
    if (utmCampaign) parts.push(utmCampaign);
    return `UTM: ${parts.join(' / ')}`;
  }
  if (fbclid) return 'Facebook Ads (fbclid)';
  if (gclid) return 'Google Ads (gclid)';
  if (referer) {
    try {
      const u = new URL(referer);
      return `Web (${u.hostname}${u.pathname})`;
    } catch {
      return referer.slice(0, 120);
    }
  }
  return 'Direct';
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const sql = getDb();

  let body: Record<string, unknown> = {};
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  } else {
    const fd = await request.formData().catch(() => null);
    if (fd) {
      fd.forEach((value, key) => {
        if (typeof value === 'string') {
          if (body[key]) {
            body[key] = `${body[key]}, ${value}`;
          } else {
            body[key] = value;
          }
        }
      });
    }
  }

  // 1. Honeypot protection (matches Laravel ConsultationController `website` field)
  if (body.website && String(body.website).trim() !== '') {
    return NextResponse.json({
      ok: true,
      message: 'Cảm ơn quý khách đã gửi thông tin!',
    });
  }

  // 2. Normalize standard fields + keep any dynamic fields submitted by the landing form
  const fullName = String(
    body.full_name || body.fullname || body.name || body.ho_va_ten || ''
  ).trim();
  const phone = String(
    body.phone || body.telephone || body.so_dien_thoai || body.tel || ''
  ).trim();
  const email = String(body.email || '').trim();
  const company = String(body.company || body.organization || body.don_vi || '').trim();
  const jobTitle = String(body.job_title || body.position || body.chuc_vu || '').trim();
  const needs = String(body.needs || body.interest || body.nhu_cau || '').trim();
  const message = String(body.message || body.note || body.ghi_chu || '').trim();

  if (!fullName && !phone && !email) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Vui lòng nhập ít nhất Họ tên, Số điện thoại hoặc Email.',
      },
      { status: 422 }
    );
  }

  // 3. 20-second duplicate submission guard (matching Laravel Cache::add 20s)
  const fingerprint = `${code}:${phone.toLowerCase()}:${email.toLowerCase()}`;
  const nowMs = Date.now();
  const lastSubmittedMs = recentSubmissionFingerprints.get(fingerprint);
  if (lastSubmittedMs && nowMs - lastSubmittedMs < 20_000) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Bạn vừa gửi thông tin. Vui lòng đợi 20 giây trước khi gửi lại.',
      },
      { status: 429 }
    );
  }
  recentSubmissionFingerprints.set(fingerprint, nowMs);

  const referer = request.headers.get('referer');
  const trafficSource = resolveTrafficSource(body, referer);

  // 4. Locate form in cic_forms (or auto-bootstrap if a static landing submits for the first time)
  let [form] = await sql<
    {
      id: string;
      code: string;
      title: string;
      current_version: number;
      success_message: string;
      site_id: string | null;
    }[]
  >`
    SELECT id, code, title, current_version, success_message, site_id
    FROM public.cic_forms
    WHERE code = ${code} AND deleted_at IS NULL
    LIMIT 1
  `;

  if (!form) {
    const inferredSiteCode = code.replace(/_(consultation|registration|form)$/, '');
    const [site] = await sql<CicSiteRow[]>`
      SELECT * FROM public.cic_sites WHERE code = ${inferredSiteCode} LIMIT 1
    `;
    const [createdForm] = await sql<
      {
        id: string;
        code: string;
        title: string;
        current_version: number;
        success_message: string;
        site_id: string | null;
      }[]
    >`
      INSERT INTO public.cic_forms (
        workspace, code, is_system, admin_name, title, status, current_version,
        submit_button_text, success_message, site_id
      ) VALUES (
        'vi',
        ${code},
        false,
        ${`Biểu mẫu ${site?.name || code}`},
        ${`Đăng ký tư vấn ${site?.name || code}`},
        'published',
        1,
        'Gửi thông tin',
        'Cảm ơn Quý khách! Bộ phận kỹ thuật CIC sẽ liên hệ trong thời gian sớm nhất.',
        ${site ? site.id : null}
      )
      ON CONFLICT (workspace, code) DO UPDATE SET updated_at = now()
      RETURNING id, code, title, current_version, success_message, site_id
    `;
    form = createdForm;
  }

  // Build normalized key-value list to persist in cic_form_submission_values
  const fieldEntries: Array<{ key: string; label: string; value: string }> = [];
  if (fullName) fieldEntries.push({ key: 'full_name', label: 'Họ và tên', value: fullName });
  if (phone) fieldEntries.push({ key: 'phone', label: 'Số điện thoại', value: phone });
  if (email) fieldEntries.push({ key: 'email', label: 'Email', value: email });
  if (company) fieldEntries.push({ key: 'company', label: 'Công ty / Đơn vị', value: company });
  if (jobTitle) fieldEntries.push({ key: 'job_title', label: 'Chức vụ', value: jobTitle });
  if (needs) fieldEntries.push({ key: 'needs', label: 'Nhu cầu quan tâm', value: needs });
  if (message) fieldEntries.push({ key: 'message', label: 'Ghi chú / Lời nhắn', value: message });
  fieldEntries.push({ key: 'traffic_source', label: 'Nguồn truy cập', value: trafficSource });

  // Also capture any custom extra fields sent by a static landing form
  const reservedKeys = new Set([
    'full_name',
    'fullname',
    'name',
    'ho_va_ten',
    'phone',
    'telephone',
    'so_dien_thoai',
    'tel',
    'email',
    'company',
    'organization',
    'don_vi',
    'job_title',
    'position',
    'chuc_vu',
    'needs',
    'interest',
    'nhu_cau',
    'message',
    'note',
    'ghi_chu',
    'website',
    '_token',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid',
  ]);

  for (const [k, v] of Object.entries(body)) {
    if (!reservedKeys.has(k) && v !== null && v !== undefined && String(v).trim() !== '') {
      const safeKey = k
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60);
      if (safeKey && !fieldEntries.some((f) => f.key === safeKey)) {
        fieldEntries.push({
          key: safeKey,
          label: k,
          value: String(v).trim(),
        });
      }
    }
  }

  let submissionId = '';

  await sql.begin(async (tx) => {
    const [sub] = await tx<{ id: string }[]>`
      INSERT INTO public.cic_form_submissions (
        form_id, form_version, source_type, source_id, source_path, submitted_at
      ) VALUES (
        ${form.id},
        ${form.current_version || 1},
        'landing_site',
        ${form.site_id},
        ${referer || ''},
        now()
      )
      RETURNING id
    `;
    submissionId = String(sub.id);

    const existingFields = await tx<{ id: string; field_key: string; position: number }[]>`
      SELECT id, field_key, position
      FROM public.cic_form_fields
      WHERE form_id = ${form.id}
      ORDER BY position ASC
    `;
    const fieldByKey = new Map(existingFields.map((f) => [f.field_key, f.id]));
    let maxPos = existingFields.reduce((m, f) => Math.max(m, Number(f.position || 0)), 0);

    for (const entry of fieldEntries) {
      let fieldId = fieldByKey.get(entry.key);
      if (!fieldId) {
        maxPos += 10;
        const [newField] = await tx<{ id: string }[]>`
          INSERT INTO public.cic_form_fields (
            form_id, field_key, field_type, label, is_required, is_locked, position
          ) VALUES (
            ${form.id},
            ${entry.key},
            'text',
            ${entry.label},
            false,
            false,
            ${maxPos}
          )
          ON CONFLICT (form_id, field_key) DO UPDATE SET label = EXCLUDED.label
          RETURNING id
        `;
        fieldId = newField.id;
        fieldByKey.set(entry.key, fieldId);
      }

      await tx`
        INSERT INTO public.cic_form_submission_values (
          submission_id, field_id, field_key, value_text
        ) VALUES (
          ${submissionId},
          ${fieldId},
          ${entry.key},
          ${entry.value}
        )
        ON CONFLICT (submission_id, field_id) DO UPDATE SET
          value_text = EXCLUDED.value_text
      `;
    }

    // Queue pending deliveries for all enabled destinations of this form
    const destinations = await tx<{ id: string; destination_type: string }[]>`
      SELECT id, destination_type
      FROM public.cic_form_destinations
      WHERE form_id = ${form.id} AND is_enabled = true AND deleted_at IS NULL
    `;

    for (const dest of destinations) {
      await tx`
        INSERT INTO public.cic_form_submission_deliveries (
          submission_id, destination_id, destination_type, status, idempotency_key
        ) VALUES (
          ${submissionId},
          ${dest.id},
          ${dest.destination_type},
          'pending',
          ${`${submissionId}:${dest.id}`}
        )
        ON CONFLICT (submission_id, destination_id) DO NOTHING
      `;
    }
  });

  // Trigger delivery worker asynchronously (non-blocking)
  processPendingFormDeliveries(5).catch((err) =>
    console.warn('[landing-hub] Async delivery dispatch warning:', err)
  );

  // Check if site has trial_download_url or lisp_download_url for IntelliCAD download flows
  let downloadUrl: string | null = null;
  if (form.site_id) {
    const [siteRow] = await sql<CicSiteRow[]>`
      SELECT * FROM public.cic_sites WHERE id = ${form.site_id} LIMIT 1
    `;
    if (siteRow?.settings) {
      if (needs.includes('lisp') && siteRow.settings.lisp_download_url) {
        downloadUrl = String(siteRow.settings.lisp_download_url);
      } else if (
        (needs.includes('trial') || needs.includes('dung_thu') || needs.includes('download')) &&
        siteRow.settings.trial_download_url
      ) {
        downloadUrl = String(siteRow.settings.trial_download_url);
      }
    }
  }

  await logPlatformActivity({
    actorLabel: fullName || phone || email || 'Visitor',
    actionCode: 'landing_form.submit',
    category: 'forms',
    entityType: 'cic_form_submissions',
    entityId: submissionId,
    entityTitle: `${form.title} (${fullName || phone})`,
    module: 'forms',
    result: 'success',
    resultMessage: `Khách gửi form ${form.code}: ${fullName} - ${phone} (${trafficSource})`,
    sourceApp: 'landing-hub',
  });

  return NextResponse.json({
    ok: true,
    submission_id: submissionId,
    message:
      form.success_message ||
      'Cảm ơn Quý khách! Bộ phận chuyên gia CIC sẽ liên hệ tư vấn trong thời gian sớm nhất.',
    download_url: downloadUrl,
  });
}
