const MALICIOUS_PATTERNS: RegExp[] = [
  /<\s*script\b/i,
  /<\/\s*script\s*>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /<\s*(iframe|object|embed|applet|meta|link|style|svg|math|base|form)\b/i,
  /\bon(error|load|click|mouseover|focus|blur|submit|change|keydown|keyup|input)\s*=/i,
  /\b(union\s+all\s+select|union\s+select|drop\s+table|alter\s+table|truncate\s+table|insert\s+into|delete\s+from|xp_cmdshell|exec\s+master)\b/i,
  /(\.\.\/|\.\.\\)/,
  /(\$\([^)]*\)|`[^`]+`|\b(cmd\.exe|powershell\.exe|\/bin\/sh|\/bin\/bash)\b)/i,
];

export function containsMaliciousPayload(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();
  return MALICIOUS_PATTERNS.some((rx) => rx.test(value) || rx.test(decoded));
}

/**
 * Sanitizes plain text input, strips HTML tags and control characters,
 * and neutralizes Spreadsheet / Excel / Google Sheets Formula Injection (=, +, -, @).
 */
export function sanitizeText(value: unknown, maxLength = 500): string {
  if (value === null || value === undefined) return '';
  let str = String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();

  // Prevent CSV / Excel / Google Sheets Formula Injection (DDE / Macro execution)
  if (/^[=+\-@]/.test(str)) {
    str = str.replace(/^[=+\-@]+/, '').trim();
  }

  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }
  return str;
}

/**
 * Sanitizes HTML strings used in dangerouslySetInnerHTML so only safe formatting tags remain.
 */
export function sanitizeSafeHtml(html: string | undefined | null): string {
  if (!html) return '';
  return String(html)
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*(iframe|object|embed|applet|meta|link|style|form|input|button)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(iframe|object|embed|applet|meta|link|style|form|input|button)[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src|xlink:href)\s*=\s*["']?\s*(javascript|vbscript|data):[^"'\s>]*/gi, '$1="#"');
}

export function validatePhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s.\-()]/g, '');
  if (!/^(\+?84|0)[235789][0-9]{7,9}$/.test(cleaned)) {
    return false;
  }
  // Reject repeated fake digits like 09999999999 or 0000000000
  const digitsOnly = cleaned.replace(/^\+?84/, '0');
  if (/^0(\d)\1{8,9}$/.test(digitsOnly)) {
    return false;
  }
  return true;
}

export function validateEmail(raw: string): boolean {
  const cleaned = raw.trim();
  if (cleaned.length < 5 || cleaned.length > 150) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleaned);
}

import { isFieldVisible, type FormFieldSchema } from './formWorkflow';

export type SchemaFieldDef = FormFieldSchema;

export function validateAndSanitizeLeadFields(
  rawFields: Record<string, any>,
  schema: SchemaFieldDef[]
): {
  valid: boolean;
  error?: string;
  sanitizedFields: Record<string, any>;
} {
  if (!rawFields || typeof rawFields !== 'object') {
    return { valid: false, error: 'Dữ liệu gửi lên không hợp lệ.', sanitizedFields: {} };
  }

  // 1. Scan all fields for malicious payloads (XSS / SQLi / Command Injection)
  for (const [key, val] of Object.entries(rawFields)) {
    if (containsMaliciousPayload(key) || containsMaliciousPayload(val)) {
      return {
        valid: false,
        error: 'Phát hiện ký tự hoặc mã lệnh không hợp lệ (Bảo mật hệ thống đã chặn yêu cầu).',
        sanitizedFields: {},
      };
    }
    if (Array.isArray(val) && val.some((item) => containsMaliciousPayload(item))) {
      return {
        valid: false,
        error: 'Phát hiện dữ liệu danh sách chứa mã không hợp lệ.',
        sanitizedFields: {},
      };
    }
  }

  // Honeypot bot check
  if (rawFields.website && String(rawFields.website).trim() !== '') {
    return { valid: false, error: 'Yêu cầu bị từ chối bởi bộ lọc chống Bot.', sanitizedFields: {} };
  }

  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(rawFields)) {
    if (k === 'website') continue;
    const cleanKey = k.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 64);
    if (!cleanKey) continue;
    if (typeof v === 'boolean') {
      sanitized[cleanKey] = v;
    } else if (typeof v === 'number') {
      sanitized[cleanKey] = Number.isFinite(v) ? Math.max(0, Math.min(100000, v)) : 0;
    } else if (Array.isArray(v)) {
      sanitized[cleanKey] = v.slice(0, 20).map((item) => sanitizeText(item, 200));
    } else if (v === null || v === undefined) {
      sanitized[cleanKey] = null;
    } else {
      const maxLen =
        cleanKey === 'notes' || cleanKey === 'requirements' || cleanKey === 'message'
          ? 2000
          : 250;
      sanitized[cleanKey] = sanitizeText(v, maxLen);
    }
  }

  // Normalize common aliases (name <-> full_name, email <-> work_email, notes <-> requirements)
  const effectiveName = sanitized.full_name || sanitized.name || '';
  const effectivePhone = sanitized.phone || '';
  const effectiveEmail = sanitized.work_email || sanitized.email || '';

  if (!effectiveName || effectiveName.length < 2) {
    return {
      valid: false,
      error: 'Vui lòng nhập Họ và tên hợp lệ (tối thiểu 2 ký tự).',
      sanitizedFields: sanitized,
    };
  }

  if (!effectivePhone || !validatePhone(effectivePhone)) {
    return {
      valid: false,
      error: 'Số điện thoại không đúng định dạng (VD: 0912 345 678 hoặc +84912345678).',
      sanitizedFields: sanitized,
    };
  }

  if (!effectiveEmail || !validateEmail(effectiveEmail)) {
    return {
      valid: false,
      error: 'Địa chỉ Email không đúng định dạng (VD: name@company.com).',
      sanitizedFields: sanitized,
    };
  }

  // Validate against dynamic schema fields (skipping fields hidden by conditional visibility_rule)
  for (const field of schema || []) {
    if (!isFieldVisible(field, sanitized)) {
      continue;
    }

    const val =
      sanitized[field.name] ??
      (field.name === 'name' ? sanitized.full_name : undefined) ??
      (field.name === 'full_name' ? sanitized.name : undefined) ??
      (field.name === 'email' ? sanitized.work_email : undefined) ??
      (field.name === 'work_email' ? sanitized.email : undefined) ??
      (field.name === 'notes' ? sanitized.requirements : undefined) ??
      (field.name === 'requirements' ? sanitized.notes : undefined);

    const isEmpty =
      val === undefined ||
      val === null ||
      val === '' ||
      (Array.isArray(val) && val.length === 0);

    if (field.required && isEmpty) {
      return {
        valid: false,
        error: `Trường "${field.label.replace(/\s*\*$/, '')}" là bắt buộc.`,
        sanitizedFields: sanitized,
      };
    }

    if (!isEmpty && field.type === 'select' && Array.isArray(field.options) && field.options.length > 0) {
      const allowedValues = new Set(field.options.map((o) => String(o.value)));
      // Also allow legacy mapped codes for backward compatibility
      const legacyAllowed = new Set([
        'trial_30_days',
        'receive_lisp',
        'request_quote',
        'technical_consult',
        'pe_plus',
        'pe',
        'easy_run',
      ]);
      const strVal = String(val);
      if (!allowedValues.has(strVal) && !legacyAllowed.has(strVal)) {
        return {
          valid: false,
          error: `Giá trị đã chọn cho "${field.label.replace(/\s*\*$/, '')}" không nằm trong danh sách hợp lệ.`,
          sanitizedFields: sanitized,
        };
      }
    }

    if (!isEmpty && field.type === 'number') {
      const num = Number(val);
      if (!Number.isFinite(num) || num < 1 || num > 10000) {
        return {
          valid: false,
          error: `Trường "${field.label.replace(/\s*\*$/, '')}" phải là số hợp lệ (1 - 10.000).`,
          sanitizedFields: sanitized,
        };
      }
    }
  }

  return { valid: true, sanitizedFields: sanitized };
}

// Sliding-window in-memory rate limiter
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 5 * 60 * 1000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const prev = (rateLimitStore.get(key) || []).filter((ts) => now - ts < windowMs);
  if (prev.length >= maxRequests) {
    const oldest = prev[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    rateLimitStore.set(key, prev);
    return { allowed: false, retryAfterSeconds };
  }
  prev.push(now);
  rateLimitStore.set(key, prev);
  return { allowed: true, retryAfterSeconds: 0 };
}
