import nodemailer from 'nodemailer';
import { getDb } from '@cic/db';
import { appendGoogleSheetRowValues } from '@cic/sheets';

interface PendingDeliveryRow {
  id: string;
  submission_id: string;
  destination_id: string;
  destination_type: string;
  attempt_count: number;
  dest_name: string;
  dest_config: Record<string, any>;
  form_id: string;
  form_code: string;
  form_title: string;
  source_path: string | null;
  submitted_at: Date;
}

export async function processPendingFormDeliveries(limit = 25): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const sql = getDb();

  const deliveries = await sql<PendingDeliveryRow[]>`
    SELECT
      d.id,
      d.submission_id,
      d.destination_id,
      d.destination_type,
      d.attempt_count,
      dest.name AS dest_name,
      dest.config AS dest_config,
      f.id AS form_id,
      f.code AS form_code,
      f.title AS form_title,
      s.source_path,
      s.submitted_at
    FROM public.cic_form_submission_deliveries d
    JOIN public.cic_form_destinations dest ON dest.id = d.destination_id
    JOIN public.cic_form_submissions s ON s.id = d.submission_id
    JOIN public.cic_forms f ON f.id = s.form_id
    WHERE d.status IN ('pending', 'failed')
      AND d.attempt_count < 5
      AND dest.is_enabled = true
    ORDER BY d.created_at ASC
    LIMIT ${limit}
  `;

  let succeeded = 0;
  let failed = 0;

  for (const item of deliveries) {
    try {
      const valueRows = await sql<{
        field_key: string;
        field_label: string;
        value_text: string | null;
        value_json: unknown;
      }[]>`
        SELECT v.field_key, COALESCE(ff.label, v.field_key) AS field_label, v.value_text, v.value_json
        FROM public.cic_form_submission_values v
        LEFT JOIN public.cic_form_fields ff ON ff.id = v.field_id
        WHERE v.submission_id = ${item.submission_id}
        ORDER BY v.id ASC
      `;

      const fieldMap: Record<string, { label: string; value: string }> = {};
      for (const v of valueRows) {
        fieldMap[v.field_key] = {
          label: v.field_label || v.field_key,
          value: v.value_text ?? (v.value_json ? JSON.stringify(v.value_json) : ''),
        };
      }

      if (item.destination_type === 'google_sheets') {
        const cfg = item.dest_config || {};
        const spreadsheetId = cfg.spreadsheetId || cfg.spreadsheet_id;
        const sheetName = cfg.sheetName || cfg.sheet_name || 'Sheet1';
        if (!spreadsheetId) {
          throw new Error('Thiếu spreadsheetId trong cấu hình đích Google Sheets');
        }

        const rowValues: unknown[] = [];
        const submittedStr = new Date(item.submitted_at).toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
        });

        if (Array.isArray(cfg.columnMapping) && cfg.columnMapping.length > 0) {
          for (const col of cfg.columnMapping) {
            if (col.sourceType === 'system') {
              if (col.sourceKey === 'submitted_at') rowValues.push(submittedStr);
              else if (col.sourceKey === 'submission_id') rowValues.push(item.submission_id);
              else if (col.sourceKey === 'source_path') rowValues.push(item.source_path || '');
              else if (col.sourceKey === 'form_title') rowValues.push(item.form_title);
              else rowValues.push('');
            } else {
              rowValues.push(fieldMap[col.sourceKey]?.value ?? '');
            }
          }
        } else {
          rowValues.push(submittedStr);
          for (const f of Object.values(fieldMap)) {
            rowValues.push(f.value);
          }
          rowValues.push(item.source_path || '');
        }

        const appendRes = await appendGoogleSheetRowValues(spreadsheetId, sheetName, rowValues);

        await sql`
          UPDATE public.cic_form_submission_deliveries
          SET status = 'success',
              attempt_count = attempt_count + 1,
              last_attempt_at = now(),
              delivered_at = now(),
              response_metadata = ${sql.json({
                spreadsheetId,
                sheetName,
                updatedRange: appendRes.updatedRange ?? null,
              } as never)},
              updated_at = now()
          WHERE id = ${item.id}
        `;
        succeeded++;
      } else if (item.destination_type === 'email') {
        const cfg = item.dest_config || {};
        const recipients: string[] = Array.isArray(cfg.recipients)
          ? cfg.recipients
          : typeof cfg.to === 'string'
            ? [cfg.to]
            : [process.env.ADMIN_NOTIFICATION_EMAIL || 'nampt@cic.com.vn'];

        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (smtpHost && smtpUser && smtpPass) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: smtpUser, pass: smtpPass },
          });

          const rowsHtml = Object.values(fieldMap)
            .map(
              (f) =>
                `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600">${f.label}</td><td style="padding:6px 12px;border:1px solid #e2e8f0">${f.value}</td></tr>`
            )
            .join('');

          await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'CIC Platform'}" <${process.env.MAIL_FROM_ADDRESS || smtpUser}>`,
            to: recipients.join(', '),
            subject: `[${item.form_title}] Đăng ký mới (#${item.submission_id})`,
            html: `<h3>Thông tin đăng ký từ ${item.form_title}</h3><table style="border-collapse:collapse;width:100%">${rowsHtml}</table>`,
          });
        }

        await sql`
          UPDATE public.cic_form_submission_deliveries
          SET status = 'success',
              attempt_count = attempt_count + 1,
              last_attempt_at = now(),
              delivered_at = now(),
              updated_at = now()
          WHERE id = ${item.id}
        `;
        succeeded++;
      } else {
        await sql`
          UPDATE public.cic_form_submission_deliveries
          SET status = 'success',
              attempt_count = attempt_count + 1,
              last_attempt_at = now(),
              updated_at = now()
          WHERE id = ${item.id}
        `;
      }
    } catch (err: any) {
      failed++;
      await sql`
        UPDATE public.cic_form_submission_deliveries
        SET status = 'failed',
            attempt_count = attempt_count + 1,
            last_attempt_at = now(),
            last_error = ${err?.message || 'Delivery error'},
            updated_at = now()
        WHERE id = ${item.id}
      `;
    }
  }

  return {
    processed: deliveries.length,
    succeeded,
    failed,
  };
}
