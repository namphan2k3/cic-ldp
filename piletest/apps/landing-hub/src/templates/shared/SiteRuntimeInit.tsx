'use client';

import { useEffect } from 'react';

interface SiteRuntimeInitProps {
  siteCode: string;
  siteName: string;
  locale: 'vi' | 'en' | 'zh';
  isPreview?: boolean;
  hotline: string;
  sections: Array<{
    section_code: string;
    is_enabled: boolean;
    payload: Record<string, any>;
  }>;
  formConfig?: any;
  vendorScripts?: string[];
  inlineInitScripts?: string[];
  isLadiPage?: boolean;
  ladiEventDataJson?: string;
  ladiCdnUrl?: string;
  bitrixLoaderUrl?: string;
}

function loadScriptSequentially(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[data-cic-runtime-src="${src}"]`);
    if (existing) {
      existing.remove();
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.dataset.cicRuntimeSrc = src;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.body.appendChild(s);
  });
}

export function SiteRuntimeInit({
  siteCode,
  siteName,
  locale,
  isPreview = false,
  hotline,
  sections,
  formConfig,
  vendorScripts = [],
  inlineInitScripts = [],
  isLadiPage = false,
  ladiEventDataJson,
  ladiCdnUrl,
  bitrixLoaderUrl,
}: SiteRuntimeInitProps) {
  useEffect(() => {
    let cancelled = false;

    // Temporarily disable global Next.js Tailwind CSS stylesheet while on a legacy/LadiPage site
    // and restore it immediately upon unmounting so navigating back to Master Hub / Admin never loses CSS
    const setNextGlobalCssDisabled = (disabled: boolean) => {
      const nextCssLinks = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"][href*="/_next/static/"]'
      );
      nextCssLinks.forEach((lnk) => {
        lnk.disabled = disabled;
      });
    };
    setNextGlobalCssDisabled(true);

    const w = window as any;
    w.__CIC_SITE_CONTEXT__ = {
      siteCode,
      siteName,
      locale,
      isPreview,
      hotline,
      sections,
      formConfig: formConfig || null,
    };

    if (isLadiPage) {
      w.ladi_viewport = function (b?: string) {
        const a = document;
        const prop = b || 'innerWidth';
        const c = w[prop];
        const d = c < 768;
        if (typeof w.ladi_is_desktop === 'undefined') {
          w.ladi_is_desktop = !d;
        }
      };
      w.ladi_viewport();
      w.ladi_fbq_data = w.ladi_fbq_data || [];
      w.ladi_fbq =
        w.ladi_fbq ||
        function (...args: any[]) {
          w.ladi_fbq_data.push(args);
        };
      w.ladi_ttq_data = w.ladi_ttq_data || [];
      w.ladi_ttq =
        w.ladi_ttq ||
        function (...args: any[]) {
          w.ladi_ttq_data.push(args);
        };
      w.lazyload_run = function (dom: Document) {
        document.body.classList.remove('lazyload');
        return dom;
      };
    }

    async function bootRuntime() {
      for (const src of vendorScripts) {
        if (cancelled) return;
        await loadScriptSequentially(src);
      }

      if (cancelled) return;

      if (isLadiPage && w.LadiPageAppV2 && w.LadiPageScript) {
        try {
          w.LadiPageApp = new w.LadiPageAppV2();
          w.LadiPageScript.runtime.ladipage_id = siteCode;
          w.LadiPageScript.runtime.publish_platform = 'LADIPAGEDNS';
          w.LadiPageScript.runtime.version = '1715853815925';
          w.LadiPageScript.runtime.cdn_url =
            ladiCdnUrl || `/sites/${siteCode}/ladicdn/w.ladicdn.com/v4/source/`;
          w.LadiPageScript.runtime.DOMAIN_SET_COOKIE = [
            'cic.com.vn',
            'localhost',
            '127.0.0.1',
            w.location.hostname,
          ];
          w.LadiPageScript.runtime.DOMAIN_FREE = ['preview.ldp.page', 'ldp.link', 'ldp.page'];
          w.LadiPageScript.runtime.bodyFontSize = 12;
          w.LadiPageScript.runtime.store_id = '';
          w.LadiPageScript.runtime.time_zone = 7;
          w.LadiPageScript.runtime.currency = 'VND';
          w.LadiPageScript.runtime.convert_replace_str = true;
          w.LadiPageScript.runtime.desktop_width = 960;
          w.LadiPageScript.runtime.mobile_width = 420;
          w.LadiPageScript.runtime.formdata = false;
          w.LadiPageScript.runtime.tracking_button_click = true;
          w.LadiPageScript.runtime.lang = locale;
          if (
            ladiEventDataJson &&
            typeof w.LadiPageScript.deOptimizeEventData !== 'function'
          ) {
            w.LadiPageScript.runtime.eventData = encodeURIComponent(ladiEventDataJson);
          } else if (w.LadiPageScript.runtime) {
            delete w.LadiPageScript.runtime.eventData;
          }
          w.LadiPageScript.run(true);
          w.LadiPageScript.runEventScroll();

          // Remove any LadiPage watermark badge if injected on localhost, without touching Bitrix24 (.b24-widget-button-*)
          const cleanWatermark = () => {
            document
              .querySelectorAll('body > div:not([id]):not(.cic-modal-root)')
              .forEach((el) => {
                if (
                  el.querySelector('[class*="b24-"], [data-b24-crm-button-cont]') ||
                  (typeof el.className === 'string' && el.className.includes('b24-'))
                ) {
                  return;
                }
                if (
                  el.innerHTML.includes('ladipage') ||
                  el.textContent?.toLowerCase().includes('ladipage')
                ) {
                  el.remove();
                }
              });
          };
          cleanWatermark();
          setTimeout(cleanWatermark, 500);
          setTimeout(cleanWatermark, 1500);
        } catch (err) {
          console.warn('LadiPage runtime init warning:', err);
        }
      }

      if (bitrixLoaderUrl && !isPreview) {
        try {
          const existingB24 = document.querySelector('.b24-widget-button-wrapper');
          if (!existingB24) {
            const cacheBusterUrl = `${bitrixLoaderUrl}?${(Date.now() / 60000) | 0}`;
            await loadScriptSequentially(cacheBusterUrl);
            if (document.readyState !== 'complete') {
              window.dispatchEvent(new Event('DOMContentLoaded'));
            }
          }
        } catch (err) {
          console.warn('Bitrix24 widget init warning:', err);
        }
      }

      for (const code of inlineInitScripts) {
        if (cancelled) return;
        try {
          const fn = new Function(code);
          fn();
        } catch {
          // ignore non-critical legacy inline init errors
        }
      }

      // Trigger load & resize events for jQuery $(window).load(...) handlers (sliders, preloaders, Vegas, FlexSlider)
      window.dispatchEvent(new Event('load'));
      window.dispatchEvent(new Event('resize'));
      if (w.jQuery) {
        try {
          w.jQuery(window).trigger('load');
          w.jQuery(window).trigger('resize');
        } catch {}
      }

      // Reset bridge flag so landing-cms-workflow-bridge.js binds cleanly to the current React DOM
      w.__CIC_BRIDGE_INITIALIZED__ = false;
      await loadScriptSequentially('/sites/landing-cms-workflow-bridge.js?v=20261026-react');
    }

    bootRuntime();

    return () => {
      cancelled = true;
      setNextGlobalCssDisabled(false);
    };
  }, [siteCode, locale, isPreview]);

  if (isLadiPage && ladiEventDataJson) {
    return (
      <script
        id="script_event_data"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: ladiEventDataJson }}
      />
    );
  }

  return null;
}
