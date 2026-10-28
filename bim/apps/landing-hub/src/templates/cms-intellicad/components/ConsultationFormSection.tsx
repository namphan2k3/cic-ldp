'use client';

import React, { useState, useEffect } from 'react';
import { CmsIcon } from './CmsIcon';
import { TrialDownloadModal } from './TrialDownloadModal';
import {
  validatePhone,
  validateEmail,
  containsMaliciousPayload,
  type SchemaFieldDef,
} from '@/lib/security';
import { isFieldVisible } from '@/lib/formWorkflow';

interface ConsultationFormSectionProps {
  payload: Record<string, unknown>;
  locale: string;
  formConfig?: {
    form_code?: string;
    fields_schema_json?: SchemaFieldDef[];
    success_payload_json?: Record<string, any>;
  };
}

const DEFAULT_NEED_OPTIONS = [
  { label: 'Dùng thử miễn phí 30 ngày', value: 'trial_30_days' },
  { label: 'Nhận bộ thư viện LISP hữu ích', value: 'receive_lisp' },
  { label: 'Nhận báo giá & chính sách chiết khấu', value: 'request_quote' },
  { label: 'Tư vấn kỹ thuật & giải pháp chuyển đổi', value: 'technical_consult' },
];

const DEFAULT_VERSION_OPTIONS = [
  { label: 'CMS IntelliCAD PE Plus (Khuyên dùng)', value: 'pe_plus' },
  { label: 'CMS IntelliCAD PE', value: 'pe' },
  { label: 'CMS IntelliCAD Easy Run (Cloud)', value: 'easy_run' },
];

const BUILTIN_FIELD_NAMES = new Set([
  'name',
  'full_name',
  'phone',
  'email',
  'work_email',
  'company',
  'primary_need',
  'product_version',
  'software_version',
  'device_quantity',
  'quantity',
  'requirements',
  'notes',
  'interest_lisp',
]);

export function ConsultationFormSection({
  payload,
  locale,
  formConfig,
}: ConsultationFormSectionProps) {
  const formText = payload as Record<string, any>;
  const schemaFields = (formConfig?.fields_schema_json || []) as SchemaFieldDef[];
  const findField = (...names: string[]) =>
    schemaFields.find((f) => names.includes(f.name));

  const nameField = findField('full_name', 'name');
  const phoneField = findField('phone');
  const emailField = findField('work_email', 'email');
  const companyField = findField('company');
  const needField = findField('primary_need');
  const versionField = findField('product_version', 'software_version');
  const qtyField = findField('device_quantity', 'quantity');
  const notesField = findField('requirements', 'notes');

  const needOptions =
    needField?.options && needField.options.length > 0
      ? needField.options
      : DEFAULT_NEED_OPTIONS;
  const versionOptions =
    versionField?.options && versionField.options.length > 0
      ? versionField.options
      : DEFAULT_VERSION_OPTIONS;

  const customFields = schemaFields.filter((f) => !BUILTIN_FIELD_NAMES.has(f.name));

  const companyInfo = formText.company_info || {
    name: 'Công ty Cổ phần Công nghệ và Tư vấn CIC',
    role: 'Đại diện phân phối chính thức tại Việt Nam',
    description:
      'Hơn 30 năm kinh nghiệm trong tư vấn và chuyển giao các giải pháp phần mềm kỹ thuật, xây dựng, kết cấu và cơ khí hàng đầu.',
    contact_title: 'Thông Tin Liên Hệ Trực Tiếp',
    address: 'Tòa nhà CIC, 37 Lê Văn Thiêm, Thanh Xuân, Hà Nội',
    hours: 'Thứ 2 - Thứ 6: 08:00 - 17:30',
    security_title: 'Bảo mật thông tin 100%',
    security: 'Cam kết không chia sẻ dữ liệu liên hệ với bên thứ ba.',
  };

  const benefits = formText.benefits || [
    'Hỗ trợ kỹ thuật 24/7 trực tiếp từ đội ngũ kỹ sư CIC',
    'Chính sách cấp phép bản quyền vĩnh viễn không phụ thuộc thuê bao',
    'Tài liệu đào tạo và video hướng dẫn chuyên sâu bằng tiếng Việt',
  ];

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({
    full_name: '',
    phone: '',
    work_email: '',
    company: '',
    primary_need: needOptions[0]?.value || 'trial_30_days',
    product_version: versionOptions[0]?.value || 'pe_plus',
    device_quantity: 5,
    requirements: '',
    website: '', // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outcomeData, setOutcomeData] = useState<{
    outcomeType: 'message_only' | 'download_modal';
    title?: string;
    message?: string;
    downloadUrl?: string | null;
    downloadLabel?: string | null;
  }>({ outcomeType: 'download_modal' });

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CMS_TOGGLE_MODAL' && e.data?.modal === 'trial_download') {
        const sp = formConfig?.success_payload_json || {};
        if (e.data.mode === 'lisp') {
          setFormData((prev) => ({ ...prev, primary_need: 'receive_lisp' }));
          setOutcomeData({
            outcomeType: 'download_modal',
            downloadUrl:
              sp.lisp_download_url ||
              '/api/landing/media/cms-intellicad/downloads/Lisp%20Intellicad.rar',
          });
        } else {
          setFormData((prev) => ({ ...prev, primary_need: 'trial_30_days' }));
          setOutcomeData({
            outcomeType: 'download_modal',
            downloadUrl:
              sp.trial_download_url ||
              'https://drive.google.com/file/d/1QvZAwcThb2JvhcNm1kXLVli02i3wJ3NZ/view?usp=drive_link',
          });
        }
        setIsModalOpen(Boolean(e.data.open));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [formConfig]);
  const isLisp = formData.primary_need === 'receive_lisp';
  const showVersion = versionField
    ? isFieldVisible(versionField, formData)
    : !isLisp;
  const showQuantity = qtyField
    ? isFieldVisible(qtyField, formData)
    : !isLisp;

  const bgImageSrc =
    formText.background_image_url ||
    '/api/landing/media/cms-intellicad/images/intellicad_3d_laptop_1785898332833.jpg';
  const companyLogoSrc =
    companyInfo.logo_url ||
    formText.logo_url ||
    '/api/landing/media/cms-intellicad/images/logo.png';
  const contactPhone = companyInfo.phone || formText.phone || '0866 059 659';
  const contactEmail = companyInfo.email || formText.email || 'intellicad@cic.com.vn';
  const contactWebsite = companyInfo.website || formText.website || 'https://cic.com.vn';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return; // honeypot caught bot

    for (const val of Object.values(formData)) {
      if (containsMaliciousPayload(val)) {
        setErrorMessage('Phát hiện ký tự hoặc mã lệnh không hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }
    }

    if (!formData.full_name?.trim() || formData.full_name.trim().length < 2) {
      setErrorMessage(
        locale === 'en'
          ? 'Please enter your full name (at least 2 characters).'
          : 'Vui lòng nhập Họ và tên hợp lệ (tối thiểu 2 ký tự).'
      );
      return;
    }

    if (!formData.phone?.trim() || !validatePhone(formData.phone)) {
      setErrorMessage(
        locale === 'en'
          ? 'Invalid phone number format.'
          : 'Số điện thoại không đúng định dạng (VD: 0912 345 678).'
      );
      return;
    }

    if (!formData.work_email?.trim() || !validateEmail(formData.work_email)) {
      setErrorMessage(
        locale === 'en'
          ? 'Invalid email address format.'
          : 'Địa chỉ Email không đúng định dạng (VD: name@company.com).'
      );
      return;
    }

    for (const cf of customFields) {
      if (!isFieldVisible(cf, formData)) continue;
      if (cf.required && !formData[cf.name]) {
        setErrorMessage(`Vui lòng điền thông tin: ${cf.label.replace(/\s*\*$/, '')}`);
        return;
      }
    }

    setLoading(true);
    setErrorMessage(null);

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
          site_code: 'cms-intellicad',
          form_code: formConfig?.form_code || 'cms_consult_form',
          fields: {
            name: formData.full_name.trim(),
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            email: formData.work_email.trim(),
            work_email: formData.work_email.trim(),
            company: formData.company?.trim() || '',
            interest_lisp: isLisp,
            primary_need: formData.primary_need,
            product_version: isLisp ? null : formData.product_version,
            software_version: isLisp ? null : formData.product_version,
            device_quantity: isLisp ? null : Number(formData.device_quantity) || 1,
            quantity: isLisp ? null : Number(formData.device_quantity) || 1,
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

      setOutcomeData({
        outcomeType:
          json.outcome_type === 'message_only' ? 'message_only' : 'download_modal',
        title: json.title,
        message: json.message,
        downloadUrl: json.download_url || null,
        downloadLabel: json.download_label || null,
      });
      setIsModalOpen(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Có lỗi xảy ra khi gửi đăng ký. Vui lòng liên hệ hotline.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="dang-ky"
      className="relative scroll-mt-32 overflow-hidden border-t border-slate-200 bg-slate-900 py-10 sm:py-14 lg:scroll-mt-36"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={bgImageSrc}
          alt=""
          className="h-full w-full scale-105 object-cover opacity-20 blur-md"
        />
        <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-700/60 bg-blue-900/80 px-3.5 py-1.5 text-xs font-bold text-amber-300">
            <CmsIcon name="sparkles" className="h-3.5 w-3.5 text-amber-400" />
            <span>{formText.eyebrow || 'Tư Vấn Chuyên Nghiệp & Báo Giá Ưu Đãi'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
            {formText.title || 'ĐĂNG KÝ TRẢI NGHIỆM & NHẬN BÁO GIÁ'}
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-300 sm:text-base">
            {formText.description ||
              'Chuyên viên kỹ thuật CIC sẽ liên hệ cung cấp license dùng thử 30 ngày và tư vấn phương án bản quyền tối ưu chi phí.'}
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-12">
          {/* Company Info Sidebar */}
          <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src={companyLogoSrc}
                alt="CIC Logo"
                className="h-10 w-10 shrink-0 object-contain"
              />
              <div>
                <h3 className="text-base font-extrabold leading-snug text-slate-900 sm:text-lg">
                  {companyInfo.name}
                </h3>
                <span className="block text-xs font-bold text-blue-700">
                  {companyInfo.role}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
              {companyInfo.description}
            </p>

            <div className="space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-700">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                {companyInfo.contact_title}
              </div>
              <div className="flex items-start gap-2.5">
                <CmsIcon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <span className="font-bold leading-snug text-slate-900">
                  {companyInfo.address}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CmsIcon name="phone" className="h-4 w-4 shrink-0 text-blue-700" />
                <strong className="font-bold text-slate-900">{contactPhone}</strong>
              </div>
              <div className="flex items-center gap-2.5">
                <CmsIcon name="mail" className="h-4 w-4 shrink-0 text-blue-700" />
                <strong className="font-bold text-slate-900">{contactEmail}</strong>
              </div>
              <div className="flex items-center gap-2.5">
                <CmsIcon name="globe" className="h-4 w-4 shrink-0 text-blue-700" />
                <a
                  href={contactWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-700 hover:underline"
                >
                  {contactWebsite}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <CmsIcon name="clock" className="h-4 w-4 shrink-0 text-blue-700" />
                <span className="font-bold text-slate-900">{companyInfo.hours}</span>
              </div>
              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
                <CmsIcon
                  name="shield-check"
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                />
                <div>
                  <div className="font-bold text-slate-900">{companyInfo.security_title}</div>
                  <div className="text-[11px] font-medium text-slate-700">
                    {companyInfo.security}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <CmsIcon name="lock" className="h-3.5 w-3.5 text-blue-700" />
                {formText.benefits_title || 'Đặc Quyền Khách Hàng CIC'}
              </div>
              <ul className="list-disc space-y-1 pl-4 text-[11px] font-medium text-slate-700">
                {benefits.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <h3 className="border-b border-slate-100 pb-3 text-xl font-extrabold text-slate-900">
                {formText.form_title || 'Thông Tin Đăng Ký Tư Vấn'}
              </h3>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800"
                >
                  {errorMessage}
                </div>
              )}

              {/* Row 1: Name & Phone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-800">
                    {nameField?.label || 'Họ và tên *'}
                  </span>
                  <input
                    name="full_name"
                    type="text"
                    required
                    maxLength={100}
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder={nameField?.placeholder || 'Nguyễn Văn A'}
                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-800">
                    {phoneField?.label || 'Số điện thoại *'}
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={20}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={phoneField?.placeholder || '0912 345 678'}
                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                  />
                </label>
              </div>

              {/* Row 2: Email & Company */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-800">
                    {emailField?.label || 'Email công việc *'}
                  </span>
                  <input
                    name="work_email"
                    type="email"
                    required
                    maxLength={150}
                    value={formData.work_email}
                    onChange={handleChange}
                    placeholder={emailField?.placeholder || 'name@company.com'}
                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-800">
                    {companyField?.label || 'Tên công ty / Đơn vị'}
                  </span>
                  <input
                    name="company"
                    type="text"
                    maxLength={150}
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={companyField?.placeholder || 'Công ty Cổ phần ABC'}
                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                  />
                </label>
              </div>

              {/* Row 3: Dynamic Select Options from DB (Needs & Versions) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-800">
                    {needField?.label || 'Nhu cầu chính'}
                  </span>
                  <select
                    name="primary_need"
                    value={formData.primary_need}
                    onChange={handleChange}
                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                  >
                    {needOptions.map((opt, idx) => (
                      <option key={idx} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                {showVersion && (
                  <label className="space-y-1.5">
                    <span className="block text-xs font-bold text-slate-800">
                      {versionField?.label || 'Phiên bản quan tâm'}
                    </span>
                    <select
                      name="product_version"
                      value={formData.product_version}
                      onChange={handleChange}
                      className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                    >
                      {versionOptions.map((opt, idx) => (
                        <option key={idx} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {/* Any Extra Custom Fields Added via FormBuilderTab (filtered by conditional visibility) */}
              {customFields.filter((cf) => isFieldVisible(cf, formData)).length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {customFields
                    .filter((cf) => isFieldVisible(cf, formData))
                    .map((cf) => (
                    <label key={cf.name} className="space-y-1.5">
                      <span className="block text-xs font-bold text-slate-800">
                        {cf.label}
                      </span>
                      {cf.type === 'select' ? (
                        <select
                          name={cf.name}
                          required={cf.required}
                          value={formData[cf.name] || ''}
                          onChange={handleChange}
                          className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                        >
                          <option value="">
                            {cf.placeholder || '-- Chọn phương án --'}
                          </option>
                          {(cf.options || []).map((opt, idx) => (
                            <option key={idx} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name={cf.name}
                          type={cf.type === 'number' ? 'number' : cf.type === 'email' ? 'email' : cf.type === 'tel' ? 'tel' : 'text'}
                          required={cf.required}
                          value={formData[cf.name] || ''}
                          onChange={handleChange}
                          placeholder={cf.placeholder || ''}
                          className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* Row 4: Requirements & Quantity */}
              <div className="space-y-1.5">
                <div className="flex items-end justify-between gap-4">
                  <label htmlFor="requirements" className="text-xs font-bold text-slate-800">
                    {isLisp
                      ? 'Ghi chú về nhu cầu LISP & ứng dụng CAD'
                      : notesField?.label || 'Yêu cầu tư vấn cụ thể'}
                  </label>
                  {showQuantity && (
                    <label className="flex shrink-0 items-center gap-2 text-[11px] font-bold text-slate-600">
                      <span>{qtyField?.label || 'Số lượng máy'}:</span>
                      <input
                        name="device_quantity"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.device_quantity}
                        onChange={handleChange}
                        className="h-7 w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 text-center text-xs text-slate-900 outline-none focus:border-blue-700"
                      />
                    </label>
                  )}
                </div>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  maxLength={1500}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder={
                    isLisp
                      ? 'Vui lòng mô tả các lệnh LISP hoặc bài toán tự động hóa bạn cần...'
                      : notesField?.placeholder ||
                        'Mô tả thêm về nhu cầu, phiên bản CAD hiện tại đang dùng...'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              {/* Honeypot field for bot protection */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <input
                  name="website"
                  tabIndex={-1}
                  value={formData.website}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              <p className="text-[11px] font-medium leading-relaxed text-slate-500">
                Bằng việc gửi thông tin, bạn đồng ý để CIC liên hệ qua điện thoại/email để tư vấn giải pháp.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-900 disabled:opacity-60"
              >
                <CmsIcon name="send" className="h-4 w-4" />
                <span>{loading ? 'Đang gửi thông tin...' : 'GỬI ĐĂNG KÝ TƯ VẤN NGAY'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <TrialDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLisp={isLisp}
        outcomeType={outcomeData.outcomeType}
        customTitle={outcomeData.title}
        customMessage={outcomeData.message}
        downloadUrl={outcomeData.downloadUrl}
        downloadLabel={outcomeData.downloadLabel}
        modalData={formText}
      />
    </section>
  );
}
