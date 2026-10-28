function normalizeText(s: string): string {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pure SSR/CSR hydrator that applies CMS section payload overrides
 * (text_overrides, image_overrides, link_overrides) directly onto a
 * section's localized HTML string during React rendering.
 */
export function hydrateSectionHtml(
  rawHtml: string,
  payload: Record<string, any> = {},
  allPayloads: Record<string, any>[] = []
): string {
  let html = rawHtml;

  const textOverrides: Record<string, string> = {};
  const imageOverrides: Record<string, string> = {};
  const linkOverrides: Record<string, string> = {};
  const videoOverrides: Record<string, string> = {};

  for (const p of [...allPayloads, payload]) {
    if (!p || typeof p !== 'object') continue;
    if (p.text_overrides && typeof p.text_overrides === 'object') {
      Object.assign(textOverrides, p.text_overrides);
    }
    if (p.image_overrides && typeof p.image_overrides === 'object') {
      Object.assign(imageOverrides, p.image_overrides);
    }
    if (p.link_overrides && typeof p.link_overrides === 'object') {
      Object.assign(linkOverrides, p.link_overrides);
    }
    if (p.video_overrides && typeof p.video_overrides === 'object') {
      Object.assign(videoOverrides, p.video_overrides);
    }
  }

  // 0. Apply YouTube video ID overrides
  for (const [oldVid, newVid] of Object.entries(videoOverrides)) {
    if (!oldVid || !newVid || oldVid === newVid) continue;
    html = html.split(oldVid).join(newVid);
  }

  // 1. Apply image overrides (longest URL first)
  const imgEntries = Object.entries(imageOverrides).sort((a, b) => b[0].length - a[0].length);
  for (const [oldSrc, newSrc] of imgEntries) {
    if (!oldSrc || !newSrc || oldSrc === newSrc) continue;
    html = html.split(oldSrc).join(newSrc);
  }

  // 2. Apply link overrides
  const linkEntries = Object.entries(linkOverrides).sort((a, b) => b[0].length - a[0].length);
  for (const [oldHref, newHref] of linkEntries) {
    if (!oldHref || !newHref || oldHref === newHref) continue;
    html = html
      .replace(new RegExp(`href=(["'])${escapeRegExp(oldHref)}\\1`, 'g'), `href=$1${newHref}$1`);
  }

  // 3. Apply text overrides inside text content between tags (>...<)
  const textEntries = Object.entries(textOverrides)
    .filter(([k, v]) => k && typeof v === 'string' && k !== v)
    .sort((a, b) => b[0].length - a[0].length);

  if (textEntries.length > 0) {
    const normMap = new Map<string, string>();
    for (const [oldTxt, newTxt] of textEntries) {
      normMap.set(normalizeText(oldTxt), newTxt);
    }
    html = html.replace(/>([^<>]+)</g, (fullMatch, innerText: string) => {
      const norm = normalizeText(innerText);
      if (!norm) return fullMatch;
      const replacement = normMap.get(norm);
      if (replacement !== undefined) {
        return `>${replacement}<`;
      }
      return fullMatch;
    });
  }

  return html;
}

/**
 * Hydrates inline CSS style blocks with any image_overrides (e.g. .ladi-image-background URLs).
 */
export function hydrateStyleCss(
  rawCss: string,
  allPayloads: Record<string, any>[] = []
): string {
  let css = rawCss;
  const imageOverrides: Record<string, string> = {};
  const videoOverrides: Record<string, string> = {};
  for (const p of allPayloads) {
    if (p?.image_overrides && typeof p.image_overrides === 'object') {
      Object.assign(imageOverrides, p.image_overrides);
    }
    if (p?.video_overrides && typeof p.video_overrides === 'object') {
      Object.assign(videoOverrides, p.video_overrides);
    }
  }
  for (const [oldVid, newVid] of Object.entries(videoOverrides)) {
    if (!oldVid || !newVid || oldVid === newVid) continue;
    css = css.split(oldVid).join(newVid);
  }
  const imgEntries = Object.entries(imageOverrides).sort((a, b) => b[0].length - a[0].length);
  for (const [oldSrc, newSrc] of imgEntries) {
    if (!oldSrc || !newSrc || oldSrc === newSrc) continue;
    css = css.split(oldSrc).join(newSrc);
  }
  return css;
}
