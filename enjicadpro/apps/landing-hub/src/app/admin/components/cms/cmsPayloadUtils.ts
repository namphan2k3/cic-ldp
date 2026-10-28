export const SECTION_LABELS: Record<string, string> = {
  header: 'Header (Thanh điều hướng)',
  hero: 'Hero & Hình thức cấp phép',
  intro: 'Giới thiệu',
  advantages: 'Ưu điểm nổi bật',
  comparison: 'So sánh AutoCAD & Popup Tài liệu PDF',
  requirements: 'Yêu cầu cấu hình hệ thống',
  resources: 'Thư viện & Tải dùng thử',
  catalog: 'Danh mục Sản phẩm / Robot',
  video_slider: 'Video Slider',
  infrastructure: 'Robot Hạ tầng',
  consultation_form: 'Form tư vấn & Popup sau đăng ký',
  faq: 'FAQ (Câu hỏi thường gặp)',
  footer: 'Footer (Chân trang)',
  floating_cta: 'Nút nổi (Hotline/Zalo)',
};

export const SECTION_ANCHORS: Record<string, string> = {
  header: '#header',
  hero: '#hero',
  intro: '#gioi-thieu',
  advantages: '#advantages',
  comparison: '#comparison',
  requirements: '#requirements',
  resources: '#resources',
  catalog: '#robot',
  video_slider: '#video-slider',
  infrastructure: '#robot-ha-tang',
  consultation_form: '#dang-ky',
  faq: '#faq',
  footer: '#footer',
  floating_cta: '#footer',
};

function normalizeText(s: string): string {
  return (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripHtmlTags(s: string): string {
  return (s || '')
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ');
}

function stripHtmlTagsWithSpace(s: string): string {
  return (s || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ');
}

export interface ReplaceTextOptions {
  oldHtml?: string;
  newHtml?: string;
  itemIndex?: number;
  occurrenceIndex?: number;
}

export function replaceTextInPayload(
  node: any,
  oldText: string,
  newText: string,
  options?: ReplaceTextOptions
): { updated: any; replaced: boolean } {
  const targetNorm = normalizeText(oldText);
  if (!targetNorm) return { updated: node, replaced: false };

  const targetHtmlNorm = options?.oldHtml ? normalizeText(options.oldHtml) : '';
  const targetStrippedNoSpace = normalizeText(stripHtmlTags(oldText));
  const targetStrippedSpace = normalizeText(stripHtmlTagsWithSpace(oldText));
  const hasFormattingInNewHtml = Boolean(
    options?.newHtml && /<(br|em|strong|b|i|u|span)\b/i.test(options.newHtml)
  );

  function matchesTarget(curr: string): boolean {
    const currNorm = normalizeText(curr);
    if (currNorm === targetNorm) return true;
    if (targetHtmlNorm && currNorm === targetHtmlNorm) return true;
    const currNoSpace = normalizeText(stripHtmlTags(curr));
    if (currNoSpace && currNoSpace === targetStrippedNoSpace) return true;
    const currSpace = normalizeText(stripHtmlTagsWithSpace(curr));
    if (currSpace && currSpace === targetStrippedSpace) return true;
    return false;
  }

  function computeReplacement(curr: string): string {
    const currHasHtml = /<(br|em|strong|b|i|u|span)\b/i.test(curr);
    if (options?.newHtml && (currHasHtml || hasFormattingInNewHtml)) {
      return options.newHtml;
    }
    return newText;
  }

  // 1. If itemIndex is provided and node.items[itemIndex] exists, scope replacement strictly to that item first!
  if (
    typeof options?.itemIndex === 'number' &&
    !Number.isNaN(options.itemIndex) &&
    node &&
    typeof node === 'object' &&
    Array.isArray(node.items) &&
    node.items[options.itemIndex]
  ) {
    let itemReplaced = false;
    const walkItem = (curr: any): any => {
      if (typeof curr === 'string') {
        if (!itemReplaced && matchesTarget(curr)) {
          itemReplaced = true;
          return computeReplacement(curr);
        }
        return curr;
      }
      if (Array.isArray(curr)) return curr.map(walkItem);
      if (curr && typeof curr === 'object') {
        const nextObj: Record<string, any> = {};
        for (const [k, v] of Object.entries(curr)) {
          nextObj[k] = walkItem(v);
        }
        return nextObj;
      }
      return curr;
    };

    const updatedItem = walkItem(node.items[options.itemIndex]);
    if (itemReplaced) {
      const nextItems = [...node.items];
      nextItems[options.itemIndex] = updatedItem;
      return {
        updated: { ...node, items: nextItems },
        replaced: true,
      };
    }
  }

  // 2. General walk with optional occurrenceIndex support
  const desiredOcc =
    typeof options?.occurrenceIndex === 'number' && options.occurrenceIndex > 0
      ? options.occurrenceIndex
      : 0;
  let matchCounter = 0;
  let replacedOnce = false;

  function walk(curr: any, targetOcc: number): any {
    if (typeof curr === 'string') {
      if (!replacedOnce && matchesTarget(curr)) {
        if (matchCounter === targetOcc) {
          replacedOnce = true;
          matchCounter++;
          return computeReplacement(curr);
        }
        matchCounter++;
      }
      return curr;
    }
    if (Array.isArray(curr)) {
      return curr.map((item) => walk(item, targetOcc));
    }
    if (curr && typeof curr === 'object') {
      const nextObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(curr)) {
        if (k === 'text_overrides' || k === 'image_overrides' || k === 'link_overrides') {
          nextObj[k] = v;
        } else {
          nextObj[k] = walk(v, targetOcc);
        }
      }
      return nextObj;
    }
    return curr;
  }

  let updated = walk(node, desiredOcc);
  if (!replacedOnce && desiredOcc > 0 && matchCounter > 0) {
    matchCounter = 0;
    updated = walk(node, 0);
  }
  return { updated, replaced: replacedOnce };
}

function normalizeUrlPath(rawUrl: string): string {
  try {
    const u = new URL(rawUrl, 'http://localhost:3000');
    return decodeURIComponent(u.pathname + u.search);
  } catch {
    return rawUrl.trim();
  }
}

export interface ReplaceImageOptions {
  itemIndex?: number;
  isSecondDuoImage?: boolean;
  liveSrc?: string;
}

export function replaceImageInPayload(
  node: any,
  oldSrc: string,
  newSrc: string,
  options?: ReplaceImageOptions
): { updated: any; replaced: boolean } {
  const targetPath = normalizeUrlPath(oldSrc);
  const liveTargetPath = options?.liveSrc ? normalizeUrlPath(options.liveSrc) : '';

  // 1. If itemIndex is provided and node.items[itemIndex] exists, update that item's image_url or image_url_2
  if (
    typeof options?.itemIndex === 'number' &&
    !Number.isNaN(options.itemIndex) &&
    node &&
    typeof node === 'object' &&
    Array.isArray(node.items) &&
    node.items[options.itemIndex]
  ) {
    const nextItems = [...node.items];
    const targetField = options.isSecondDuoImage ? 'image_url_2' : 'image_url';
    nextItems[options.itemIndex] = {
      ...nextItems[options.itemIndex],
      [targetField]: newSrc,
    };
    return {
      updated: { ...node, items: nextItems },
      replaced: true,
    };
  }

  let replacedOnce = false;

  function walk(curr: any): any {
    if (typeof curr === 'string') {
      const normCurr = curr ? normalizeUrlPath(curr) : '';
      if (
        !replacedOnce &&
        normCurr &&
        (normCurr === targetPath || (liveTargetPath && normCurr === liveTargetPath))
      ) {
        replacedOnce = true;
        return newSrc;
      }
      return curr;
    }
    if (Array.isArray(curr)) {
      return curr.map((item) => walk(item));
    }
    if (curr && typeof curr === 'object') {
      const nextObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(curr)) {
        if (k === 'text_overrides' || k === 'image_overrides' || k === 'link_overrides') {
          nextObj[k] = v;
        } else {
          nextObj[k] = walk(v);
        }
      }
      return nextObj;
    }
    return curr;
  }

  const updated = walk(node);
  return { updated, replaced: replacedOnce };
}

export function applySlotMediaToPayload(
  payload: Record<string, any>,
  slotKey: string,
  newUrl: string
): Record<string, any> {
  if (slotKey.startsWith('catalog_item_')) {
    const idx = parseInt(slotKey.replace('catalog_item_', ''), 10);
    const items = Array.isArray(payload.items) ? [...payload.items] : [];
    if (items[idx]) {
      items[idx] = { ...items[idx], image_url: newUrl };
    }
    return { ...payload, items };
  }
  if (slotKey === 'modal.pdf_url') {
    return {
      ...payload,
      modal: {
        ...(payload.modal || {}),
        pdf_url: newUrl,
      },
    };
  }
  return { ...payload, [slotKey]: newUrl };
}

function isMediaPathKey(key: string, val: string): boolean {
  const lowerKey = key.toLowerCase();
  if (
    lowerKey.includes('image') ||
    lowerKey.includes('img') ||
    lowerKey.includes('logo') ||
    lowerKey.includes('banner') ||
    lowerKey.includes('avatar') ||
    lowerKey.includes('icon')
  ) {
    return true;
  }
  return /\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(val);
}

export function syncPayloadWithOverrides(
  prevPayload: Record<string, any>,
  nextPayload: Record<string, any>
): Record<string, any> {
  const textOverrides: Record<string, string> = { ...(nextPayload.text_overrides || prevPayload.text_overrides || {}) };
  const imageOverrides: Record<string, string> = { ...(nextPayload.image_overrides || prevPayload.image_overrides || {}) };

  function diffNodes(oldNode: any, newNode: any, keyName: string) {
    if (
      keyName === 'text_overrides' ||
      keyName === 'image_overrides' ||
      keyName === 'link_overrides' ||
      keyName === 'modal'
    ) {
      return;
    }
    if (typeof oldNode === 'string' && typeof newNode === 'string') {
      const oldTrim = oldNode.trim();
      const newTrim = newNode.trim();
      if (oldTrim && oldTrim !== newTrim) {
        if (isMediaPathKey(keyName, oldTrim)) {
          let updatedExisting = false;
          for (const [origSrc, mappedSrc] of Object.entries(imageOverrides)) {
            if (mappedSrc === oldTrim) {
              imageOverrides[origSrc] = newTrim;
              updatedExisting = true;
            }
          }
          if (!updatedExisting) {
            imageOverrides[oldTrim] = newTrim;
          }
        } else {
          let updatedExisting = false;
          for (const [origTxt, mappedTxt] of Object.entries(textOverrides)) {
            if (mappedTxt === oldNode || normalizeText(mappedTxt) === normalizeText(oldNode)) {
              textOverrides[origTxt] = newNode;
              updatedExisting = true;
            }
          }
          if (!updatedExisting) {
            textOverrides[oldNode] = newNode;
          }
        }
      }
      return;
    }
    if (Array.isArray(oldNode) && Array.isArray(newNode)) {
      const len = Math.min(oldNode.length, newNode.length);
      for (let i = 0; i < len; i++) {
        diffNodes(oldNode[i], newNode[i], keyName);
      }
      return;
    }
    if (oldNode && newNode && typeof oldNode === 'object' && typeof newNode === 'object') {
      for (const k of Object.keys(newNode)) {
        if (k in oldNode) {
          diffNodes(oldNode[k], newNode[k], k);
        }
      }
    }
  }

  diffNodes(prevPayload, nextPayload, '');

  const result: Record<string, any> = { ...nextPayload };
  if (Object.keys(textOverrides).length > 0) {
    result.text_overrides = textOverrides;
  }
  if (Object.keys(imageOverrides).length > 0) {
    result.image_overrides = imageOverrides;
  }
  return result;
}


