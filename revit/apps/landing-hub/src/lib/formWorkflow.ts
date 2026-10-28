export interface FormSelectOption {
  label: string;
  value: string;
}

export interface FieldVisibilityRule {
  operator: 'always' | 'equals' | 'not_equals' | 'in';
  dependsOnField?: string;
  value?: string;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  default_value?: any;
  options?: FormSelectOption[];
  visibility_rule?: FieldVisibilityRule;
  // Legacy compatibility
  conditional_visible_on?: {
    field: string;
    value: any;
  };
}

export interface FormOutcomeRule {
  id: string;
  whenField: string;
  operator: 'equals' | 'always';
  whenValue: string;
  actionType: 'message_only' | 'download_modal';
  title: string;
  message: string;
  downloadUrl?: string;
  downloadLabel?: string;
  targetSheetName?: string;
}

export interface ResolvedFormOutcome {
  actionType: 'message_only' | 'download_modal';
  title: string;
  message: string;
  downloadUrl: string | null;
  downloadLabel: string | null;
  targetSheetName: string | null;
}

/**
 * Evaluates whether a form field should be visible and validated given current form values.
 */
export function isFieldVisible(
  field: FormFieldSchema,
  values: Record<string, any>
): boolean {
  const rule = field.visibility_rule;
  if (rule && rule.operator && rule.operator !== 'always' && rule.dependsOnField) {
    const actual = String(values[rule.dependsOnField] ?? '');
    const target = String(rule.value ?? '');

    if (rule.operator === 'equals') {
      return actual === target;
    }
    if (rule.operator === 'not_equals') {
      return actual !== target;
    }
    if (rule.operator === 'in') {
      const list = target
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return list.includes(actual);
    }
  }

  // Backward compatibility with legacy conditional_visible_on
  if (field.conditional_visible_on?.field) {
    const depField = field.conditional_visible_on.field;
    const expected = field.conditional_visible_on.value;
    if (depField === 'interest_lisp' && values.primary_need !== undefined) {
      const isLisp = values.primary_need === 'receive_lisp';
      return isLisp === Boolean(expected);
    }
    return values[depField] === expected;
  }

  return true;
}

/**
 * Resolves which post-submit outcome rule matches the submitted form values.
 */
export function resolveFormOutcome(
  outcomeRules: FormOutcomeRule[] | undefined,
  fallbackSuccessPayload: Record<string, any> | undefined,
  submittedValues: Record<string, any>
): ResolvedFormOutcome {
  const rules = Array.isArray(outcomeRules) ? outcomeRules : [];

  for (const rule of rules) {
    const matches =
      rule.operator === 'always' ||
      String(submittedValues[rule.whenField] ?? '') === String(rule.whenValue ?? '');

    if (matches) {
      const isDownload =
        rule.actionType === 'download_modal' && Boolean(rule.downloadUrl?.trim());
      return {
        actionType: isDownload ? 'download_modal' : 'message_only',
        title:
          rule.title?.trim() ||
          (isDownload ? 'Tài Liệu & Bộ Cài Đã Sẵn Sàng!' : 'Đăng Ký Tư Vấn Thành Công!'),
        message:
          rule.message?.trim() ||
          'Cảm ơn Quý khách! Chuyên viên kỹ thuật CIC sẽ liên hệ hỗ trợ sớm nhất.',
        downloadUrl: isDownload ? rule.downloadUrl!.trim() : null,
        downloadLabel: isDownload
          ? rule.downloadLabel?.trim() || 'Tải Về Ngay'
          : null,
        targetSheetName: rule.targetSheetName?.trim() || null,
      };
    }
  }

  // Fallback when no explicit rule matched
  const fb = fallbackSuccessPayload || {};
  const primaryNeed = String(submittedValues.primary_need || '');
  if (primaryNeed === 'receive_lisp') {
    return {
      actionType: 'download_modal',
      title: 'Tải Bộ Công Cụ & Thư Viện LISP Miễn Phí',
      message:
        'Cảm ơn Quý khách. Gói thư viện LISP hữu ích đã sẵn sàng bên dưới.',
      downloadUrl:
        (fb.lisp_download_url as string) ||
        '/api/landing/media/cms-intellicad/downloads/Lisp%20Intellicad.rar',
      downloadLabel: 'Tải Trọn Bộ LISP (.RAR)',
      targetSheetName: 'CMS INTELLICAD LISP',
    };
  }

  if (primaryNeed === 'trial_30_days') {
    return {
      actionType: 'download_modal',
      title: 'Bộ Cài Dùng Thử 30 Ngày & Tài Liệu Đã Sẵn Sàng!',
      message:
        'Cảm ơn Quý khách đã đăng ký trải nghiệm. Quý khách có thể tải ngay bộ cài dùng thử bên dưới:',
      downloadUrl:
        (fb.trial_download_url as string) ||
        '/api/landing/media/cms-intellicad/downloads/TechAZ_So_Sanh_IntelliCAD_AutoCAD.pdf',
      downloadLabel: 'Tải Bộ Cài Dùng Thử Ngay',
      targetSheetName: null,
    };
  }

  return {
    actionType: 'message_only',
    title: (fb.modal_title as string) || 'Đăng Ký Tư Vấn Thành Công!',
    message:
      (fb.message as string) ||
      (fb.modal_description as string) ||
      'Cảm ơn Quý khách! Chuyên viên CIC đã ghi nhận yêu cầu và sẽ liên hệ trong vòng 15 phút.',
    downloadUrl: null,
    downloadLabel: null,
    targetSheetName: null,
  };
}
