'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  saveMultipleSectionsPayloadAction,
  publishPageRevisionsAction,
  updatePageSeoAction,
} from '../../actions';
import { CmsStickyToolbar, FocusedElementInfo } from './CmsStickyToolbar';
import { CmsLinkContactToolbar } from './CmsLinkContactToolbar';
import { CmsSeoGoogleCard } from './CmsSeoGoogleCard';
import { CmsYoutubeEmbedCard } from './CmsYoutubeEmbedCard';
import { CmsPublishConfirmModal } from './CmsPublishConfirmModal';
import { CmsModalEditorCard } from './CmsModalEditorCard';
import {
  SECTION_LABELS,
  SECTION_ANCHORS,
  replaceTextInPayload,
  replaceImageInPayload,
  applySlotMediaToPayload,
  syncPayloadWithOverrides,
} from './cmsPayloadUtils';
import { GuidedSectionForm } from '../GuidedSectionForm';
import { MediaDrawer } from '../MediaDrawer';

interface SectionItem {
  id: string;
  section_code: string;
  section_type: string;
  sort_order: number;
  is_enabled: boolean;
  published_payload_json: Record<string, any>;
  draft_payload_json: Record<string, any> | null;
}

interface SiteCmsEditorLayoutProps {
  siteCode: string;
  publicUrl: string;
  locale: string;
  supportedLocales?: string[];
  pageId: string;
  initialSeoTitle: string;
  initialSeoDesc: string;
  sections: SectionItem[];
  isStandalone?: boolean;
}

function resolveSectionCodeFromAnchor(anchor: string | undefined, sections: SectionItem[]): string | null {
  if (!anchor) return null;
  const clean = anchor.replace(/^#/, '').toLowerCase();
  for (const [code, mappedAnchor] of Object.entries(SECTION_ANCHORS)) {
    if (mappedAnchor.replace(/^#/, '').toLowerCase() === clean || code.toLowerCase() === clean) {
      if (sections.some((s) => s.section_code === code)) return code;
    }
  }
  const direct = sections.find((s) => s.section_code.toLowerCase() === clean);
  return direct ? direct.section_code : null;
}

export function SiteCmsEditorLayout({
  siteCode,
  publicUrl,
  locale,
  supportedLocales = ['vi', 'en'],
  pageId,
  initialSeoTitle,
  initialSeoDesc,
  sections,
  isStandalone = false,
}: SiteCmsEditorLayoutProps) {
  const [activeCode, setActiveCode] = useState(sections[0]?.section_code || 'header');
  const [payloadsMap, setPayloadsMap] = useState<Record<string, Record<string, any>>>(() => {
    const map: Record<string, Record<string, any>> = {};
    for (const s of sections) {
      map[s.section_code] = s.draft_payload_json || s.published_payload_json || {};
    }
    return map;
  });
  const [dirtyCodes, setDirtyCodes] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle);
  const [seoDesc, setSeoDesc] = useState(initialSeoDesc);
  const [seoDirty, setSeoDirty] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'pc'>('pc');
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved');
  const [hasDraft, setHasDraft] = useState(() => sections.some((s) => s.draft_payload_json !== null));
  const [focusedEl, setFocusedEl] = useState<FocusedElementInfo | null>(null);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [showModalEditor, setShowModalEditor] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [pendingImgSrc, setPendingImgSrc] = useState<string | null>(null);
  const [pendingImgMeta, setPendingImgMeta] = useState<{
    liveSrc?: string;
    itemIndex?: number;
    isSecondDuoImage?: boolean;
  } | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const markDirty = (code: string) => {
    setDirtyCodes((prev) => (prev.includes(code) ? prev : [...prev, code]));
    setSaveState('dirty');
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'CMS_ELEMENT_FOCUSED') {
        setFocusedEl(msg.payload);
        const resolved = resolveSectionCodeFromAnchor(msg.payload?.anchor, sections);
        if (resolved) setActiveCode(resolved);
      } else if (msg.type === 'CMS_INLINE_TEXT_CHANGE') {
        const {
          anchor,
          oldText,
          newText,
          oldHtml,
          newHtml,
          itemIndex,
          occurrenceIndex,
          overrideKey,
        } = msg.payload || {};
        const hinted = resolveSectionCodeFromAnchor(anchor, sections);
        if (hinted) setActiveCode(hinted);

        setPayloadsMap((prev) => {
          const next = { ...prev };
          const orderedCodes = hinted
            ? [hinted, ...Object.keys(prev).filter((c) => c !== hinted)]
            : Object.keys(prev);

          let anyReplaced = false;
          for (const code of orderedCodes) {
            const { updated, replaced } = replaceTextInPayload(
              prev[code] || {},
              oldText,
              newText,
              { oldHtml, newHtml, itemIndex, occurrenceIndex }
            );
            if (replaced) {
              next[code] = updated;
              markDirty(code);
              anyReplaced = true;
              break;
            }
          }
          if (!anyReplaced && oldText && newText && oldText !== newText) {
            const targetCode = hinted || orderedCodes[0] || 'hero';
            const curSecPayload = next[targetCode] || {};
            const curOverrides = { ...(curSecPayload.text_overrides || {}) };
            const keyToUse = overrideKey || oldText;
            const valToUse =
              newHtml && /<(br|em|strong|b|i|u|span)\b/i.test(newHtml)
                ? newHtml
                : newText;
            // If an earlier key mapped to oldText, update that key in place
            let updatedExistingKey = false;
            if (!overrideKey) {
              for (const [k, v] of Object.entries(curOverrides)) {
                if (v === oldText || v === oldHtml) {
                  curOverrides[k] = valToUse;
                  updatedExistingKey = true;
                }
              }
            }
            if (!updatedExistingKey) {
              curOverrides[keyToUse] = valToUse;
            }
            next[targetCode] = { ...curSecPayload, text_overrides: curOverrides };
            markDirty(targetCode);
          }
          return next;
        });
      } else if (msg.type === 'CMS_IMAGE_REPLACE_REQUEST') {
        const resolved = resolveSectionCodeFromAnchor(msg.payload?.anchor, sections);
        if (resolved) setActiveCode(resolved);
        setPendingImgSrc(msg.payload?.currentSrc || null);
        setPendingImgMeta({
          liveSrc: msg.payload?.liveSrc,
          itemIndex: msg.payload?.itemIndex,
          isSecondDuoImage: msg.payload?.isSecondDuoImage,
        });
        setMediaOpen(true);
      } else if (msg.type === 'CMS_MODAL_OPENED') {
        if (msg.sectionCode) setActiveCode(msg.sectionCode);
        setShowModalEditor(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [sections]);

  const handleSaveDraft = async () => {
    setSaveState('saving');
    const codesToSave = dirtyCodes.length > 0 ? dirtyCodes : [activeCode];
    const items = codesToSave
      .map((code) => {
        const sec = sections.find((s) => s.section_code === code);
        if (!sec) return null;
        return { sectionId: sec.id, payload: payloadsMap[code] || {} };
      })
      .filter((x): x is { sectionId: string; payload: Record<string, any> } => Boolean(x));

    const res = await saveMultipleSectionsPayloadAction(items, false);
    if (seoDirty || codesToSave.includes('header')) {
      await updatePageSeoAction(pageId, seoTitle, seoDesc);
      setSeoDirty(false);
    }
    if (res.success) {
      setSaveState('saved');
      setDirtyCodes([]);
      setHasDraft(true);
    } else {
      setSaveState('error');
    }
  };

  const handlePublishConfirm = async () => {
    setIsPublishing(true);
    if (saveState === 'dirty') await handleSaveDraft();
    const res = await publishPageRevisionsAction(
      pageId,
      `Xuất bản CMS (${locale.toUpperCase()})`
    );
    setIsPublishing(false);
    setPublishModalOpen(false);
    if (res.success) {
      setHasDraft(false);
      setPreviewKey((k) => k + 1);
    }
  };

  const postToIframe = (data: Record<string, any>) => {
    iframeRef.current?.contentWindow?.postMessage(data, '*');
  };

  const activePayload = payloadsMap[activeCode] || {};
  const sectionLabel = SECTION_LABELS[activeCode] || activeCode;
  const widthCls =
    device === 'mobile' ? 'max-w-[430px]' : device === 'tablet' ? 'max-w-[820px]' : 'max-w-full';

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-[#0b1b36] sm:text-xl">
            Chỉnh sửa Nội dung Trang ({locale.toUpperCase()})
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Đang chọn khu vực: <strong className="text-[#0b1b36]">{sectionLabel}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeCode}
            onChange={(e) => {
              const code = e.target.value;
              setActiveCode(code);
              postToIframe({ type: 'SCROLL_TO', anchor: SECTION_ANCHORS[code] || '#header' });
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
            title="Cuộn nhanh tới một khu vực trên trang"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.section_code}>
                Cuộn tới: {SECTION_LABELS[sec.section_code] || sec.section_code}
              </option>
            ))}
          </select>

          {(supportedLocales.length > 0 ? supportedLocales : ['vi']).map((lang) => (
            <Link
              key={lang}
              href={`/admin/${siteCode}?lang=${lang}&tab=edit`}
              className={`rounded-lg px-3 py-2 text-xs font-bold uppercase ${
                locale === lang
                  ? 'bg-[#0b1b36] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lang === 'zh' ? 'ZH (CN)' : lang}
            </Link>
          ))}

          <span
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              hasDraft || saveState === 'dirty'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {hasDraft || saveState === 'dirty'
              ? `Có thay đổi nháp (${dirtyCodes.length || 1} mục)`
              : 'Đã đồng bộ với Website'}
          </span>

          <a
            href={
              isStandalone
                ? locale !== 'vi'
                  ? `/?lang=${locale}`
                  : '/'
                : `/s/${siteCode}?lang=${locale}&preview=1`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Xem toàn trang
          </a>

          <button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#c2410c]"
          >
            Xuất bản
          </button>
        </div>
      </div>

      <CmsStickyToolbar
        device={device}
        onChangeDevice={setDevice}
        saveState={saveState}
        onSaveDraft={handleSaveDraft}
        focusedElement={focusedEl}
        onFormatCommand={(command, value) =>
          postToIframe({ type: 'CMS_FORMAT_COMMAND', command, value })
        }
        showFormPanel={showFormPanel}
        onToggleFormPanel={() => setShowFormPanel((v) => !v)}
        showModalEditor={showModalEditor}
        onToggleModalEditor={() => setShowModalEditor((v) => !v)}
        onOpenMediaDrawer={() => {
          setPendingImgSrc(null);
          setMediaOpen(true);
        }}
      />

      {showModalEditor && (
        <CmsModalEditorCard
          siteCode={siteCode}
          locale={locale}
          payloadsMap={payloadsMap}
          onChangeSectionPayload={(sectionCode, next) => {
            setPayloadsMap((prev) => {
              const synced = syncPayloadWithOverrides(prev[sectionCode] || {}, next);
              postToIframe({
                type: 'CMS_SYNC_SECTION_PAYLOAD',
                sectionCode,
                payload: synced,
              });
              return { ...prev, [sectionCode]: synced };
            });
            markDirty(sectionCode);
          }}
          onOpenMediaForSlot={(sectionCode, slotKey) => {
            setActiveCode(sectionCode);
            setPendingImgSrc(`__SLOT__:${slotKey}`);
            setMediaOpen(true);
          }}
          onToggleIframeModal={(modal, open, mode) => {
            if (modal === 'comparison_pdf') {
              setActiveCode('comparison');
              postToIframe({ type: 'SCROLL_TO', anchor: '#comparison' });
            } else {
              setActiveCode('consultation_form');
              postToIframe({ type: 'SCROLL_TO', anchor: '#dang-ky' });
            }
            postToIframe({ type: 'CMS_TOGGLE_MODAL', modal, open, mode });
          }}
          onClosePanel={() => setShowModalEditor(false)}
        />
      )}

      <CmsLinkContactToolbar
        sectionCode={activeCode}
        payload={activePayload}
        focusedHref={focusedEl?.href}
        focusedText={focusedEl?.text}
        onUpdatePayloadField={(k, val) => {
          setPayloadsMap((prev) => {
            const cur = prev[activeCode] || {};
            const synced = syncPayloadWithOverrides(cur, { ...cur, [k]: val });
            postToIframe({
              type: 'CMS_SYNC_SECTION_PAYLOAD',
              sectionCode: activeCode,
              payload: synced,
            });
            return {
              ...prev,
              [activeCode]: synced,
            };
          });
          markDirty(activeCode);
        }}
        onApplyIframeLink={(href, text) => {
          if (focusedEl?.href && href && focusedEl.href !== href) {
            setPayloadsMap((prev) => {
              const curSecPayload = prev[activeCode] || {};
              const curLinks = { ...(curSecPayload.link_overrides || {}) };
              curLinks[focusedEl.href!] = href;
              return {
                ...prev,
                [activeCode]: { ...curSecPayload, link_overrides: curLinks },
              };
            });
            markDirty(activeCode);
          }
          postToIframe({ type: 'CMS_APPLY_LINK', href, text });
        }}
      />

      {showFormPanel && (
        <div className="mb-4 space-y-4 rounded-xl border border-orange-200 bg-white p-5 shadow-md">
          <CmsSeoGoogleCard
            publicUrl={publicUrl}
            locale={locale}
            seoTitle={seoTitle}
            seoDescription={seoDesc}
            onChangeSeo={(t, d) => {
              setSeoTitle(t);
              setSeoDesc(d);
              setSeoDirty(true);
              setSaveState('dirty');
            }}
          />
          <CmsYoutubeEmbedCard
            sectionCode={activeCode}
            payload={activePayload}
            onChangePayload={(next) => {
              setPayloadsMap((prev) => {
                const synced = syncPayloadWithOverrides(prev[activeCode] || {}, next);
                postToIframe({
                  type: 'CMS_SYNC_SECTION_PAYLOAD',
                  sectionCode: activeCode,
                  payload: synced,
                });
                return { ...prev, [activeCode]: synced };
              });
              markDirty(activeCode);
            }}
          />
          <GuidedSectionForm
            sectionCode={activeCode}
            payload={activePayload}
            onChange={(next) => {
              setPayloadsMap((prev) => {
                const synced = syncPayloadWithOverrides(prev[activeCode] || {}, next);
                postToIframe({
                  type: 'CMS_SYNC_SECTION_PAYLOAD',
                  sectionCode: activeCode,
                  payload: synced,
                });
                return { ...prev, [activeCode]: synced };
              });
              markDirty(activeCode);
            }}
            onOpenMediaDrawer={(slotKey) => {
              setPendingImgSrc(`__SLOT__:${slotKey}`);
              setMediaOpen(true);
            }}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-200/70 p-3 shadow-inner">
        <div className={`mx-auto transition-all duration-300 ${widthCls}`}>
          <iframe
            ref={iframeRef}
            key={`${siteCode}-${locale}-${previewKey}`}
            src={`/s/${siteCode}?lang=${locale}&preview=1`}
            title="CMS Direct Full-Page Visual Preview"
            className="h-[860px] w-full rounded-xl border border-slate-300 bg-white shadow-lg"
          />
        </div>
      </div>

      <MediaDrawer
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        siteCode={siteCode}
        onSelectImage={(newUrl) => {
          if (pendingImgSrc?.startsWith('__SLOT__:')) {
            const slotKey = pendingImgSrc.slice(9);
            setPayloadsMap((prev) => {
              const cur = prev[activeCode] || {};
              const updatedSlot = applySlotMediaToPayload(cur, slotKey, newUrl);
              const synced = syncPayloadWithOverrides(cur, updatedSlot);
              postToIframe({
                type: 'CMS_SYNC_SECTION_PAYLOAD',
                sectionCode: activeCode,
                payload: synced,
              });
              return {
                ...prev,
                [activeCode]: synced,
              };
            });
            markDirty(activeCode);
          } else if (pendingImgSrc) {
            setPayloadsMap((prev) => {
              const next = { ...prev };
              const orderedCodes = [
                activeCode,
                ...Object.keys(prev).filter((c) => c !== activeCode),
              ];
              let targetSavedCode = activeCode || orderedCodes[0] || 'hero';
              let anyImgReplaced = false;
              for (const code of orderedCodes) {
                const { updated, replaced } = replaceImageInPayload(
                  prev[code] || {},
                  pendingImgSrc,
                  newUrl,
                  code === activeCode ? pendingImgMeta || undefined : undefined
                );
                if (replaced) {
                  next[code] = updated;
                  targetSavedCode = code;
                  markDirty(code);
                  anyImgReplaced = true;
                  break;
                }
              }

              // Always record in image_overrides as well so default fallback images & repeated replacements persist
              const curSecPayload = next[targetSavedCode] || {};
              const curImgOverrides = { ...(curSecPayload.image_overrides || {}) };
              for (const [k, v] of Object.entries(curImgOverrides)) {
                if (v === pendingImgSrc || (pendingImgMeta?.liveSrc && v === pendingImgMeta.liveSrc)) {
                  curImgOverrides[k] = newUrl;
                }
              }
              curImgOverrides[pendingImgSrc] = newUrl;
              next[targetSavedCode] = { ...curSecPayload, image_overrides: curImgOverrides };
              markDirty(targetSavedCode);
              return next;
            });
            postToIframe({ type: 'CMS_APPLY_MEDIA', newSrc: newUrl });
          }
        }}
      />

      <CmsPublishConfirmModal
        isOpen={publishModalOpen}
        locale={locale}
        isPublishing={isPublishing}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handlePublishConfirm}
      />
    </div>
  );
}
