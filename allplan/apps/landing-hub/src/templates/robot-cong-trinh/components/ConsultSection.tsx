'use client';

import React, { useState } from 'react';
import type { RobotFormPayload } from '../types';
import {
  validatePhone,
  validateEmail,
  containsMaliciousPayload,
  sanitizeSafeHtml,
  type SchemaFieldDef,
} from '@/lib/security';
import { isFieldVisible } from '@/lib/formWorkflow';

interface ConsultSectionProps {
  payload: RobotFormPayload;
  formConfig?: {
    form_code?: string;
    fields_schema_json?: SchemaFieldDef[];
    success_payload_json?: Record<string, any>;
  };
}

const DEFAULT_ROBOT_NEED_OPTIONS = [
  { label: 'Hoàn thiện sàn bê tông', value: 'Hoàn thiện sàn bê tông' },
  { label: 'Phun bả và xả nhám', value: 'Phun bả và xả nhám' },
  { label: 'Lát gạch nền', value: 'Lát gạch nền' },
  { label: 'Đo lường hiện trường', value: 'Đo lường hiện trường' },
  { label: 'Kiểm tra dưới nước', value: 'Kiểm tra dưới nước' },
  { label: 'Vệ sinh cống ngầm', value: 'Vệ sinh cống ngầm' },
  { label: 'Cần CIC tư vấn lựa chọn', value: 'Cần CIC tư vấn lựa chọn' },
];

const BUILTIN_ROBOT_FIELDS = new Set([
  'name',
  'full_name',
  'phone',
  'email',
  'work_email',
  'company',
  'primary_need',
  'robot_needs',
  'requirements',
  'notes',
  'message',
]);

export function ConsultSection({ payload, formConfig }: ConsultSectionProps) {
  const schemaFields = (formConfig?.fields_schema_json || []) as SchemaFieldDef[];
  const findField = (...names: string[]) =>
    schemaFields.find((f) => names.includes(f.name));

  const nameField = findField('full_name', 'name');
  const phoneField = findField('phone');
  const emailField = findField('work_email', 'email');
  const companyField = findField('company');
  const needField = findField('primary_need', 'robot_needs');
  const notesField = findField('requirements', 'notes', 'message');

  const needOptions =
    needField?.options && needField.options.length > 0
      ? needField.options
      : DEFAULT_ROBOT_NEED_OPTIONS;

  const customFields = schemaFields.filter(
    (f) => !BUILTIN_ROBOT_FIELDS.has(f.name)
  );

  const [formData, setFormData] = useState<Record<string, any>>({
    full_name: '',
    phone: '',
    work_email: '',
    company: '',
    primary_need: '',
    requirements: '',
    website: '', // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    title?: string;
    text: string;
    downloadUrl?: string | null;
    downloadLabel?: string | null;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return; // bot honeypot

    for (const val of Object.values(formData)) {
      if (containsMaliciousPayload(val)) {
        setStatusMessage({
          type: 'error',
          text: 'Phát hiện ký tự hoặc mã lệnh không hợp lệ. Vui lòng kiểm tra lại.',
        });
        return;
      }
    }

    if (!formData.full_name?.trim() || formData.full_name.trim().length < 2) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập Họ và tên hợp lệ (tối thiểu 2 ký tự).',
      });
      return;
    }

    if (!formData.phone?.trim() || !validatePhone(formData.phone)) {
      setStatusMessage({
        type: 'error',
        text: 'Số điện thoại không đúng định dạng (VD: 0912 345 678).',
      });
      return;
    }

    if (!formData.work_email?.trim() || !validateEmail(formData.work_email)) {
      setStatusMessage({
        type: 'error',
        text: 'Địa chỉ Email không đúng định dạng (VD: ban@congty.vn).',
      });
      return;
    }

    if ((needField?.required ?? true) && !formData.primary_need) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng chọn Nhu cầu quan tâm trong danh sách.',
      });
      return;
    }

    for (const cf of customFields) {
      if (!isFieldVisible(cf, formData)) continue;
      if (cf.required && !formData[cf.name]) {
        setStatusMessage({
          type: 'error',
          text: `Vui lòng điền thông tin: ${cf.label.replace(/\s*\*$/, '')}`,
        });
        return;
      }
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const extraPayload: Record<string, any> = {};
      for (const cf of customFields) {
        if (formData[cf.name] !== undefined) {
          extraPayload[cf.name] = formData[cf.name];
        }
      }

      const res = await fetch('/api/landing/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_code: 'robot-cong-trinh',
          form_code: formConfig?.form_code || 'robot_consult_form',
          fields: {
            name: formData.full_name.trim(),
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            email: formData.work_email.trim(),
            work_email: formData.work_email.trim(),
            company: formData.company?.trim() || '',
            primary_need: formData.primary_need,
            requirements: formData.requirements?.trim() || '',
            notes: formData.requirements?.trim() || '',
            ...extraPayload,
          },
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Gửi thông tin không thành công');
      }

      setStatusMessage({
        type: 'success',
        title: json.title,
        text:
          json.message ||
          'Cảm ơn Quý khách! Đội ngũ giải pháp Robot CIC sẽ liên hệ trong vòng 15 phút.',
        downloadUrl:
          json.outcome_type === 'download_modal' ? json.download_url : null,
        downloadLabel: json.download_label || 'Tải Hồ Sơ & Tài Liệu (PDF)',
      });
      setFormData({
        full_name: '',
        phone: '',
        work_email: '',
        company: '',
        primary_need: '',
        requirements: '',
        website: '',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text:
          err.message ||
          'Có lỗi xảy ra khi gửi đăng ký. Vui lòng liên hệ hotline.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section consult" id="dang-ky">
      <div className="wrap consult-grid">
        <div>
          <span
            className="eyebrow"
            dangerouslySetInnerHTML={{
              __html: sanitizeSafeHtml(payload.eyebrow || 'TƯ VẤN & BÁO GIÁ'),
            }}
          />
          <h2
            dangerouslySetInnerHTML={{
              __html: sanitizeSafeHtml(
                payload.title ||
                  'Đăng ký nhận báo giá & giải pháp ứng dụng công nghệ.'
              ),
            }}
          />
          <p
            dangerouslySetInnerHTML={{
              __html: sanitizeSafeHtml(
                payload.description ||
                  'Chúng tôi cung cấp giải pháp trọn gói từ tư vấn công nghệ, đào tạo chuyển giao kỹ thuật đến dịch vụ bảo trì chuyên nghiệp trên toàn quốc.'
              ),
            }}
          />

          <div className="contact-line">
            <span className="contact-label">
              {payload.contact_label || 'Hỗ trợ trực tiếp qua điện thoại / Zalo:'}
            </span>
            <div className="contact-line-phones">
              <a
                className="contact-phone"
                href={`https://zalo.me/${(payload.phone || '0866059659').replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Liên hệ CIC qua Zalo"
              >
                <strong>{payload.phone || '0866 059 659'}</strong>
              </a>
              <span className="contact-sep">-</span>
              <a
                className="contact-phone"
                href={`https://zalo.me/${(payload.phone_2 || '0976267834').replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Liên hệ CIC qua Zalo"
              >
                <strong>{payload.phone_2 || '0976 267 834'}</strong>
              </a>
            </div>
            <div className="contact-line-emails">
              <a
                className="contact-email"
                href={`mailto:${payload.email || 'contact@cic.com.vn'}`}
                aria-label="Gửi email tới CIC"
              >
                {payload.email || 'contact@cic.com.vn'}
              </a>
              <span className="contact-sep">·</span>
              <a
                className="contact-email"
                href={`mailto:${payload.email_2 || 'truongvv@cic.com.vn'}`}
                aria-label="Gửi email tới CIC"
              >
                {payload.email_2 || 'truongvv@cic.com.vn'}
              </a>
            </div>
          </div>
        </div>

        <form
          className="form"
          id="consult-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h3
            dangerouslySetInnerHTML={{
              __html: sanitizeSafeHtml(
                payload.form_title || 'Yêu cầu tư vấn thiết bị'
              ),
            }}
          />

          {statusMessage && (
            <div className={`form-status ${statusMessage.type}`}>
              {statusMessage.title && (
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                  {statusMessage.title}
                </div>
              )}
              <div>{statusMessage.text}</div>
              {statusMessage.downloadUrl && (
                <div style={{ marginTop: '10px' }}>
                  <a
                    href={statusMessage.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn"
                    style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '13px' }}
                  >
                    <span>⬇ {statusMessage.downloadLabel || 'Tải Tài Liệu Ngay'}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="fields">
            <div className="field">
              <label htmlFor="name">
                {nameField?.label || payload.name || 'Họ và tên *'}
              </label>
              <input
                id="name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder={nameField?.placeholder || 'Nguyễn Văn An'}
                required
                maxLength={100}
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">
                {phoneField?.label || payload.phone_label || 'Số điện thoại *'}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={phoneField?.placeholder || 'Số điện thoại liên hệ'}
                required
                maxLength={20}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="fields">
            <div className="field">
              <label htmlFor="email">
                {emailField?.label || payload.email_label || 'Email công việc *'}
              </label>
              <input
                id="email"
                name="work_email"
                type="email"
                autoComplete="email"
                placeholder={emailField?.placeholder || 'ban@congty.vn'}
                required
                maxLength={150}
                value={formData.work_email}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="company">
                {companyField?.label || payload.company || 'Tên đơn vị / Dự án'}
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder={companyField?.placeholder || 'Tên đơn vị của bạn'}
                maxLength={150}
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="interest">
              {needField?.label || payload.interest || 'Nhu cầu quan tâm'}
            </label>
            <select
              id="interest"
              name="primary_need"
              required
              value={formData.primary_need}
              onChange={handleChange}
            >
              <option value="">
                {needField?.placeholder ||
                  payload.select_placeholder ||
                  '-- Chọn giải pháp hoặc thiết bị --'}
              </option>
              {needOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {customFields
            .filter((cf) => isFieldVisible(cf, formData))
            .map((cf) => (
            <div key={cf.name} className="field">
              <label htmlFor={`cf_${cf.name}`}>{cf.label}</label>
              {cf.type === 'select' ? (
                <select
                  id={`cf_${cf.name}`}
                  name={cf.name}
                  required={cf.required}
                  value={formData[cf.name] || ''}
                  onChange={handleChange}
                >
                  <option value="">{cf.placeholder || '-- Chọn phương án --'}</option>
                  {(cf.options || []).map((opt, idx) => (
                    <option key={idx} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`cf_${cf.name}`}
                  name={cf.name}
                  type={
                    cf.type === 'number'
                      ? 'number'
                      : cf.type === 'email'
                      ? 'email'
                      : cf.type === 'tel'
                      ? 'tel'
                      : 'text'
                  }
                  required={cf.required}
                  placeholder={cf.placeholder || ''}
                  value={formData[cf.name] || ''}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}

          <div className="field">
            <label htmlFor="message">
              {notesField?.label || payload.message || 'Mô tả nhu cầu cụ thể'}
            </label>
            <textarea
              id="message"
              name="requirements"
              placeholder={
                notesField?.placeholder ||
                'Loại công trình, hạng mục, diện tích và thời gian dự kiến…'
              }
              maxLength={1200}
              value={formData.requirements}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'none' }}>
            <input
              name="website"
              tabIndex={-1}
              value={formData.website}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            <span>{loading ? 'Đang gửi...' : payload.submit || 'Gửi yêu cầu'}</span>{' '}
            <span>↗</span>
          </button>

          <p
            className="note"
            dangerouslySetInnerHTML={{
              __html: sanitizeSafeHtml(
                payload.note ||
                  'Thông tin của bạn được cam kết bảo mật theo chính sách quyền riêng tư của CIC.'
              ),
            }}
          />
        </form>
      </div>
    </section>
  );
}
