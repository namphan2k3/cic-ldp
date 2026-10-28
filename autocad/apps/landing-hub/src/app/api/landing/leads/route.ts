import { NextRequest, NextResponse } from 'next/server';
import {
  getLandingSiteByCode,
  getLandingFormByCode,
  insertLandingLead,
  insertLeadDelivery,
} from '@cic/db';
import { pushLeadToGoogleSheet } from '@/lib/googleSheetsSync';
import {
  checkRateLimit,
  validateAndSanitizeLeadFields,
  sanitizeText,
  type SchemaFieldDef,
} from '@/lib/security';
import { resolveFormOutcome, type FormOutcomeRule } from '@/lib/formWorkflow';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Rate limit: max 8 lead submissions per IP within 5 minutes
    const rateCheck = checkRateLimit(`lead_submit:${ip}`, 8, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Quý khách thao tác quá nhanh. Vui lòng thử lại sau ${rateCheck.retryAfterSeconds} giây.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { site_code, form_code, fields: rawFields } = body;

    if (!site_code || !form_code || !rawFields) {
      return NextResponse.json(
        { error: 'Thiếu thông tin site_code, form_code hoặc fields' },
        { status: 400 }
      );
    }

    const cleanSiteCode = sanitizeText(site_code, 64);
    const cleanFormCode = sanitizeText(form_code, 64);

    const site = await getLandingSiteByCode(cleanSiteCode);
    if (!site) {
      return NextResponse.json(
        { error: `Không tìm thấy landing site: ${cleanSiteCode}` },
        { status: 404 }
      );
    }

    const form = await getLandingFormByCode(site.landing_site_id, cleanFormCode);
    if (!form) {
      return NextResponse.json(
        { error: `Không tìm thấy form: ${cleanFormCode}` },
        { status: 404 }
      );
    }

    const schema = (form.fields_schema_json || []) as SchemaFieldDef[];
    const validation = validateAndSanitizeLeadFields(rawFields, schema);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const fields = validation.sanitizedFields;
    const userAgent = sanitizeText(request.headers.get('user-agent') || '', 300);
    const referrer = sanitizeText(request.headers.get('referer') || '', 300);

    const lead = await insertLandingLead({
      landing_form_id: form.landing_form_id,
      landing_site_id: site.landing_site_id,
      customer_full_name: fields.name || fields.full_name || null,
      customer_phone: fields.phone || null,
      customer_email: fields.email || fields.work_email || null,
      customer_company: fields.company || null,
      submitted_fields_json: fields,
      ip_address: ip,
      user_agent: userAgent,
      referrer_url: referrer,
      utm_source: fields.utm_source || null,
      utm_medium: fields.utm_medium || null,
      utm_campaign: fields.utm_campaign || null,
    });

    const outcomeRules = (form.success_payload_json?.outcome_rules || []) as FormOutcomeRule[];
    const outcome = resolveFormOutcome(outcomeRules, form.success_payload_json, fields);

    const spreadsheetId = form.google_sheet_config_json?.spreadsheet_id || '';
    const defaultSheetName =
      outcome.targetSheetName || form.google_sheet_config_json?.sheet_name || 'LADIPAGE';
    const conditionalMap = form.google_sheet_config_json?.sheet_name_conditional_map;

    let deliveryStatus: 'success' | 'failed' = 'success';
    let responseBody = '';
    let errorMessage: string | null = null;
    let syncedSheet = defaultSheetName;

    if (spreadsheetId && !spreadsheetId.startsWith('16E6Z')) {
      try {
        const pushRes = await pushLeadToGoogleSheet({
          siteCode: site.landing_site_code,
          spreadsheetId,
          sheetName: defaultSheetName,
          conditionalMap,
          fields,
        });
        syncedSheet = pushRes.syncedSheet;
        responseBody = JSON.stringify({
          ok: true,
          synced_to_sheet: pushRes.syncedSheet,
          updated_range: pushRes.updatedRange,
        });
      } catch (sheetErr: any) {
        deliveryStatus = 'failed';
        errorMessage = sheetErr?.message || 'Google Sheets append failed';
        responseBody = JSON.stringify({ ok: false, error: errorMessage });
      }
    } else {
      responseBody = JSON.stringify({ ok: true, mode: 'db_only' });
    }

    await insertLeadDelivery({
      landing_lead_submission_id: lead.landing_lead_submission_id,
      delivery_channel: 'google_sheets',
      delivery_status: deliveryStatus,
      delivery_payload_json: {
        spreadsheet_id: spreadsheetId,
        sheet_name: syncedSheet,
        fields,
      },
      response_body: responseBody,
      error_message: errorMessage,
    });

    const primaryNeed = fields.primary_need;
    const isTrial = primaryNeed === 'trial_30_days';
    const isLisp = primaryNeed === 'receive_lisp';

    return NextResponse.json({
      success: true,
      submission_id: lead.landing_lead_submission_id,
      action: outcome.actionType === 'download_modal' ? 'download_modal' : 'message_only',
      outcome_type: outcome.actionType,
      title: outcome.title,
      message: outcome.message,
      download_url: outcome.downloadUrl,
      download_label: outcome.downloadLabel,
      trial_download: isTrial,
      lisp_download: isLisp,
      download_type: isTrial ? 'trial' : isLisp ? 'lisp' : null,
      payload: form.success_payload_json,
    });
  } catch (err: any) {
    console.error('[API /landing/leads] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi xử lý gửi form' },
      { status: 500 }
    );
  }
}
