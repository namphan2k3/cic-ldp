(function () {
  if (window.__CIC_BRIDGE_INITIALIZED__) return;
  window.__CIC_BRIDGE_INITIALIZED__ = true;

  var ctx = window.__CIC_SITE_CONTEXT__ || {};
  var siteCode = ctx.siteCode || '';
  var locale = ctx.locale || 'vi';
  var isPreview = Boolean(ctx.isPreview) || window.location.search.indexOf('preview=1') !== -1;
  var sections = Array.isArray(ctx.sections) ? ctx.sections : [];
  var formConfig = ctx.formConfig || null;
  var hotline = ctx.hotline || '0866 059 659';

  // Exact canonical section_code -> DOM element ID per site
  var SITE_SECTION_MAP = {
    allplan: {
      header: 'SECTION16',
      hero: 'SECTION16',
      intro: 'SECTION121',
      advantages: 'SECTION580',
      catalog: 'SECTION948',
      comparison: 'SECTION976',
      requirements: 'SECTION958',
      resources: 'SECTION963',
      consultation_form: 'SECTION671',
      faq: 'SECTION1005',
      footer: 'SECTION704',
    },
    bim: {
      header: 'SECTION16',
      hero: 'SECTION16',
      intro: 'SECTION977',
      advantages: 'SECTION2',
      catalog: 'SECTION1084',
      comparison: 'SECTION1025',
      requirements: 'SECTION1025',
      resources: 'SECTION1119',
      consultation_form: 'SECTION671',
      faq: 'SECTION1119',
      footer: 'SECTION704',
    },
    enjicad: {
      header: 'SECTION2',
      hero: 'SECTION2',
      intro: 'SECTION676',
      advantages: 'SECTION896',
      catalog: 'SECTION241',
      comparison: 'SECTION1277',
      requirements: 'SECTION1142',
      resources: 'SECTION1257',
      faq: 'SECTION1209',
      consultation_form: 'SECTION305',
      footer: 'SECTION971',
    },
    escon: {
      header: 'header2',
      hero: 'banner',
      intro: 'intro',
      advantages: 'feature',
      catalog: 'more_feature',
      comparison: 'price',
      requirements: 'whychoose',
      resources: 'download',
      faq: 'faq',
      consultation_form: 'contact',
      footer: 'footer',
    },
    revit: {
      header: 'top',
      hero: 'top',
      intro: 'about',
      advantages: 'reason',
      catalog: 'features',
      comparison: 'pricing',
      requirements: 'benefit',
      resources: 'video',
      faq: 'client',
      consultation_form: 'contact',
      footer: 'contact-info',
    },
    autocad: {
      header: 'home',
      hero: 'home',
      intro: 'getting-started',
      advantages: 'features',
      catalog: 'whyreason',
      comparison: 'pricing',
      requirements: 'require',
      resources: 'download',
      faq: 'client',
      consultation_form: 'contact',
      footer: 'contact',
    },
    cubicost: {
      header: 'SECTION16',
      hero: 'SECTION16',
      intro: 'SECTION121',
      advantages: 'SECTION2',
      catalog: 'SECTION580',
      comparison: 'SECTION853',
      consultation_form: 'SECTION671',
      footer: 'SECTION704',
    },
    enjicadpro: {
      header: 'SECTION2',
      hero: 'SECTION2',
      intro: 'SECTION676',
      advantages: 'SECTION896',
      catalog: 'SECTION241',
      comparison: 'SECTION1179',
      requirements: 'SECTION1078',
      resources: 'SECTION985',
      faq: 'SECTION1137',
      consultation_form: 'SECTION305',
      footer: 'SECTION971',
    },
    piletest: {
      header: 'SECTION191',
      hero: 'SECTION191',
      intro: 'SECTION23',
      advantages: 'SECTION7',
      catalog: 'SECTION69',
      comparison: 'SECTION116',
      consultation_form: 'SECTION314',
      footer: 'SECTION322',
    },
    foxit: {
      header: 'SECTION2',
      hero: 'SECTION2',
      intro: 'SECTION676',
      advantages: 'SECTION896',
      catalog: 'SECTION241',
      comparison: 'SECTION1179',
      requirements: 'SECTION1078',
      resources: 'SECTION985',
      faq: 'SECTION1137',
      consultation_form: 'SECTION305',
      footer: 'SECTION971',
    },
    maydocapngam: {
      header: 'SECTION191',
      hero: 'SECTION191',
      intro: 'ThongSo',
      advantages: 'Uudiem',
      catalog: 'Caitien',
      comparison: 'SECTION116',
      consultation_form: 'Lienhe',
      footer: 'Lienhe',
    },
    cabinetvision: {
      header: 'SECTION16',
      hero: 'SECTION16',
      intro: 'SECTION977',
      advantages: 'SECTION2',
      catalog: 'SECTION1143',
      comparison: 'SECTION1031',
      consultation_form: 'SECTION1197',
      footer: 'SECTION704',
    },
  };

  var ANCHOR_ALIAS_TO_CODE = {
    header: 'header',
    hero: 'hero',
    'gioi-thieu': 'intro',
    intro: 'intro',
    advantages: 'advantages',
    comparison: 'comparison',
    requirements: 'requirements',
    resources: 'resources',
    robot: 'catalog',
    catalog: 'catalog',
    'dang-ky': 'consultation_form',
    consultation_form: 'consultation_form',
    faq: 'faq',
    footer: 'footer',
  };

  function getSectionPayload(code) {
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].section_code === code) {
        return sections[i].payload || {};
      }
    }
    return {};
  }

  function normalizeText(s) {
    return String(s || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeUrlPath(rawUrl) {
    if (!rawUrl) return '';
    try {
      var u = new URL(rawUrl, window.location.origin);
      return decodeURIComponent(u.pathname + u.search);
    } catch (e) {
      return String(rawUrl).trim();
    }
  }

  function extractBgUrl(bgVal) {
    if (!bgVal || bgVal === 'none') return '';
    var m = bgVal.match(/url\(["']?([^"')]+)["']?\)/i);
    return m ? m[1] : '';
  }

  // 1. Ensure page preloaders never hang & eager-load LadiPage lazy backgrounds
  function dismissPreloaders() {
    var ids = ['preloader', 'loader', 'loading', 'page-loader'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.display = 'none';
      }
    }
    var lazies = document.querySelectorAll('.lazyload, .ladi-lazyload');
    for (var l = 0; l < lazies.length; l++) {
      lazies[l].classList.remove('lazyload', 'ladi-lazyload');
    }
  }
  setTimeout(dismissPreloaders, 500);
  window.addEventListener('load', function () {
    setTimeout(dismissPreloaders, 120);
  });

  function wrapMixedTextNodes() {
    var lazies = document.querySelectorAll('.lazyload, .ladi-lazyload');
    for (var l = 0; l < lazies.length; l++) {
      lazies[l].classList.remove('lazyload', 'ladi-lazyload');
    }
    if (typeof document.createTreeWalker !== 'function') return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var toWrap = [];
    var tNode;
    while ((tNode = walker.nextNode())) {
      var val = normalizeText(tNode.nodeValue);
      if (!val) continue;
      var p = tNode.parentElement;
      if (!p) continue;
      if (
        p.tagName === 'CMS-TEXT' ||
        p.closest(
          'script, style, svg, noscript, option, textarea, .cms-image-edit-btn, [data-cms-no-edit="1"], .cic-workflow-slot, .cic-modal-root'
        )
      ) {
        continue;
      }
      var hasBlocking = p.querySelector(
        'div, section, article, ul, ol, table, p, h1, h2, h3, h4, h5, h6, img, svg, input, select, textarea, button, label, i[class]'
      );
      if (!hasBlocking) {
        var childSpans = p.querySelectorAll('span:not([data-cms-style="1"])');
        for (var s = 0; s < childSpans.length; s++) {
          if (window.getComputedStyle(childSpans[s]).display !== 'inline') {
            hasBlocking = childSpans[s];
            break;
          }
        }
      }
      if (hasBlocking) {
        toWrap.push(tNode);
      }
    }
    for (var w = 0; w < toWrap.length; w++) {
      var tn = toWrap[w];
      if (!tn.parentNode || (tn.parentElement && tn.parentElement.tagName === 'CMS-TEXT')) continue;
      var wrapper = document.createElement('cms-text');
      tn.parentNode.insertBefore(wrapper, tn);
      wrapper.appendChild(tn);
    }
  }

  var LEAF_TEXT_SELECTOR =
    'h1, h2, h3, h4, h5, h6, p, span, a, strong, em, b, li, summary, figcaption, td, th, label, button, div, dt, dd, cms-text, .ladi-headline, .ladi-paragraph';

  function isEligibleStaticLeafText(el) {
    if (!el || !el.closest) return false;
    if (
      el.dataset.cmsNoEdit === '1' ||
      el.closest(
        '[data-cms-no-edit="1"], .cms-image-edit-btn, script, style, svg, noscript, option, textarea, .cic-workflow-slot, .cic-modal-root'
      )
    ) {
      return false;
    }
    if (
      el.querySelector(
        'div, section, article, ul, ol, table, p, h1, h2, h3, h4, h5, h6, img, svg, input, select, textarea, button, label, cms-text'
      )
    ) {
      return false;
    }
    if (
      el.children.length === 1 &&
      el.children[0].getAttribute('data-cms-style') !== '1' &&
      normalizeText(el.children[0].textContent) === normalizeText(el.textContent)
    ) {
      return false;
    }
    return normalizeText(el.textContent).length > 0;
  }

  // 2. Apply Database CMS Overrides (Text, Images, Background Images, Links, Section Visibility)
  function applyDatabaseCmsOverrides() {
    wrapMixedTextNodes();
    if (!sections || !sections.length) return;

    var textOverrides = {};
    var imageOverrides = {};
    var linkOverrides = {};
    var siteMap = SITE_SECTION_MAP[siteCode] || {};

    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var p = sec.payload || {};
      if (sec.is_enabled === false && siteMap[sec.section_code]) {
        var secEl = document.getElementById(siteMap[sec.section_code]);
        if (secEl) secEl.style.display = 'none';
      }
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

    // Apply text overrides to leaf text elements while preserving inner font/style spans
    var textKeys = Object.keys(textOverrides);
    if (textKeys.length > 0) {
      var normTextMap = {};
      for (var tk = 0; tk < textKeys.length; tk++) {
        normTextMap[normalizeText(textKeys[tk])] = textOverrides[textKeys[tk]];
      }
      var els = document.querySelectorAll(LEAF_TEXT_SELECTOR);
      var occCounts = {};
      for (var j = 0; j < els.length; j++) {
        var el = els[j];
        if (!isEligibleStaticLeafText(el)) continue;
        var curNorm = normalizeText(el.textContent);
        if (!curNorm) continue;
        if (!el.dataset.cmsInitialText) {
          el.dataset.cmsInitialText = curNorm;
        }
        var initNorm = el.dataset.cmsInitialText;
        var secCode = resolveCanonicalSectionFromElement(el);
        var occKey = secCode + '::' + initNorm;
        var occIdx = occCounts[occKey] || 0;
        occCounts[occKey] = occIdx + 1;
        el.dataset.cmsOccIndex = String(occIdx);

        var scopedKey = initNorm + '__occ_' + occIdx;
        var replacement =
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
          el.dataset.cmsLastText = normalizeText(el.textContent);
        }
      }
    }

    // Apply image overrides to <img> and CSS background-image (.ladi-image-background, etc.)
    var imgKeys = Object.keys(imageOverrides);
    if (imgKeys.length > 0) {
      var normImgMap = {};
      for (var ik = 0; ik < imgKeys.length; ik++) {
        normImgMap[normalizeUrlPath(imgKeys[ik])] = imageOverrides[imgKeys[ik]];
        normImgMap[imgKeys[ik]] = imageOverrides[imgKeys[ik]];
      }

      var imgs = document.querySelectorAll('img');
      for (var m = 0; m < imgs.length; m++) {
        var img = imgs[m];
        var rawSrc = img.getAttribute('src') || img.src;
        if (!rawSrc) continue;
        if (!img.dataset.cmsInitialSrc) {
          img.dataset.cmsInitialSrc = rawSrc;
        }
        var initSrc = img.dataset.cmsInitialSrc;
        var nextSrc =
          normImgMap[normalizeUrlPath(initSrc)] ||
          normImgMap[initSrc] ||
          normImgMap[normalizeUrlPath(rawSrc)] ||
          normImgMap[rawSrc];
        if (nextSrc) {
          img.src = nextSrc;
        }
      }

      var allEls = document.querySelectorAll('*');
      for (var b = 0; b < allEls.length; b++) {
        var bgEl = allEls[b];
        var computedBg = window.getComputedStyle(bgEl).backgroundImage;
        var url = extractBgUrl(computedBg);
        if (!url) continue;
        if (!bgEl.dataset.cmsInitialSrc) {
          bgEl.dataset.cmsInitialSrc = url;
        }
        var initBgUrl = bgEl.dataset.cmsInitialSrc;
        var nextBg =
          normImgMap[normalizeUrlPath(initBgUrl)] ||
          normImgMap[initBgUrl] ||
          normImgMap[normalizeUrlPath(url)] ||
          normImgMap[url];
        if (nextBg) {
          bgEl.style.setProperty('background-image', 'url("' + nextBg + '")', 'important');
        }
      }
    }

    // Apply link overrides
    var linkKeys = Object.keys(linkOverrides);
    if (linkKeys.length > 0) {
      var links = document.querySelectorAll('a[href]');
      for (var l = 0; l < links.length; l++) {
        var a = links[l];
        var href = a.getAttribute('href') || '';
        if (!a.dataset.cmsInitialHref) a.dataset.cmsInitialHref = href;
        var initHref = a.dataset.cmsInitialHref;
        var nextHref = linkOverrides[initHref] || linkOverrides[href];
        if (nextHref) {
          a.setAttribute('href', nextHref);
        }
      }
    }
  }

  // 3. Language Switcher Normalization
  function normalizeLanguageLinks() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = (a.getAttribute('href') || '').trim();
      var cleanHref = href.replace(/\/+$/, '');
      if (
        cleanHref === 'en' ||
        cleanHref === '/en' ||
        cleanHref.indexOf('enjicad.vn/en') !== -1 ||
        cleanHref.indexOf('enjicad.cic.com.vn/en') !== -1 ||
        cleanHref.indexOf('bim.cic.com.vn/en') !== -1 ||
        cleanHref.indexOf('enjicad.en') !== -1
      ) {
        a.setAttribute('href', '?lang=en');
        a.removeAttribute('target');
      } else if (
        cleanHref === 'cn' ||
        cleanHref === '/cn' ||
        cleanHref === 'chn' ||
        cleanHref === '/chn' ||
        cleanHref === 'zh' ||
        cleanHref === '/zh' ||
        cleanHref.indexOf('enjicad.cic.com.vn/cn') !== -1 ||
        cleanHref.indexOf('enjicad.cic.com.vn/chn') !== -1 ||
        cleanHref.indexOf('enjicad.vn/cn') !== -1 ||
        cleanHref.indexOf('enjicad.vn/chn') !== -1
      ) {
        a.setAttribute('href', '?lang=zh');
        a.removeAttribute('target');
      } else if (
        cleanHref === 'https://enjicad.vn' ||
        cleanHref === 'http://enjicad.vn' ||
        cleanHref === 'https://enjicad.cic.com.vn' ||
        cleanHref === 'https://bim.cic.com.vn' ||
        href === '../'
      ) {
        a.setAttribute('href', '?lang=vi');
        a.removeAttribute('target');
      }
    }
  }

  // 4. Conditional Form Workflow Engine
  function getFormSchemaFields() {
    if (!formConfig || !Array.isArray(formConfig.fields_schema_json)) {
      return [
        {
          name: 'primary_need',
          label: locale === 'en' ? 'Primary Need' : 'Nhu cầu quan tâm chính',
          type: 'select',
          required: true,
          options: [
            {
              value: 'trial_30_days',
              label:
                locale === 'en'
                  ? 'Download Free Trial & Brochure'
                  : 'Đăng ký dùng thử & tải tài liệu',
            },
            {
              value: 'request_quote',
              label:
                locale === 'en'
                  ? 'Request Official License Quote'
                  : 'Nhận báo giá bản quyền ưu đãi',
            },
            {
              value: 'technical_consult',
              label:
                locale === 'en'
                  ? '1-on-1 Technical Consultation'
                  : 'Tư vấn kỹ thuật & giải pháp triển khai',
            },
          ],
        },
        {
          name: 'device_quantity',
          label: locale === 'en' ? 'Estimated License Quantity' : 'Số lượng máy / người dùng dự kiến',
          type: 'number',
          required: false,
          placeholder: '5',
          visibility_rule: {
            operator: 'equals',
            dependsOnField: 'primary_need',
            value: 'request_quote',
          },
        },
      ];
    }
    return formConfig.fields_schema_json;
  }

  function evaluateFieldVisibility(rule, currentNeed) {
    if (!rule || !rule.operator || rule.operator === 'always') return true;
    var depField = rule.dependsOnField || rule.depends_on;
    if (!depField) return true;
    var targetVal = String(rule.value != null ? rule.value : '');
    if (rule.operator === 'equals') {
      return currentNeed === targetVal;
    }
    if (rule.operator === 'not_equals') {
      return currentNeed !== targetVal;
    }
    if (rule.operator === 'in') {
      var arr = Array.isArray(rule.values)
        ? rule.values
        : targetVal.split(',').map(function (s) {
            return s.trim();
          });
      return arr.indexOf(currentNeed) !== -1;
    }
    return true;
  }

  function injectConditionalWorkflowIntoForms() {
    var schemaFields = getFormSchemaFields();
    var primaryNeedField = null;
    var conditionalFields = [];

    for (var i = 0; i < schemaFields.length; i++) {
      var f = schemaFields[i];
      if (f.name === 'primary_need') {
        primaryNeedField = f;
      } else if (
        f.visibility_rule &&
        f.visibility_rule.operator &&
        f.visibility_rule.operator !== 'always' &&
        (f.visibility_rule.dependsOnField || f.visibility_rule.depends_on)
      ) {
        conditionalFields.push(f);
      }
    }

    if (!primaryNeedField) return;

    var styleId = 'cic-workflow-styles';
    if (!document.getElementById(styleId)) {
      var st = document.createElement('style');
      st.id = styleId;
      st.textContent =
        '.cic-workflow-slot { box-sizing: border-box; width: 100%; margin: 6px 0; }' +
        '.cic-workflow-slot select, .cic-workflow-slot input { box-sizing: border-box; width: 100%; height: 36px; padding: 0 10px; font-size: 13px; border: 1px solid rgba(80,80,80,0.65); background: #fff; color: #222; border-radius: 3px; margin-bottom: 6px; outline: none; }' +
        '.cic-workflow-slot select:focus, .cic-workflow-slot input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.15); }' +
        '.ladi-form .cic-workflow-slot { position: absolute; left: 0; width: 100%; z-index: 25; margin: 0; }' +
        '.cic-conditional-wrap[hidden] { display: none !important; }';
      document.head.appendChild(st);
    }

    var forms = document.querySelectorAll('form');
    for (var fi = 0; fi < forms.length; fi++) {
      (function (form) {
        if (form.dataset.cicWorkflowAttached === '1') return;
        var textInputs = form.querySelectorAll(
          'input[type="text"], input[type="tel"], input[type="email"]'
        );
        if (textInputs.length <= 1) return;

        form.dataset.cicWorkflowAttached = '1';

        var opts = Array.isArray(primaryNeedField.options) ? primaryNeedField.options : [];
        var defaultNeedVal = (opts[0] && opts[0].value) ? opts[0].value : 'trial_30_days';

        // Preserve 100% original visual form layout unless explicitly opted into visible slot
        if (form.dataset.cicShowConditional !== '1') {
          if (!form.querySelector('input[name="primary_need"], select[name="primary_need"]')) {
            var hiddenNeed = document.createElement('input');
            hiddenNeed.type = 'hidden';
            hiddenNeed.name = 'primary_need';
            hiddenNeed.value = defaultNeedVal;
            form.appendChild(hiddenNeed);
          }
          return;
        }

        var slot = document.createElement('div');
        slot.className = 'cic-workflow-slot';

        var selectEl = document.createElement('select');
        selectEl.name = 'primary_need';
        selectEl.className = 'cic-workflow-select';
        for (var oi = 0; oi < opts.length; oi++) {
          var opt = document.createElement('option');
          opt.value = opts[oi].value;
          opt.textContent = opts[oi].label || opts[oi].value;
          selectEl.appendChild(opt);
        }
        slot.appendChild(selectEl);

        var condEls = [];
        for (var ci = 0; ci < conditionalFields.length; ci++) {
          var cf = conditionalFields[ci];
          var wrap = document.createElement('div');
          wrap.className = 'cic-conditional-wrap';
          wrap.hidden = true;

          var inp = document.createElement('input');
          inp.type = cf.type === 'number' ? 'number' : 'text';
          inp.name = cf.name;
          inp.placeholder =
            (cf.label ? cf.label + ' (VD: ' + (cf.placeholder || '5') + ')' : cf.placeholder) ||
            cf.name;
          wrap.appendChild(inp);
          slot.appendChild(wrap);
          condEls.push({ field: cf, wrap: wrap, input: inp });
        }

        var isLadiForm = form.classList.contains('ladi-form');
        var ladiBtnWrap = isLadiForm
          ? form.querySelector('[id^="BUTTON"]') ||
            (form.querySelector('.ladi-button') &&
              form.querySelector('.ladi-button').closest('.ladi-element'))
          : null;
        var ladiFormWrap = isLadiForm ? form.closest('.ladi-element') : null;
        var origBtnTop = null;
        var origFormHeight = null;

        if (isLadiForm && ladiBtnWrap) {
          origBtnTop = parseFloat(window.getComputedStyle(ladiBtnWrap).top) || 180;
          origFormHeight = ladiFormWrap
            ? parseFloat(window.getComputedStyle(ladiFormWrap).height) || 230
            : 230;
          slot.style.top = origBtnTop + 'px';
          form.insertBefore(slot, ladiBtnWrap);
        } else {
          var submitInput = form.querySelector(
            'button[type="submit"], input[type="submit"], button.button'
          );
          var submitContainer = submitInput ? submitInput.closest('li, .form-group, div') : null;
          if (submitContainer && submitContainer.parentElement) {
            submitContainer.parentElement.insertBefore(slot, submitContainer);
          } else {
            form.appendChild(slot);
          }
        }

        function syncVisibilityAndLayout() {
          var currentNeed = selectEl.value;
          var visibleCondCount = 0;
          for (var k = 0; k < condEls.length; k++) {
            var item = condEls[k];
            var isMatch = evaluateFieldVisibility(item.field.visibility_rule, currentNeed);
            item.wrap.hidden = !isMatch;
            if (isMatch) visibleCondCount++;
          }

          if (isLadiForm && ladiBtnWrap && origBtnTop !== null) {
            var extraH = 42 + visibleCondCount * 42;
            ladiBtnWrap.style.setProperty('top', origBtnTop + extraH + 'px', 'important');
            if (ladiFormWrap && origFormHeight !== null) {
              ladiFormWrap.style.setProperty(
                'height',
                origFormHeight + extraH + 'px',
                'important'
              );
            }
          }
        }

        selectEl.addEventListener('change', syncVisibilityAndLayout);
        syncVisibilityAndLayout();
      })(forms[fi]);
    }
  }

  // 5. Interactive Modals (Post-Submit Outcome Modal & Comparison PDF Modal)
  function getModalStyles() {
    if (document.getElementById('cic-modal-styles')) return;
    var st = document.createElement('style');
    st.id = 'cic-modal-styles';
    st.textContent =
      '.cic-modal-overlay { position: fixed; inset: 0; top: 0; left: 0; right: 0; bottom: 0; z-index: 2147483640; background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; font-family: Roboto, "Open Sans", system-ui, sans-serif; }' +
      '.cic-modal-card { background: #ffffff; color: #0f172a; width: 100%; max-width: 520px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); overflow: hidden; border: 1px solid #e2e8f0; animation: cicModalIn 0.2s ease-out; }' +
      '.cic-modal-card.cic-modal-wide { max-width: 860px; }' +
      '@keyframes cicModalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }' +
      '.cic-modal-header { background: linear-gradient(135deg, #0b1b36 0%, #1e3a8a 100%); color: #ffffff; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }' +
      '.cic-modal-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); color: #6ee7b7; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }' +
      '.cic-modal-close { background: rgba(255,255,255,0.12); border: none; color: #fff; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; }' +
      '.cic-modal-close:hover { background: rgba(255,255,255,0.24); }' +
      '.cic-modal-body { padding: 24px; }' +
      '.cic-modal-title { font-size: 20px; font-weight: 800; color: #0b1b36; margin: 0 0 8px 0; line-height: 1.35; }' +
      '.cic-modal-desc { font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6; }' +
      '.cic-download-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 18px; text-align: center; }' +
      '.cic-download-box-title { font-size: 13px; font-weight: 700; color: #166534; margin: 0 0 12px 0; }' +
      '.cic-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #ea580c; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 20px; border-radius: 10px; text-decoration: none !important; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }' +
      '.cic-btn-primary:hover { background: #c2410c; }' +
      '.cic-btn-secondary { display: inline-flex; align-items: center; justify-content: center; width: 100%; background: #f1f5f9; color: #334155; font-weight: 700; font-size: 13px; padding: 10px 16px; border-radius: 10px; border: 1px solid #cbd5e1; cursor: pointer; margin-top: 8px; }' +
      '.cic-btn-secondary:hover { background: #e2e8f0; }' +
      '.cic-modal-footer { padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #64748b; }';
    document.head.appendChild(st);
  }

  function closeLadiPopups() {
    var backdrop = document.getElementById('backdrop-popup');
    if (backdrop) backdrop.style.display = 'none';
    var popups = document.querySelectorAll('#SECTION_POPUP .ladi-element');
    for (var i = 0; i < popups.length; i++) {
      popups[i].style.display = 'none';
    }
  }

  function showOutcomeModal(res, visitorName) {
    getModalStyles();
    closeLadiPopups();

    var existing = document.getElementById('cic-outcome-modal-overlay');
    if (existing) existing.remove();

    var consultPayload = getSectionPayload('consultation_form');
    var modalCfg = consultPayload.modal || {};
    var successJson = (formConfig && formConfig.success_payload_json) || {};

    var isLisp = res && res.outcome_mode === 'lisp';
    var badgeTitle = modalCfg.badge_title || 'Đăng ký thành công';
    var headingPrefix = isLisp
      ? modalCfg.lisp_modal_title || modalCfg.heading_prefix || 'Tải Kho LISP & Tiện ích'
      : modalCfg.trial_modal_title || modalCfg.heading_prefix || 'Cảm ơn Quý khách';
    var defaultDesc =
      (res && (res.message || res.success_message)) ||
      (isLisp ? modalCfg.lisp_modal_description : modalCfg.trial_modal_description) ||
      modalCfg.default_description ||
      successJson.message ||
      'Chuyên gia kỹ thuật CIC đã nhận được yêu cầu và sẽ liên hệ hỗ trợ Quý khách trong thời gian sớm nhất.';
    var downloadBoxTitle =
      (res && res.title) ||
      modalCfg.download_box_title ||
      'Tài liệu & Bộ cài đặt dùng thử đã sẵn sàng:';
    var downloadBtnLabel =
      (res && res.download_label) ||
      (isLisp ? modalCfg.lisp_download : modalCfg.trial_download) ||
      modalCfg.download_button_label ||
      'TẢI XUỐNG BỘ CÀI ĐẶT / TÀI LIỆU NGAY';
    var closeBtnLabel = modalCfg.close_button_label || 'Đóng cửa sổ';
    var footerText = modalCfg.footer_text || 'Cần hỗ trợ cài đặt & kích hoạt bản quyền ngay?';
    var supportLinkLabel = modalCfg.support_link_label || 'Gọi Hotline: ' + hotline;

    var outcomeType = (res && (res.outcome_type || res.action)) || 'message_only';
    var isDownload = outcomeType === 'download_modal';
    var downloadUrl =
      (res && res.download_url) ||
      successJson.default_download_url ||
      '/api/landing/media/' + siteCode + '/downloads/brochure.pdf';

    var overlay = document.createElement('div');
    overlay.id = 'cic-outcome-modal-overlay';
    overlay.dataset.outcomeMode = (res && res.outcome_mode) || (isDownload ? 'trial' : 'message_only');
    overlay.className = 'cic-modal-overlay cic-modal-root';

    var displayHeading = visitorName ? headingPrefix + ' ' + visitorName + '!' : headingPrefix + '!';

    overlay.innerHTML =
      '<div class="cic-modal-card" data-anchor="consultation_form">' +
      '  <div class="cic-modal-header">' +
      '    <span class="cic-modal-badge">✓ ' +
      badgeTitle +
      '</span>' +
      '    <button type="button" class="cic-modal-close" aria-label="Close">×</button>' +
      '  </div>' +
      '  <div class="cic-modal-body">' +
      '    <h3 class="cic-modal-title">' +
      displayHeading +
      '</h3>' +
      '    <p class="cic-modal-desc">' +
      defaultDesc +
      '</p>' +
      (isDownload
        ? '    <div class="cic-download-box">' +
          '      <p class="cic-download-box-title">' +
          downloadBoxTitle +
          '</p>' +
          '      <a href="' +
          downloadUrl +
          '" target="_blank" rel="noopener noreferrer" class="cic-btn-primary">⬇ ' +
          downloadBtnLabel +
          '</a>' +
          '    </div>'
        : '') +
      '    <button type="button" class="cic-btn-secondary cic-modal-dismiss">' +
      closeBtnLabel +
      '</button>' +
      '  </div>' +
      '  <div class="cic-modal-footer">' +
      '    <span>' +
      footerText +
      '</span>' +
      '    <a href="tel:' +
      hotline.replace(/\s+/g, '') +
      '" style="font-weight:700;color:#ea580c;text-decoration:none;">' +
      supportLinkLabel +
      '</a>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    var closeBtns = overlay.querySelectorAll('.cic-modal-close, .cic-modal-dismiss');
    for (var i = 0; i < closeBtns.length; i++) {
      closeBtns[i].addEventListener('click', function () {
        overlay.remove();
      });
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });

    if (isPreview) {
      window.parent.postMessage(
        { type: 'CMS_MODAL_OPENED', sectionCode: 'consultation_form' },
        '*'
      );
    }
  }

  function showComparisonPdfModal() {
    getModalStyles();
    var existing = document.getElementById('cic-comparison-modal-overlay');
    if (existing) existing.remove();

    var compPayload = getSectionPayload('comparison');
    var modalCfg = compPayload.modal || {};
    var title = modalCfg.title || 'Tài liệu So sánh Kỹ thuật & Bảng tính năng chi tiết';
    var subtitle =
      modalCfg.publisher ||
      modalCfg.subtitle ||
      'Xem trực tiếp hoặc tải về tài liệu PDF chính thức từ CIC';
    var pdfUrl = modalCfg.pdf_url || '/api/landing/media/' + siteCode + '/downloads/brochure.pdf';
    var downloadLabel =
      modalCfg.download || modalCfg.download_label || 'Tải xuống PDF (Miễn phí)';
    var ctaLabel = modalCfg.cta_scroll_label || 'Đăng ký nhận tư vấn & báo giá';

    var overlay = document.createElement('div');
    overlay.id = 'cic-comparison-modal-overlay';
    overlay.className = 'cic-modal-overlay cic-modal-root';

    overlay.innerHTML =
      '<div class="cic-modal-card cic-modal-wide" data-anchor="comparison">' +
      '  <div class="cic-modal-header">' +
      '    <div>' +
      '      <h3 style="margin:0;font-size:17px;font-weight:800;color:#fff;">' +
      title +
      '</h3>' +
      '      <p style="margin:4px 0 0 0;font-size:12px;color:#cbd5e1;">' +
      subtitle +
      '</p>' +
      '    </div>' +
      '    <button type="button" class="cic-modal-close" aria-label="Close">×</button>' +
      '  </div>' +
      '  <div class="cic-modal-body" style="padding:16px;">' +
      '    <div style="height:420px;background:#f1f5f9;border-radius:10px;overflow:hidden;border:1px solid #cbd5e1;margin-bottom:14px;">' +
      '      <iframe src="' +
      pdfUrl +
      '" style="width:100%;height:100%;border:none;" title="PDF Preview"></iframe>' +
      '    </div>' +
      '    <div style="display:flex;gap:10px;flex-wrap:wrap;">' +
      '      <a href="' +
      pdfUrl +
      '" target="_blank" rel="noopener noreferrer" class="cic-btn-primary" style="flex:1;">⬇ ' +
      downloadLabel +
      '</a>' +
      '      <button type="button" class="cic-btn-secondary cic-modal-cta" style="flex:1;margin-top:0;">' +
      ctaLabel +
      '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.cic-modal-close').addEventListener('click', function () {
      overlay.remove();
    });
    overlay.querySelector('.cic-modal-cta').addEventListener('click', function () {
      overlay.remove();
      scrollToSectionCode('consultation_form');
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });

    if (isPreview) {
      window.parent.postMessage({ type: 'CMS_MODAL_OPENED', sectionCode: 'comparison' }, '*');
    }
  }

  // 6. Capture-Phase Form Submission Handler -> /api/landing/leads
  function collectFormPayload(form) {
    var raw = {};
    var fields = {};
    var elements = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.type === 'submit' || el.type === 'button' || el.type === 'hidden') continue;
      var wrap = el.closest('.cic-conditional-wrap');
      if (wrap && wrap.hidden) continue;

      var key = el.name || el.id || el.getAttribute('placeholder') || 'field_' + i;
      var val = (el.value || '').trim();
      if (!val) continue;
      raw[key] = val;
    }

    var fullName = '';
    var phone = '';
    var email = '';
    var company = '';
    var note = '';
    var primaryNeed = raw.primary_need || 'trial_30_days';

    var keys = Object.keys(raw);
    for (var k = 0; k < keys.length; k++) {
      var keyName = keys[k];
      var lower = keyName.toLowerCase();
      var v = raw[keyName];
      if (keyName === 'primary_need') continue;
      if (
        !fullName &&
        (lower.indexOf('name') !== -1 ||
          lower.indexOf('fullname') !== -1 ||
          lower.indexOf('ten') !== -1 ||
          lower.indexOf('họ') !== -1)
      ) {
        fullName = v;
      } else if (
        !phone &&
        (lower.indexOf('phone') !== -1 ||
          lower.indexOf('tel') !== -1 ||
          lower.indexOf('điện thoại') !== -1 ||
          lower.indexOf('sdt') !== -1)
      ) {
        phone = v;
      } else if (!email && lower.indexOf('mail') !== -1) {
        email = v;
      } else if (
        !company &&
        (lower.indexOf('company') !== -1 ||
          lower.indexOf('công ty') !== -1 ||
          lower.indexOf('đơn vị') !== -1 ||
          lower === 'form_item1171')
      ) {
        company = v;
      } else if (
        !note &&
        (lower.indexOf('message') !== -1 ||
          lower.indexOf('other') !== -1 ||
          lower.indexOf('thngtinthm') !== -1 ||
          lower.indexOf('ghi chú') !== -1)
      ) {
        note = v;
      } else {
        fields[keyName] = v;
      }
    }

    if (!fullName && email) {
      fullName = email.split('@')[0];
    }
    if (
      !phone &&
      email &&
      !form.querySelector('input[type="tel"], input[name*="phone" i], input[name*="Phone"]')
    ) {
      phone = '0900000000';
    }

    fields.name = fullName;
    fields.full_name = fullName;
    fields.phone = phone;
    if (email) fields.email = email;
    if (company) fields.company = company;
    fields.primary_need = primaryNeed;
    if (note) fields.requirements = note;
    fields.website_url = '';

    return {
      site_code: siteCode,
      form_code: (formConfig && formConfig.form_code) || siteCode + '-lead-form',
      fields: fields,
    };
  }

  function submitFormToCicLeads(form) {
    var textInputs = form.querySelectorAll(
      'input[type="text"], input[type="tel"], input[type="email"]'
    );
    if (textInputs.length === 0) {
      scrollToSectionCode('consultation_form');
      return;
    }

    var bodyPayload = collectFormPayload(form);
    var f = bodyPayload.fields;
    if (!f.name || f.name.length < 2) {
      alert(
        locale === 'en'
          ? 'Please enter your full name.'
          : 'Vui lòng nhập Họ và tên của Quý khách.'
      );
      var nameInp = form.querySelector('input[name*="name" i], input[type="text"]');
      if (nameInp) nameInp.focus();
      return;
    }
    if (!f.phone || f.phone.length < 8) {
      alert(
        locale === 'en'
          ? 'Please enter a valid phone number.'
          : 'Vui lòng nhập Số điện thoại hợp lệ để chuyên gia CIC liên hệ.'
      );
      var phoneInp = form.querySelector(
        'input[type="tel"], input[name*="phone" i], input[name*="Phone"]'
      );
      if (phoneInp) phoneInp.focus();
      return;
    }

    if (form.dataset.cicSubmitting === '1') return;
    form.dataset.cicSubmitting = '1';

    fetch('/api/landing/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res && res.success) {
          form.reset();
          showOutcomeModal(res, f.name);
        } else {
          alert((res && res.error) || 'Vui lòng kiểm tra lại thông tin đăng ký.');
        }
      })
      .catch(function () {
        alert('Không thể kết nối máy chủ. Vui lòng thử lại.');
      })
      .finally(function () {
        form.dataset.cicSubmitting = '0';
      });
  }

  window.addEventListener(
    'submit',
    function (e) {
      var form = e.target;
      if (!form || form.tagName !== 'FORM') return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      submitFormToCicLeads(form);
    },
    true
  );

  window.addEventListener(
    'click',
    function (e) {
      var target = e.target;
      if (!target || !target.closest) return;
      var ladiBtn = target.closest('.ladi-form .ladi-button');
      if (ladiBtn) {
        var form = ladiBtn.closest('form');
        if (form) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          submitFormToCicLeads(form);
        }
      }
    },
    true
  );

  // 7. Scroll helper, Section Anchor Resolution & Universal LadiPage Menu/Popup Action Handler
  function scrollToSectionCode(rawAnchorOrCode) {
    var clean = String(rawAnchorOrCode || '')
      .replace(/^#/, '')
      .trim();
    var canonicalCode = ANCHOR_ALIAS_TO_CODE[clean] || clean;
    var siteMap = SITE_SECTION_MAP[siteCode] || {};
    var targetDomId = siteMap[canonicalCode] || clean;

    var el =
      document.getElementById(targetDomId) ||
      document.getElementById(clean) ||
      document.querySelector('[data-anchor="' + canonicalCode + '"]');
    if (el) {
      var scrollTarget =
        window.getComputedStyle(el).display === 'contents' && el.firstElementChild
          ? el.firstElementChild
          : el;
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function bindLadiActionScrollAndPopupFallback() {
    var parsedEventData = null;
    function getLadiEventMap() {
      if (parsedEventData) return parsedEventData;
      var scriptEl = document.getElementById('script_event_data');
      if (scriptEl && scriptEl.textContent) {
        try {
          parsedEventData = JSON.parse(scriptEl.textContent);
          return parsedEventData;
        } catch (e) {}
      }
      if (
        window.LadiPageScript &&
        window.LadiPageScript.runtime &&
        window.LadiPageScript.runtime.eventData
      ) {
        var raw = window.LadiPageScript.runtime.eventData;
        if (typeof raw === 'object') {
          parsedEventData = raw;
          return parsedEventData;
        }
        if (typeof raw === 'string') {
          try {
            parsedEventData = JSON.parse(decodeURIComponent(raw));
            return parsedEventData;
          } catch (e2) {}
        }
      }
      return null;
    }

    document.addEventListener(
      'click',
      function (e) {
        var target = e.target;
        if (!target || !target.closest) return;
        var actionEl = target.closest('[data-action="true"][id]');
        if (!actionEl) return;

        var evMap = getLadiEventMap();
        if (!evMap) return;
        var cfg = evMap[actionEl.id];
        if (!cfg) return;

        var actions = cfg.cs || cfg['option.data_event'] || [];
        if (!Array.isArray(actions)) return;

        for (var i = 0; i < actions.length; i++) {
          var act = actions[i];
          if (!act) continue;
          var actType = act.a || act.type;
          var targetVal = act.dw || act.action;
          if (actType === 'section' && targetVal) {
            var startY = window.scrollY;
            setTimeout(function () {
              if (Math.abs(window.scrollY - startY) < 5) {
                var secEl = document.getElementById(targetVal);
                if (secEl) {
                  secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }, 120);
            return;
          } else if (actType === 'popup' && targetVal) {
            if (typeof window.ladi === 'function') {
              try {
                window.ladi(targetVal).show();
                return;
              } catch (err) {}
            }
            var popEl = document.getElementById(targetVal);
            var backdrop = document.getElementById('backdrop-popup');
            if (popEl) {
              if (backdrop) backdrop.style.display = 'block';
              popEl.style.display = 'block';
              return;
            }
          }
        }
      },
      false
    );
  }
  bindLadiActionScrollAndPopupFallback();

  function resolveCanonicalSectionFromElement(el) {
    var siteMap = SITE_SECTION_MAP[siteCode] || {};
    var reverseMap = {};
    var codeKeys = Object.keys(siteMap);
    for (var i = 0; i < codeKeys.length; i++) {
      var c = codeKeys[i];
      if (!reverseMap[siteMap[c]]) reverseMap[siteMap[c]] = c;
    }

    var cur = el;
    while (cur && cur !== document.body) {
      if (cur.dataset && cur.dataset.anchor) return cur.dataset.anchor;
      if (cur.id) {
        if (reverseMap[cur.id]) return reverseMap[cur.id];
        if (ANCHOR_ALIAS_TO_CODE[cur.id]) return ANCHOR_ALIAS_TO_CODE[cur.id];
      }
      cur = cur.parentElement;
    }
    return 'hero';
  }

  // 8. Visual Builder Preview Bridge (?preview=1)
  function initPreviewEditorBridge() {
    var activeEl = null;
    var activeImgTarget = null;
    var hideMediaBtnTimer = null;

    var isApplyingInline = false;

    var styleEl = document.createElement('style');
    styleEl.textContent =
      'cms-text { display: inline; }' +
      '.wow { visibility: visible !important; opacity: 1 !important; }' +
      '.ladi-image, .ladi-image .ladi-image-background { pointer-events: auto !important; }' +
      '[data-cms-editable="1"] { cursor: text !important; user-select: text !important; -webkit-user-select: text !important; transition: outline 0.12s ease, background-color 0.12s ease; }' +
      '[data-cms-editable="1"]:hover { outline: 2px dashed #1d4ed8 !important; outline-offset: 2px !important; }' +
      '[data-cms-editable="1"]:focus { outline: 2px solid #1d4ed8 !important; outline-offset: 3px !important; background: rgba(219, 234, 254, 0.25) !important; caret-color: #be123c !important; }' +
      'img:hover, .ladi-image:hover { outline: 2px dashed #0284c7 !important; outline-offset: 2px !important; cursor: pointer !important; }' +
      '.cms-image-edit-btn { position: fixed; z-index: 2147483645; border: 2px solid #ffffff; border-radius: 999px; background: #ea580c; color: #ffffff; padding: 7px 14px; font: 700 12px/1.2 Roboto, Arial, sans-serif; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.55); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: transform 0.12s ease, background-color 0.12s ease; }' +
      '.cms-image-edit-btn[hidden] { display: none !important; }' +
      '.cms-image-edit-btn:hover { background: #1d4ed8; transform: scale(1.06); }';
    document.head.appendChild(styleEl);

    var mediaBtn = document.createElement('button');
    mediaBtn.type = 'button';
    mediaBtn.className = 'cms-image-edit-btn';
    mediaBtn.textContent = '🖼 Thay ảnh';
    mediaBtn.hidden = true;
    document.body.appendChild(mediaBtn);

    function requestImageReplace(imgTarget) {
      if (!imgTarget) return;
      window.parent.postMessage(
        {
          type: 'CMS_IMAGE_REPLACE_REQUEST',
          payload: {
            anchor: resolveCanonicalSectionFromElement(imgTarget.el),
            currentSrc: imgTarget.initialSrc || imgTarget.src,
            liveSrc: imgTarget.src,
            alt: 'Hình ảnh trang đích',
          },
        },
        '*'
      );
    }

    function positionMediaBtnOverRect(rect) {
      var visLeft = Math.max(8, rect.left);
      var visRight = Math.min(window.innerWidth - 8, rect.right);
      var visTop = Math.max(8, rect.top);
      var visBottom = Math.min(window.innerHeight - 8, rect.bottom);
      var centerX = (visLeft + visRight) / 2 - 48;
      var centerY = (visTop + visBottom) / 2 - 16;
      mediaBtn.style.left = Math.max(8, Math.min(window.innerWidth - 108, centerX)) + 'px';
      mediaBtn.style.top = Math.max(8, Math.min(window.innerHeight - 40, centerY)) + 'px';
      mediaBtn.hidden = false;
    }

    function findImageTargetAtPoint(clientX, clientY) {
      var candidates = [];

      function addCandidate(type, el, boxEl, rawSrc) {
        if (!rawSrc) return;
        var r = boxEl.getBoundingClientRect();
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
            type: type,
            el: el,
            boxEl: boxEl,
            src: rawSrc,
            initialSrc: el.dataset.cmsInitialSrc || rawSrc,
            area: r.width * r.height,
          });
        }
      }

      var allImgs = document.querySelectorAll('img');
      for (var i = 0; i < allImgs.length; i++) {
        var img = allImgs[i];
        var rawSrc = img.getAttribute('src') || img.src;
        addCandidate('img', img, img, rawSrc);
      }

      var allNodes = document.querySelectorAll('*');
      for (var k = 0; k < allNodes.length; k++) {
        var node = allNodes[k];
        if (node === mediaBtn || mediaBtn.contains(node)) continue;
        var bgVal = window.getComputedStyle(node).backgroundImage;
        var bgUrl = extractBgUrl(bgVal);
        if (bgUrl) {
          var boxNode = (node.closest && node.closest('.ladi-image')) || node;
          addCandidate('bg', node, boxNode, bgUrl);
        }
      }

      if (candidates.length === 0) return null;
      candidates.sort(function (a, b) {
        return a.area - b.area;
      });
      return candidates[0];
    }

    function enableInlineEditing() {
      if (isApplyingInline) return;
      isApplyingInline = true;
      try {
        wrapMixedTextNodes();
        var nodes = document.querySelectorAll(LEAF_TEXT_SELECTOR);
        var occCounts = {};
        var totalOccs = {};
        var eligible = [];

        for (var i = 0; i < nodes.length; i++) {
          var el = nodes[i];
          if (!isEligibleStaticLeafText(el)) continue;
          if (el.parentElement && el.parentElement.closest('[data-cms-editable="1"]')) {
            continue;
          }
          var text = normalizeText(el.textContent);
          if (!text) continue;
          if (!el.dataset.cmsInitialText) {
            el.dataset.cmsInitialText = text;
            el.dataset.cmsLastText = text;
          }
          var secCode = resolveCanonicalSectionFromElement(el);
          var occKey = secCode + '::' + el.dataset.cmsInitialText;
          var occIdx = occCounts[occKey] || 0;
          occCounts[occKey] = occIdx + 1;
          totalOccs[occKey] = occIdx + 1;
          el.dataset.cmsOccIndex = String(occIdx);
          el.dataset.cmsOccKey = occKey;
          eligible.push(el);
        }

        for (var k = 0; k < eligible.length; k++) {
          var item = eligible[k];
          item.dataset.cmsTotalOcc = String(totalOccs[item.dataset.cmsOccKey] || 1);
          item.dataset.cmsEditable = '1';
          item.contentEditable = 'true';
          item.spellcheck = false;
        }
      } finally {
        isApplyingInline = false;
      }
    }

    enableInlineEditing();
    var observer = new MutationObserver(function () {
      enableInlineEditing();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('focusin', function (e) {
      var target = e.target && e.target.closest ? e.target.closest('[data-cms-editable="1"]') : null;
      if (!target) return;
      activeEl = target;
      var computed = window.getComputedStyle(target);
      var linkEl = target.closest('a');
      var href = (linkEl && linkEl.getAttribute('href')) || '';
      window.parent.postMessage(
        {
          type: 'CMS_ELEMENT_FOCUSED',
          payload: {
            anchor: resolveCanonicalSectionFromElement(target),
            text: normalizeText(target.textContent),
            fontSize: Math.round(parseFloat(computed.fontSize) * 2) / 2,
            fontWeight: computed.fontWeight,
            textAlign: computed.textAlign,
            fontFamily: computed.fontFamily,
            href: href,
          },
        },
        '*'
      );
    });

    function serializeStaticEditableHtml(el) {
      var html = (el.innerHTML || '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s*data-cms-[a-z-]+="[^"]*"/gi, '')
        .replace(/\s*contenteditable="[^"]*"/gi, '')
        .replace(/\s*spellcheck="[^"]*"/gi, '')
        .trim();
      var styles = [];
      if (el.style.fontSize) styles.push('font-size:' + el.style.fontSize);
      if (el.style.fontWeight) styles.push('font-weight:' + el.style.fontWeight);
      if (el.style.fontFamily) styles.push('font-family:' + el.style.fontFamily);
      if (el.style.textAlign) styles.push('text-align:' + el.style.textAlign + ';display:block');
      if (styles.length > 0) {
        var styleStr = styles.join(';');
        var m = html.match(/^<span\s+data-cms-style="1"\s+style="[^"]*">([\s\S]*)<\/span>$/i);
        var inner = m ? m[1] : html;
        html = '<span data-cms-style="1" style="' + styleStr + '">' + inner + '</span>';
      }
      return html;
    }

    document.addEventListener('input', function (e) {
      var target = e.target && e.target.closest ? e.target.closest('[data-cms-editable="1"]') : null;
      if (!target) return;
      var newText = normalizeText(target.textContent);
      // Do not overwrite cmsLastText when user clears text with Backspace before typing replacement
      if (!newText) return;

      var oldText = target.dataset.cmsLastText || target.dataset.cmsInitialText || '';
      var newHtml = serializeStaticEditableHtml(target);
      target.dataset.cmsLastText = newText;

      var initText = target.dataset.cmsInitialText || oldText;
      var occIdx = parseInt(target.dataset.cmsOccIndex || '0', 10) || 0;
      var totalOcc = parseInt(target.dataset.cmsTotalOcc || '1', 10) || 1;
      var overrideKey = totalOcc > 1 ? initText + '__occ_' + occIdx : initText;

      window.parent.postMessage(
        {
          type: 'CMS_INLINE_TEXT_CHANGE',
          payload: {
            anchor: resolveCanonicalSectionFromElement(target),
            oldText: oldText,
            newText: newText,
            newHtml: newHtml,
            occurrenceIndex: occIdx,
            overrideKey: overrideKey,
          },
        },
        '*'
      );
    });

    document.addEventListener('mousemove', function (e) {
      var target = e.target;
      if (target === mediaBtn || (target && mediaBtn.contains(target))) {
        if (hideMediaBtnTimer) {
          clearTimeout(hideMediaBtnTimer);
          hideMediaBtnTimer = null;
        }
        return;
      }

      var found = findImageTargetAtPoint(e.clientX, e.clientY, target);
      if (found) {
        if (hideMediaBtnTimer) {
          clearTimeout(hideMediaBtnTimer);
          hideMediaBtnTimer = null;
        }
        activeImgTarget = found;
        var rect = (found.boxEl || found.el).getBoundingClientRect();
        positionMediaBtnOverRect(rect);
        return;
      }

      // Keep button visible if cursor is still within 40px of activeImgTarget's bounding box
      if (activeImgTarget && !mediaBtn.hidden) {
        var activeRect = (activeImgTarget.boxEl || activeImgTarget.el).getBoundingClientRect();
        var pad = 40;
        if (
          e.clientX >= activeRect.left - pad &&
          e.clientX <= activeRect.right + pad &&
          e.clientY >= activeRect.top - pad &&
          e.clientY <= activeRect.bottom + pad
        ) {
          return;
        }
        if (!hideMediaBtnTimer) {
          hideMediaBtnTimer = setTimeout(function () {
            mediaBtn.hidden = true;
            hideMediaBtnTimer = null;
          }, 650);
        }
      }
    });

    mediaBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      requestImageReplace(activeImgTarget);
    });

    document.addEventListener(
      'click',
      function (e) {
        var target = e.target;
        if (!target || !target.closest) return;
        if (target === mediaBtn || mediaBtn.contains(target)) return;

        // If user clicks directly on a foreground image (and not on editable text/form input), open image replacement modal too
        if (
          target.closest('img, .ladi-image') &&
          !target.closest('[data-cms-editable="1"], input, select, textarea, button')
        ) {
          var clickedImg = findImageTargetAtPoint(e.clientX, e.clientY, target);
          if (clickedImg) {
            e.preventDefault();
            e.stopPropagation();
            activeImgTarget = clickedImg;
            positionMediaBtnOverRect((clickedImg.boxEl || clickedImg.el).getBoundingClientRect());
            requestImageReplace(clickedImg);
            return;
          }
        }

        var link = target.closest('a');
        if (link && !link.closest('.cic-modal-root')) {
          e.preventDefault();
        }
      },
      true
    );

    window.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'SCROLL_TO' && data.anchor) {
        scrollToSectionCode(data.anchor);
      } else if (data.type === 'CMS_TOGGLE_MODAL') {
        if (data.modal === 'comparison_pdf') {
          if (data.open) showComparisonPdfModal();
          else {
            var cm = document.getElementById('cic-comparison-modal-overlay');
            if (cm) cm.remove();
          }
        } else if (data.modal === 'post_submit' || data.modal === 'trial_download') {
          if (data.open) {
            var isMessageMode = data.mode === 'message_only';
            showOutcomeModal(
              {
                outcome_type: isMessageMode ? 'message_only' : 'download_modal',
                outcome_mode: data.mode || 'trial',
                download_url:
                  ((formConfig && formConfig.success_payload_json) || {}).default_download_url ||
                  '/api/landing/media/' + siteCode + '/downloads/brochure.pdf',
              },
              'Nguyễn Văn A'
            );
          } else {
            var om = document.getElementById('cic-outcome-modal-overlay');
            if (om) om.remove();
          }
        }
      } else if (data.type === 'CMS_SYNC_SECTION_PAYLOAD' && data.sectionCode && data.payload) {
        var foundSec = false;
        for (var si = 0; si < sections.length; si++) {
          if (sections[si].section_code === data.sectionCode) {
            sections[si].payload = data.payload;
            foundSec = true;
            break;
          }
        }
        if (!foundSec) {
          sections.push({
            section_code: data.sectionCode,
            is_enabled: true,
            payload: data.payload,
          });
        }
        applyDatabaseCmsOverrides();
        if (
          data.sectionCode === 'comparison' &&
          document.getElementById('cic-comparison-modal-overlay')
        ) {
          showComparisonPdfModal();
        }
        var openOutcome = document.getElementById('cic-outcome-modal-overlay');
        if (data.sectionCode === 'consultation_form' && openOutcome) {
          var curMode = openOutcome.dataset.outcomeMode || 'trial';
          showOutcomeModal(
            {
              outcome_type: curMode === 'message_only' ? 'message_only' : 'download_modal',
              outcome_mode: curMode,
              download_url:
                ((formConfig && formConfig.success_payload_json) || {}).default_download_url ||
                '/api/landing/media/' + siteCode + '/downloads/brochure.pdf',
            },
            'Nguyễn Văn A'
          );
        }
      } else if (data.type === 'CMS_FORMAT_COMMAND' && activeEl) {
        activeEl.focus();
        if (['bold', 'italic', 'underline', 'undo', 'redo'].indexOf(data.command) !== -1) {
          document.execCommand(data.command, false);
        } else if (data.command === 'clear') {
          document.execCommand('removeFormat', false);
          activeEl.style.fontSize = '';
          activeEl.style.fontWeight = '';
          activeEl.style.textAlign = '';
        } else if (data.command === 'fontSize' && data.value) {
          activeEl.style.setProperty('font-size', data.value + 'px', 'important');
        } else if (data.command === 'fontWeight' && data.value) {
          activeEl.style.setProperty('font-weight', String(data.value), 'important');
        } else if (data.command === 'textAlign' && data.value) {
          activeEl.style.setProperty('text-align', String(data.value), 'important');
        } else if (data.command === 'fontFamily' && data.value) {
          activeEl.style.setProperty('font-family', String(data.value), 'important');
        }
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (
        (data.type === 'CMS_APPLY_LINK' || data.type === 'CMS_UPDATE_LINK') &&
        activeEl
      ) {
        var link = activeEl.closest('a') || activeEl;
        if (link && data.href) link.setAttribute('href', data.href);
        if (data.text) {
          activeEl.textContent = data.text;
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else if (data.type === 'CMS_APPLY_MEDIA' && (data.newSrc || data.newUrl)) {
        var targetUrl = data.newSrc || data.newUrl;
        if (activeImgTarget) {
          if (activeImgTarget.type === 'img') {
            activeImgTarget.el.src = targetUrl;
          } else {
            activeImgTarget.el.style.setProperty(
              'background-image',
              'url("' + targetUrl + '")',
              'important'
            );
          }
          activeImgTarget.src = targetUrl;
        }
      }
    });
  }

  function boot() {
    applyDatabaseCmsOverrides();
    normalizeLanguageLinks();
    injectConditionalWorkflowIntoForms();
    if (isPreview) {
      initPreviewEditorBridge();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', function () {
    applyDatabaseCmsOverrides();
    injectConditionalWorkflowIntoForms();
  });
})();
