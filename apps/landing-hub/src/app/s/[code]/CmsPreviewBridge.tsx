'use client';

import { useEffect } from 'react';

export interface CmsRuntimeSection {
  section_code: string;
  is_enabled: boolean;
  payload: Record<string, any>;
}

export interface CmsPreviewBridgeProps {
  isPreview?: boolean;
  sections?: CmsRuntimeSection[];
}

function normalizeText(s: string): string {
  return (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeUrlPath(rawUrl: string): string {
  if (!rawUrl) return '';
  try {
    const u = new URL(rawUrl, window.location.origin);
    return decodeURIComponent(u.pathname + u.search);
  } catch {
    return String(rawUrl).trim();
  }
}

function extractBgUrl(bgVal: string | null | undefined): string {
  if (!bgVal || bgVal === 'none') return '';
  const m = bgVal.match(/url\(["']?([^"')]+)["']?\)/i);
  if (!m || !m[1]) return '';
  if (m[1].startsWith('data:image/svg+xml')) return m[1];
  return m[1];
}

function hasDirectNonEmptyTextNode(el: HTMLElement): boolean {
  for (let i = 0; i < el.childNodes.length; i++) {
    const n = el.childNodes[i];
    if (n.nodeType === Node.TEXT_NODE && normalizeText(n.textContent || '').length > 0) {
      return true;
    }
  }
  return false;
}

function serializeEditableHtml(el: HTMLElement): string {
  let html = el.innerHTML
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s*data-cms-[a-z-]+="[^"]*"/gi, '')
    .replace(/\s*contenteditable="[^"]*"/gi, '')
    .replace(/\s*spellcheck="[^"]*"/gi, '')
    .trim();

  const inlineStyles: string[] = [];
  if (el.style.fontSize) inlineStyles.push(`font-size:${el.style.fontSize}`);
  if (el.style.fontWeight) inlineStyles.push(`font-weight:${el.style.fontWeight}`);
  if (el.style.fontFamily) inlineStyles.push(`font-family:${el.style.fontFamily}`);
  if (el.style.textAlign) inlineStyles.push(`text-align:${el.style.textAlign};display:block`);

  if (inlineStyles.length > 0) {
    const styleStr = inlineStyles.join(';');
    const existingWrap = html.match(/^<span\s+data-cms-style="1"\s+style="[^"]*">([\s\S]*)<\/span>$/i);
    const inner = existingWrap ? existingWrap[1] : html;
    html = `<span data-cms-style="1" style="${styleStr}">${inner}</span>`;
  }
  return html;
}

const KNOWN_SECTION_IDS = new Set([
  'header',
  'hero',
  'gioi-thieu',
  'intro',
  'advantages',
  'comparison',
  'requirements',
  'resources',
  'robot',
  'catalog',
  'video-slider',
  'video_slider',
  'robot-ha-tang',
  'infrastructure',
  'dang-ky',
  'consultation_form',
  'faq',
  'footer',
]);

function findSectionAnchor(el: HTMLElement | null): string {
  let cur = el;
  while (cur && cur !== document.body) {
    if (cur.dataset?.anchor) return cur.dataset.anchor;
    if (cur.id && KNOWN_SECTION_IDS.has(cur.id.toLowerCase())) {
      return cur.id;
    }
    if (cur.tagName === 'HEADER') return 'header';
    if (cur.tagName === 'FOOTER') return 'footer';
    cur = cur.parentElement;
  }
  return 'header';
}

interface ImageTargetCandidate {
  type: 'img' | 'bg' | 'pseudo-consult' | 'pseudo-footer';
  el: HTMLElement;
  boxEl: HTMLElement;
  src: string;
  initialSrc: string;
  area: number;
}

export function CmsPreviewBridge({ isPreview = true, sections = [] }: CmsPreviewBridgeProps) {
  useEffect(() => {
    const liveSections: CmsRuntimeSection[] = Array.isArray(sections)
      ? sections.map((s) => ({ ...s, payload: { ...(s.payload || {}) } }))
      : [];

    // 1. Wrap mixed direct text nodes (e.g. <span class="flex"><svg/> IntelliCAD:</span>) in <cms-text>
    const wrapMixedTextNodes = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const textNodesToWrap: Text[] = [];
      let tNode: Node | null;
      while ((tNode = walker.nextNode())) {
        const val = normalizeText(tNode.nodeValue || '');
        if (!val) continue;
        const p = tNode.parentElement;
        if (!p) continue;
        if (
          p.tagName === 'CMS-TEXT' ||
          p.closest(
            'script, style, svg, noscript, option, textarea, .cms-image-edit-btn, [data-cms-no-edit="1"]'
          )
        ) {
          continue;
        }
        const hasBlockingChildren = p.querySelector(
          'div, section, article, ul, ol, table, p, h1, h2, h3, h4, h5, h6, img, svg, input, select, textarea, button, label'
        );
        if (hasBlockingChildren) {
          textNodesToWrap.push(tNode as Text);
        }
      }

      for (const tn of textNodesToWrap) {
        if (!tn.parentNode || (tn.parentElement && tn.parentElement.tagName === 'CMS-TEXT')) {
          continue;
        }
        const wrapper = document.createElement('cms-text');
        tn.parentNode.insertBefore(wrapper, tn);
        wrapper.appendChild(tn);
      }
    };

    const LEAF_SELECTOR =
      'h1, h2, h3, h4, h5, h6, p, span, a, strong, em, b, li, summary, figcaption, td, th, div, button, label, dt, dd, cms-text';

    const isEligibleLeafTextElement = (el: HTMLElement): boolean => {
      if (
        el.dataset.cmsNoEdit === '1' ||
        el.closest('[data-cms-no-edit="1"]') ||
        el.closest('.cms-image-edit-btn') ||
        el.closest('script, style, svg, noscript, option, textarea')
      ) {
        return false;
      }
      const hasChildBlocks = el.querySelector(
        'div, section, article, ul, ol, table, p, h1, h2, h3, h4, h5, h6, img, svg, input, select, textarea, button, label, cms-text'
      );
      if (hasChildBlocks) return false;

      if (
        el.children.length === 1 &&
        (el.children[0] as HTMLElement).dataset?.cmsStyle !== '1' &&
        normalizeText(el.children[0].textContent || '') === normalizeText(el.textContent || '')
      ) {
        return false;
      }

      const hasChildSpansOrLinks = el.querySelector('span:not([data-cms-style="1"]), a, strong');
      if (hasChildSpansOrLinks && !hasDirectNonEmptyTextNode(el)) {
        return false;
      }

      return normalizeText(el.textContent || '').length > 0;
    };

    // 2. Apply database text_overrides, image_overrides, link_overrides
    const applyDatabaseCmsOverrides = () => {
      wrapMixedTextNodes();
      if (!liveSections.length) return;

      const textOverrides: Record<string, string> = {};
      const imageOverrides: Record<string, string> = {};
      const linkOverrides: Record<string, string> = {};

      for (const sec of liveSections) {
        const p = sec.payload || {};
        if (p.text_overrides && typeof p.text_overrides === 'object') {
          Object.assign(textOverrides, p.text_overrides);
        }
        if (p.image_overrides && typeof p.image_overrides === 'object') {
          Object.assign(imageOverrides, p.image_overrides);
        }
        if (p.link_overrides && typeof p.link_overrides === 'object') {
          Object.assign(linkOverrides, p.link_overrides);
        }
      }

      const textKeys = Object.keys(textOverrides);
      if (textKeys.length > 0) {
        const normTextMap: Record<string, string> = {};
        for (const k of textKeys) {
          normTextMap[normalizeText(k)] = textOverrides[k];
        }

        const sectionOccCounts: Record<string, number> = {};
        document.querySelectorAll<HTMLElement>(LEAF_SELECTOR).forEach((el) => {
          if (!isEligibleLeafTextElement(el)) return;
          const curNorm = normalizeText(el.textContent || '');
          if (!curNorm) return;
          if (!el.dataset.cmsInitialText) {
            const initialHtml = serializeEditableHtml(el);
            el.dataset.cmsInitialText = curNorm;
            el.dataset.cmsLastText = curNorm;
            el.dataset.cmsInitialHtml = initialHtml;
            el.dataset.cmsLastHtml = initialHtml;
          }
          const initNorm = el.dataset.cmsInitialText;
          const secAnchor = findSectionAnchor(el);
          const occKey = `${secAnchor}::${initNorm}`;
          const occIdx = sectionOccCounts[occKey] || 0;
          sectionOccCounts[occKey] = occIdx + 1;
          el.dataset.cmsOccIndex = String(occIdx);

          const scopedKey = `${initNorm}__occ_${occIdx}`;
          const replacement =
            normTextMap[scopedKey] !== undefined
              ? normTextMap[scopedKey]
              : normTextMap[initNorm] !== undefined
              ? normTextMap[initNorm]
              : normTextMap[curNorm];

          if (typeof replacement === 'string' && replacement !== curNorm) {
            if (/<(br|em|strong|b|i|u|span)\b/i.test(replacement)) {
              el.innerHTML = replacement;
            } else {
              el.textContent = replacement;
            }
            el.dataset.cmsLastText = normalizeText(el.textContent || '');
            el.dataset.cmsLastHtml = serializeEditableHtml(el);
          }
        });
      }

      const imgKeys = Object.keys(imageOverrides);
      if (imgKeys.length > 0) {
        const normImgMap: Record<string, string> = {};
        for (const k of imgKeys) {
          normImgMap[normalizeUrlPath(k)] = imageOverrides[k];
          normImgMap[k] = imageOverrides[k];
        }

        document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
          const rawSrc = img.getAttribute('src') || img.src;
          if (!rawSrc) return;
          if (!img.dataset.cmsInitialSrc) {
            img.dataset.cmsInitialSrc = rawSrc;
          }
          const initSrc = img.dataset.cmsInitialSrc;
          const nextSrc =
            normImgMap[normalizeUrlPath(initSrc)] ||
            normImgMap[initSrc] ||
            normImgMap[normalizeUrlPath(rawSrc)] ||
            normImgMap[rawSrc];
          if (nextSrc && img.getAttribute('src') !== nextSrc) {
            img.src = nextSrc;
          }
        });

        document.querySelectorAll<HTMLElement>('*').forEach((el) => {
          const bg = window.getComputedStyle(el).backgroundImage;
          const url = extractBgUrl(bg);
          if (url) {
            if (!el.dataset.cmsInitialSrc) {
              el.dataset.cmsInitialSrc = url;
            }
            const initUrl = el.dataset.cmsInitialSrc;
            const nextBg =
              normImgMap[normalizeUrlPath(initUrl)] ||
              normImgMap[initUrl] ||
              normImgMap[normalizeUrlPath(url)] ||
              normImgMap[url];
            if (nextBg) {
              el.style.setProperty('background-image', `url("${nextBg}")`, 'important');
            }
          }
        });

        const consultEl = document.querySelector<HTMLElement>('.robot-landing .consult');
        if (consultEl) {
          const beforeBg = window.getComputedStyle(consultEl, '::before').backgroundImage;
          const url = extractBgUrl(beforeBg);
          if (url) {
            if (!consultEl.dataset.cmsInitialSrc) consultEl.dataset.cmsInitialSrc = url;
            const initUrl = consultEl.dataset.cmsInitialSrc;
            const nextBg =
              normImgMap[normalizeUrlPath(initUrl)] ||
              normImgMap[initUrl] ||
              normImgMap[normalizeUrlPath(url)] ||
              normImgMap[url];
            if (nextBg) {
              consultEl.style.setProperty('--consult-bg', `url("${nextBg}")`);
            }
          }
        }

        const footerEl = document.querySelector<HTMLElement>('.robot-landing footer');
        if (footerEl) {
          const beforeBg = window.getComputedStyle(footerEl, '::before').backgroundImage;
          const url = extractBgUrl(beforeBg);
          if (url) {
            if (!footerEl.dataset.cmsInitialSrc) footerEl.dataset.cmsInitialSrc = url;
            const initUrl = footerEl.dataset.cmsInitialSrc;
            const nextBg =
              normImgMap[normalizeUrlPath(initUrl)] ||
              normImgMap[initUrl] ||
              normImgMap[normalizeUrlPath(url)] ||
              normImgMap[url];
            if (nextBg) {
              footerEl.style.setProperty('--footer-bg', `url("${nextBg}")`);
            }
          }
        }
      }

      const linkKeys = Object.keys(linkOverrides);
      if (linkKeys.length > 0) {
        document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
          const href = a.getAttribute('href') || '';
          if (!a.dataset.cmsInitialHref) a.dataset.cmsInitialHref = href;
          const initHref = a.dataset.cmsInitialHref;
          const nextHref = linkOverrides[initHref] || linkOverrides[href];
          if (nextHref) {
            a.setAttribute('href', nextHref);
          }
        });
      }
    };

    applyDatabaseCmsOverrides();

    if (!isPreview) {
      return;
    }

    let activeEl: HTMLElement | null = null;
    let activeImgTarget: ImageTargetCandidate | null = null;
    let isApplyingChanges = false;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      cms-text {
        display: inline;
      }
      [data-cms-editable="1"] {
        cursor: text !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        transition: outline 0.12s ease, background-color 0.12s ease;
      }
      [data-cms-editable="1"]:hover {
        outline: 2px dashed #1d4ed8 !important;
        outline-offset: 3px !important;
      }
      [data-cms-editable="1"]:focus {
        outline: 2px solid #1d4ed8 !important;
        outline-offset: 4px !important;
        background: rgba(219, 234, 254, 0.28) !important;
        caret-color: #be123c !important;
        border-radius: 2px;
      }
      img:hover {
        outline: 2px dashed #0284c7 !important;
        outline-offset: 2px !important;
      }
      input[placeholder]:hover, textarea[placeholder]:hover, select:hover {
        outline: 2px dashed #d97706 !important;
        outline-offset: 2px !important;
        cursor: pointer !important;
      }
      .cms-image-edit-btn {
        position: fixed;
        z-index: 99999;
        border: 2px solid #ffffff;
        border-radius: 999px;
        background: #ea580c;
        color: #ffffff;
        padding: 7px 14px;
        font: 700 12px/1.2 Roboto, Arial, sans-serif;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.55);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.12s ease, background-color 0.12s ease;
      }
      .cms-image-edit-btn[hidden] {
        display: none !important;
      }
      .cms-image-edit-btn:hover {
        background: #1d4ed8;
        transform: scale(1.06);
      }
    `;
    document.head.appendChild(styleEl);

    const mediaBtn = document.createElement('button');
    mediaBtn.type = 'button';
    mediaBtn.className = 'cms-image-edit-btn';
    mediaBtn.textContent = '🖼 Thay ảnh';
    mediaBtn.hidden = true;
    document.body.appendChild(mediaBtn);

    const enableInlineEditing = () => {
      if (isApplyingChanges) return;
      isApplyingChanges = true;
      try {
        wrapMixedTextNodes();
        const sectionOccCounts: Record<string, number> = {};

        document.querySelectorAll<HTMLElement>(LEAF_SELECTOR).forEach((el) => {
          if (!isEligibleLeafTextElement(el)) return;
          if (el.parentElement?.closest('[data-cms-editable="1"]')) {
            return;
          }

          const text = normalizeText(el.textContent || '');
          if (!text) return;

          if (!el.dataset.cmsInitialText) {
            const initialHtml = serializeEditableHtml(el);
            el.dataset.cmsInitialText = text;
            el.dataset.cmsLastText = text;
            el.dataset.cmsInitialHtml = initialHtml;
            el.dataset.cmsLastHtml = initialHtml;
          }

          const secAnchor = findSectionAnchor(el);
          const occKey = `${secAnchor}::${el.dataset.cmsInitialText}`;
          const occIdx = sectionOccCounts[occKey] || 0;
          sectionOccCounts[occKey] = occIdx + 1;
          el.dataset.cmsOccIndex = String(occIdx);

          el.dataset.cmsEditable = '1';
          el.contentEditable = 'true';
          el.spellcheck = false;
        });
      } finally {
        isApplyingChanges = false;
      }
    };

    enableInlineEditing();
    const observer = new MutationObserver(() => enableInlineEditing());
    observer.observe(document.body, { childList: true, subtree: true });

    const handleFocusIn = (e: FocusEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-cms-editable="1"]') as HTMLElement | null;
      if (!target) return;
      activeEl = target;
      const computed = window.getComputedStyle(target);
      const linkEl = target.closest('a') as HTMLAnchorElement | null;
      const href = linkEl?.getAttribute('href') || '';
      const payload = {
        anchor: findSectionAnchor(target),
        text: normalizeText(target.textContent || ''),
        fontSize: Math.round(parseFloat(computed.fontSize) * 2) / 2,
        fontWeight: computed.fontWeight,
        textAlign: computed.textAlign,
        fontFamily: computed.fontFamily,
        href,
      };
      window.parent.postMessage({ type: 'CMS_ELEMENT_FOCUSED', payload }, '*');
    };

    const handleInput = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-cms-editable="1"]') as HTMLElement | null;
      if (!target) return;

      const newText = normalizeText(target.textContent || '');
      if (!newText) return;

      const oldText = target.dataset.cmsLastText || target.dataset.cmsInitialText || '';
      const oldHtml = target.dataset.cmsLastHtml || target.dataset.cmsInitialHtml || oldText;
      const newHtml = serializeEditableHtml(target);

      target.dataset.cmsLastText = newText;
      target.dataset.cmsLastHtml = newHtml;

      const itemContainer = target.closest('[data-cms-item-index]') as HTMLElement | null;
      const rawItemIdx = itemContainer ? parseInt(itemContainer.dataset.cmsItemIndex || '', 10) : NaN;
      const itemIndex = Number.isNaN(rawItemIdx) ? undefined : rawItemIdx;
      const occurrenceIndex = parseInt(target.dataset.cmsOccIndex || '0', 10) || 0;

      window.parent.postMessage(
        {
          type: 'CMS_INLINE_TEXT_CHANGE',
          payload: {
            anchor: findSectionAnchor(target),
            oldText,
            newText,
            oldHtml,
            newHtml,
            itemIndex,
            occurrenceIndex,
          },
        },
        '*'
      );
    };

    let hideMediaBtnTimer: ReturnType<typeof setTimeout> | null = null;

    const findImageTargetAtPoint = (
      clientX: number,
      clientY: number
    ): ImageTargetCandidate | null => {
      const candidates: ImageTargetCandidate[] = [];

      const checkRectMatch = (
        type: ImageTargetCandidate['type'],
        el: HTMLElement,
        boxEl: HTMLElement,
        rawSrc: string
      ) => {
        if (!rawSrc) return;
        const r = boxEl.getBoundingClientRect();
        if (r.width < 18 || r.height < 18) return;
        if (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
        ) {
          if (!el.dataset.cmsInitialSrc) {
            el.dataset.cmsInitialSrc = rawSrc;
          }
          candidates.push({
            type,
            el,
            boxEl,
            src: rawSrc,
            initialSrc: el.dataset.cmsInitialSrc || rawSrc,
            area: r.width * r.height,
          });
        }
      };

      document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        const rawSrc = img.getAttribute('src') || img.src;
        const boxEl = img.classList.contains('hero-image')
          ? (img.closest('section') as HTMLElement) || img
          : img;
        checkRectMatch('img', img, boxEl, rawSrc);
      });

      document.querySelectorAll<HTMLElement>('*').forEach((el) => {
        if (el === mediaBtn || mediaBtn.contains(el)) return;
        const bg = window.getComputedStyle(el).backgroundImage;
        const url = extractBgUrl(bg);
        if (url) {
          checkRectMatch('bg', el, el, url);
        }
      });

      const consultEl = document.querySelector<HTMLElement>('.robot-landing .consult');
      if (consultEl) {
        const url = extractBgUrl(window.getComputedStyle(consultEl, '::before').backgroundImage);
        if (url) {
          checkRectMatch('pseudo-consult', consultEl, consultEl, url);
        }
      }

      const footerEl = document.querySelector<HTMLElement>('.robot-landing footer');
      if (footerEl) {
        const url = extractBgUrl(window.getComputedStyle(footerEl, '::before').backgroundImage);
        if (url) {
          checkRectMatch('pseudo-footer', footerEl, footerEl, url);
        }
      }

      if (candidates.length === 0) return null;
      candidates.sort((a, b) => a.area - b.area);
      return candidates[0];
    };

    const positionMediaBtnOverRect = (rect: DOMRect) => {
      const visLeft = Math.max(8, rect.left);
      const visRight = Math.min(window.innerWidth - 8, rect.right);
      const visTop = Math.max(8, rect.top);
      const visBottom = Math.min(window.innerHeight - 8, rect.bottom);
      const cx = (visLeft + visRight) / 2 - 48;
      const cy = (visTop + visBottom) / 2 - 16;
      mediaBtn.style.left = `${Math.max(8, Math.min(window.innerWidth - 108, cx))}px`;
      mediaBtn.style.top = `${Math.max(8, Math.min(window.innerHeight - 40, cy))}px`;
      mediaBtn.hidden = false;
    };

    const requestImageReplace = (imgTarget: ImageTargetCandidate | null) => {
      if (!imgTarget) return;
      const itemContainer = imgTarget.el.closest('[data-cms-item-index]') as HTMLElement | null;
      const rawItemIdx = itemContainer ? parseInt(itemContainer.dataset.cmsItemIndex || '', 10) : NaN;
      const itemIndex = Number.isNaN(rawItemIdx) ? undefined : rawItemIdx;
      const duoContainer = imgTarget.el.closest('.product-image.duo');
      let isSecondDuoImage = false;
      if (duoContainer && imgTarget.type === 'img') {
        const duoImgs = Array.from(duoContainer.querySelectorAll('img'));
        if (duoImgs.indexOf(imgTarget.el as HTMLImageElement) === 1) {
          isSecondDuoImage = true;
        }
      }

      window.parent.postMessage(
        {
          type: 'CMS_IMAGE_REPLACE_REQUEST',
          payload: {
            anchor: findSectionAnchor(imgTarget.el),
            currentSrc: imgTarget.initialSrc || imgTarget.src,
            liveSrc: imgTarget.src,
            itemIndex,
            isSecondDuoImage,
            alt: (imgTarget.el as HTMLImageElement).alt || 'Hình ảnh',
          },
        },
        '*'
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target === mediaBtn || (target && mediaBtn.contains(target))) {
        if (hideMediaBtnTimer) {
          clearTimeout(hideMediaBtnTimer);
          hideMediaBtnTimer = null;
        }
        return;
      }

      const found = findImageTargetAtPoint(e.clientX, e.clientY);
      if (found) {
        if (hideMediaBtnTimer) {
          clearTimeout(hideMediaBtnTimer);
          hideMediaBtnTimer = null;
        }
        activeImgTarget = found;
        const rect = (found.boxEl || found.el).getBoundingClientRect();
        positionMediaBtnOverRect(rect);
        return;
      }

      if (activeImgTarget && !mediaBtn.hidden) {
        const rect = (activeImgTarget.boxEl || activeImgTarget.el).getBoundingClientRect();
        const pad = 40;
        if (
          e.clientX >= rect.left - pad &&
          e.clientX <= rect.right + pad &&
          e.clientY >= rect.top - pad &&
          e.clientY <= rect.bottom + pad
        ) {
          return;
        }
        if (!hideMediaBtnTimer) {
          hideMediaBtnTimer = setTimeout(() => {
            mediaBtn.hidden = true;
            hideMediaBtnTimer = null;
          }, 650);
        }
      }
    };

    mediaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      requestImageReplace(activeImgTarget);
    });

    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const inputEl = target.closest('input, textarea') as HTMLInputElement | null;
      if (inputEl && inputEl.placeholder) {
        e.preventDefault();
        const nextVal = window.prompt('Sửa nội dung gợi ý (Placeholder):', inputEl.placeholder);
        if (nextVal !== null) inputEl.placeholder = nextVal;
        return;
      }
      const selectEl = target.closest('select') as HTMLSelectElement | null;
      if (selectEl && selectEl.options[selectEl.selectedIndex]) {
        e.preventDefault();
        const opt = selectEl.options[selectEl.selectedIndex];
        const nextVal = window.prompt('Sửa nội dung mục chọn:', opt.textContent || '');
        if (nextVal !== null) opt.textContent = nextVal;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target === mediaBtn || mediaBtn.contains(target)) return;

      // Direct click on foreground <img> opens image replacement modal if not clicking editable text
      const directImg = target.closest?.('img') as HTMLImageElement | null;
      if (directImg && !target.closest?.('[data-cms-editable="1"]')) {
        e.preventDefault();
        e.stopPropagation();
        const found = findImageTargetAtPoint(e.clientX, e.clientY);
        if (found) {
          activeImgTarget = found;
          requestImageReplace(found);
          return;
        }
      }
      const link = target.closest('a');
      if (link) e.preventDefault();
    };

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'SCROLL_TO' && data.anchor) {
        const cleanId = String(data.anchor).replace(/^#/, '');
        const el =
          document.getElementById(cleanId) ||
          document.querySelector(`[data-anchor="${cleanId}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (data.type === 'CMS_SYNC_SECTION_PAYLOAD' && data.sectionCode && data.payload) {
        let foundSec = false;
        for (let i = 0; i < liveSections.length; i++) {
          if (liveSections[i].section_code === data.sectionCode) {
            liveSections[i].payload = data.payload;
            foundSec = true;
            break;
          }
        }
        if (!foundSec) {
          liveSections.push({
            section_code: data.sectionCode,
            is_enabled: true,
            payload: data.payload,
          });
        }
        applyDatabaseCmsOverrides();
      } else if (data.type === 'CMS_FORMAT_COMMAND' && activeEl) {
        activeEl.focus();
        if (['bold', 'italic', 'underline', 'undo', 'redo'].includes(data.command)) {
          document.execCommand(data.command, false);
        } else if (data.command === 'clear') {
          document.execCommand('removeFormat', false);
          activeEl.style.fontSize = '';
          activeEl.style.fontWeight = '';
          activeEl.style.textAlign = '';
          activeEl.style.fontFamily = '';
        } else if (data.command === 'fontSize' && data.value) {
          activeEl.style.setProperty('font-size', `${data.value}px`, 'important');
        } else if (data.command === 'fontWeight' && data.value) {
          activeEl.style.setProperty('font-weight', String(data.value), 'important');
        } else if (data.command === 'textAlign' && data.value) {
          activeEl.style.setProperty('text-align', String(data.value), 'important');
        } else if (data.command === 'fontFamily' && data.value) {
          activeEl.style.setProperty('font-family', String(data.value), 'important');
        }
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      } else if ((data.type === 'CMS_APPLY_LINK' || data.type === 'CMS_UPDATE_LINK') && activeEl) {
        const link = (activeEl.closest('a') || activeEl) as HTMLAnchorElement;
        if (link && data.href) link.setAttribute('href', data.href);
        if (data.text) {
          activeEl.textContent = data.text;
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else if (data.type === 'CMS_APPLY_MEDIA' && (data.newSrc || data.newUrl)) {
        const targetUrl = data.newSrc || data.newUrl;
        if (activeImgTarget) {
          if (activeImgTarget.type === 'img') {
            (activeImgTarget.el as HTMLImageElement).src = targetUrl;
          } else if (activeImgTarget.type === 'pseudo-consult') {
            activeImgTarget.el.style.setProperty('--consult-bg', `url("${targetUrl}")`);
          } else if (activeImgTarget.type === 'pseudo-footer') {
            activeImgTarget.el.style.setProperty('--footer-bg', `url("${targetUrl}")`);
          } else {
            activeImgTarget.el.style.setProperty(
              'background-image',
              `url("${targetUrl}")`,
              'important'
            );
          }
          activeImgTarget.src = targetUrl;
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('input', handleInput);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('dblclick', handleDblClick);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('message', handleMessage);

    return () => {
      observer.disconnect();
      styleEl.remove();
      mediaBtn.remove();
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('input', handleInput);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('dblclick', handleDblClick);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('message', handleMessage);
    };
  }, [isPreview, sections]);

  return null;
}
