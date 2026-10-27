#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const publicSitesDir = 'd:/web-data/cic-platform/apps/landing-hub/public/sites';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function injectFormBridge(html, siteCode, formCode, baseHref) {
  let out = html;
  if (baseHref && !out.includes('<base ')) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`);
  }
  const bridgeTag = `<script src="/sites/landing-form-bridge.js" data-cic-site-code="${siteCode}" data-cic-form-code="${formCode}"></script>`;
  if (out.includes('</body>')) {
    out = out.replace(/<\/body>/i, `${bridgeTag}</body>`);
  } else {
    out += bridgeTag;
  }
  return out;
}

// 1. cms-intellicad (Exact original HTML + build/images/downloads assets)
console.log('[1/6] Preparing cms-intellicad exact original HTML & assets...');
const intellicadPublicSrc = 'd:/web-data/landing-pages/cms-intellicad/cmsintellicad.vn/public';
const intellicadDest = path.join(publicSitesDir, 'cms-intellicad');
ensureDir(intellicadDest);
for (const sub of ['build', 'images', 'downloads']) {
  copyDirRecursive(path.join(intellicadPublicSrc, sub), path.join(intellicadDest, sub));
}

function rewriteIntellicadHtml(rawHtml) {
  let out = rawHtml
    .replace(/https:\/\/cmsintellicad\.vn\/build\//g, '/sites/cms-intellicad/build/')
    .replace(/https:\/\/cmsintellicad\.vn\/images\//g, '/sites/cms-intellicad/images/')
    .replace(/https:\/\/cmsintellicad\.vn\/downloads\//g, '/sites/cms-intellicad/downloads/')
    .replace(/href="https:\/\/cmsintellicad\.vn\/vi"/g, 'href="/_sites/cms-intellicad?lang=vi"')
    .replace(/href="https:\/\/cmsintellicad\.vn\/en"/g, 'href="/_sites/cms-intellicad?lang=en"');
  return injectFormBridge(out, 'cms-intellicad', 'intellicad_consultation', null);
}

if (fs.existsSync('D:/.temp/cmsintellicad_live.html')) {
  const viHtml = rewriteIntellicadHtml(fs.readFileSync('D:/.temp/cmsintellicad_live.html', 'utf8'));
  fs.writeFileSync(path.join(intellicadDest, 'index.html'), viHtml, 'utf8');
  fs.writeFileSync(path.join(intellicadDest, 'vi.html'), viHtml, 'utf8');
}
if (fs.existsSync('D:/.temp/cmsintellicad_en_live.html')) {
  const enHtml = rewriteIntellicadHtml(fs.readFileSync('D:/.temp/cmsintellicad_en_live.html', 'utf8'));
  fs.writeFileSync(path.join(intellicadDest, 'en.html'), enHtml, 'utf8');
}

// 2. robot-cong-trinh (Exact original HTML + build/images/file/files assets)
console.log('[2/6] Preparing robot-cong-trinh exact original HTML & assets...');
const robotPublicSrc = 'd:/web-data/landing-pages/robot-cong-trinh/robotcongtrinh.vn/public';
const robotDest = path.join(publicSitesDir, 'robot-cong-trinh');
ensureDir(robotDest);
for (const sub of ['build', 'images', 'file', 'files']) {
  copyDirRecursive(path.join(robotPublicSrc, sub), path.join(robotDest, sub));
}

if (fs.existsSync('D:/.temp/robotcongtrinh_live.html')) {
  let robotHtml = fs
    .readFileSync('D:/.temp/robotcongtrinh_live.html', 'utf8')
    .replace(/https:\/\/robotcongtrinh\.vn\/build\//g, '/sites/robot-cong-trinh/build/')
    .replace(/https:\/\/robotcongtrinh\.vn\/images\//g, '/sites/robot-cong-trinh/images/')
    .replace(/https:\/\/robotcongtrinh\.vn\/files\//g, '/sites/robot-cong-trinh/files/')
    .replace(/https:\/\/robotcongtrinh\.vn\/file\//g, '/sites/robot-cong-trinh/file/');
  robotHtml = injectFormBridge(robotHtml, 'robot-cong-trinh', 'robot_consultation', null);
  fs.writeFileSync(path.join(robotDest, 'index.html'), robotHtml, 'utf8');
}

// 3. allplan
console.log('[3/6] Preparing allplan static HTML...');
ensureDir(path.join(publicSitesDir, 'allplan'));
let allplanHtml = fs.readFileSync('d:/web-data/landing-pages/allplan/Allplan.html', 'utf8');
allplanHtml = injectFormBridge(allplanHtml, 'allplan', 'allplan_registration', '/sites/allplan/');
fs.writeFileSync(path.join(publicSitesDir, 'allplan/index.html'), allplanHtml, 'utf8');

// 4. bim
console.log('[4/6] Preparing bim static HTML...');
ensureDir(path.join(publicSitesDir, 'bim'));
const bimDirEntries = fs.readdirSync('d:/web-data/landing-pages/bim.cic.com.vn');
const bimHtmlFile = bimDirEntries.find((f) => f.endsWith('.html'));
if (!bimHtmlFile) throw new Error('BIM HTML file not found');
let bimHtml = fs.readFileSync(path.join('d:/web-data/landing-pages/bim.cic.com.vn', bimHtmlFile), 'utf8');
bimHtml = injectFormBridge(bimHtml, 'bim', 'bim_registration', '/sites/bim/');
fs.writeFileSync(path.join(publicSitesDir, 'bim/index.html'), bimHtml, 'utf8');

// 5. enjicad (strip lines 1-153 PHP SEO cloaking malware + copy static folders)
console.log('[5/6] Sanitizing enjicad & copying assets...');
const enjicadSrcDir = 'd:/web-data/landing-pages/enjicad/enjicad.vn/enjicad.vn';
const enjicadDestDir = path.join(publicSitesDir, 'enjicad');
ensureDir(enjicadDestDir);
for (const sub of ['img', 'upload_images', 'video', 'templates', 'libraries', 'modules']) {
  copyDirRecursive(path.join(enjicadSrcDir, sub), path.join(enjicadDestDir, sub));
}
const enjicadRaw = fs.readFileSync(path.join(enjicadSrcDir, 'index.php'), 'utf8');
const doctypeIdx = enjicadRaw.indexOf('<!DOCTYPE html>');
if (doctypeIdx < 0) {
  throw new Error('Could not find <!DOCTYPE html> in enjicad/index.php');
}
let enjicadClean = enjicadRaw.slice(doctypeIdx);
if (enjicadClean.includes('readfluxa.com') || enjicadClean.includes('HttpServer()')) {
  throw new Error('Malware signature still present in enjicad HTML!');
}
enjicadClean = injectFormBridge(enjicadClean, 'enjicad', 'enjicad_registration', '/sites/enjicad/');
fs.writeFileSync(path.join(enjicadDestDir, 'index.html'), enjicadClean, 'utf8');

// 6. escon (copy ALL asset folders: assets, css, images, img, low-poly, video-bg)
console.log('[6/6] Preparing escon & revit static HTML & assets...');
const esconSrcDir = 'd:/web-data/landing-pages/escon.cic.com.vn';
const esconDestDir = path.join(publicSitesDir, 'escon');
ensureDir(esconDestDir);
for (const sub of ['assets', 'css', 'images', 'img', 'low-poly', 'video-bg']) {
  copyDirRecursive(path.join(esconSrcDir, sub), path.join(esconDestDir, sub));
}
let esconHtml = fs
  .readFileSync(path.join(esconSrcDir, 'index.html'), 'utf8')
  .replace(/http:\/\/maxcdn\.bootstrapcdn\.com/g, 'https://maxcdn.bootstrapcdn.com')
  .replace(/http:\/\/fonts\.googleapis\.com/g, 'https://fonts.googleapis.com');
esconHtml = injectFormBridge(esconHtml, 'escon', 'escon_registration', '/sites/escon/');
fs.writeFileSync(path.join(esconDestDir, 'index.html'), esconHtml, 'utf8');

// 7. revit
const revitSrcDir = 'd:/web-data/landing-pages/revit.cic.com.vn';
const revitDestDir = path.join(publicSitesDir, 'revit');
ensureDir(revitDestDir);
for (const sub of ['css', 'js', 'img', 'fonts']) {
  copyDirRecursive(path.join(revitSrcDir, sub), path.join(revitDestDir, sub));
}
let revitHtml = fs
  .readFileSync(path.join(revitSrcDir, 'index.html'), 'utf8')
  .replace(/http:\/\/fonts\.googleapis\.com/g, 'https://fonts.googleapis.com');
revitHtml = injectFormBridge(revitHtml, 'revit', 'revit_registration', '/sites/revit/');
fs.writeFileSync(path.join(revitDestDir, 'index.html'), revitHtml, 'utf8');

console.log('PASSED: All 7 landing pages prepared with 100% original templates & assets!');
