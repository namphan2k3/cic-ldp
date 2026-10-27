import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '@cic/db';
import { SCHEMA_SQL_TEMPLATE, AUTO_SEED_MJS_TEMPLATE } from './deployTemplates';

export interface DeployExportSummary {
  packageName: string;
  outputPath: string;
  sitesCount: number;
  pagesCount: number;
  sectionsCount: number;
  formsCount: number;
  mediaCount: number;
  leadsCount: number;
  exportedAt: string;
}

function resolveWorkspaceRoots() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'apps', 'landing-hub', 'package.json'))) {
    return { monorepoRoot: cwd, appRoot: path.join(cwd, 'apps', 'landing-hub') };
  }
  return { monorepoRoot: path.resolve(cwd, '../..'), appRoot: cwd };
}

export async function buildSeedPayload(targetSiteCode?: string) {
  const sql = getDb();
  const isSpecificSite = Boolean(targetSiteCode && targetSiteCode !== 'ALL');

  const sectionTypes = await sql`
    SELECT * FROM cic_landing.landing_section_types ORDER BY landing_section_type_code ASC
  `;

  const sites = isSpecificSite
    ? await sql`
        SELECT * FROM cic_landing.landing_sites
        WHERE landing_site_code = ${targetSiteCode!}
        ORDER BY landing_site_code ASC
      `
    : await sql`
        SELECT * FROM cic_landing.landing_sites ORDER BY landing_site_code ASC
      `;

  const siteIds = sites.map((s) => s.landing_site_id as string);
  if (siteIds.length === 0) {
    return {
      exportedAt: new Date().toISOString(),
      targetSiteCode: targetSiteCode || 'ALL',
      sectionTypes,
      sites: [],
      pages: [],
      sections: [],
      forms: [],
      media: [],
      leads: [],
      pageViews: [],
    };
  }

  const pages = await sql`
    SELECT * FROM cic_landing.landing_pages
    WHERE landing_site_id IN ${sql(siteIds)}
    ORDER BY landing_site_id ASC, landing_page_locale ASC
  `;

  const pageIds = pages.map((p) => p.landing_page_id as string);

  const sections =
    pageIds.length > 0
      ? await sql`
          SELECT * FROM cic_landing.landing_page_sections
          WHERE landing_page_id IN ${sql(pageIds)}
          ORDER BY landing_page_id ASC, section_order ASC
        `
      : [];

  const forms = await sql`
    SELECT * FROM cic_landing.landing_forms
    WHERE landing_site_id IN ${sql(siteIds)}
    ORDER BY landing_site_id ASC, form_code ASC
  `;

  const rawMedia = await sql`
    SELECT * FROM cic_landing.landing_media_assets
    WHERE landing_site_id IN ${sql(siteIds)} OR landing_site_id IS NULL
    ORDER BY created_at_utc ASC
  `;

  const { appRoot } = resolveWorkspaceRoots();
  const publicDir = path.join(appRoot, 'public');
  const siteIdToCode = Object.fromEntries(
    sites.map((s) => [s.landing_site_id as string, s.landing_site_code as string])
  );

  const media = rawMedia.map((m) => {
    const bytea = m.file_content_bytea as Buffer | Uint8Array | null;
    const sc = siteIdToCode[m.landing_site_id as string] || '';
    const rel = String(m.file_path || '').replace(/^\/+/, '');
    const p1 = sc ? path.join(publicDir, 'sites', sc, rel) : path.join(publicDir, rel);
    const p2 = path.join(publicDir, rel);
    let existsOnDisk =
      Boolean(rel) &&
      ((fs.existsSync(p1) && fs.statSync(p1).isFile()) ||
        (fs.existsSync(p2) && fs.statSync(p2).isFile()));

    if (!existsOnDisk && bytea && rel) {
      try {
        fs.mkdirSync(path.dirname(p1), { recursive: true });
        fs.writeFileSync(p1, Buffer.from(bytea));
        existsOnDisk = true;
      } catch {
        // Fallback to inline base64 if disk write fails
      }
    }

    const base64 = !existsOnDisk && bytea ? Buffer.from(bytea).toString('base64') : null;
    const { file_content_bytea: _omit, ...rest } = m;
    return {
      ...rest,
      ...(base64 ? { file_content_base64: base64 } : {}),
    };
  });

  const leads = await sql`
    SELECT * FROM cic_landing.landing_lead_submissions
    WHERE landing_site_id IN ${sql(siteIds)}
    ORDER BY submitted_at_utc ASC
  `;

  const pageViews = await sql`
    SELECT
      landing_site_id,
      TO_CHAR(view_date, 'YYYY-MM-DD') AS view_date,
      views_count,
      unique_visitors_count
    FROM cic_landing.landing_page_views
    WHERE landing_site_id IN ${sql(siteIds)}
    ORDER BY view_date ASC
  `;

  const adminAccounts = isSpecificSite
    ? await sql`
        SELECT username, password_hash, display_name, role, landing_site_code, is_active
        FROM cic_landing.landing_admin_accounts
        WHERE landing_site_code = ${targetSiteCode!} OR role = 'super_admin'
      `
    : await sql`
        SELECT username, password_hash, display_name, role, landing_site_code, is_active
        FROM cic_landing.landing_admin_accounts
      `;

  return {
    exportedAt: new Date().toISOString(),
    targetSiteCode: targetSiteCode || 'ALL',
    sectionTypes,
    sites,
    pages,
    sections,
    forms,
    media,
    leads,
    pageViews,
    adminAccounts,
  };
}

function copyDirFiltered(srcDir: string, destDir: string, excludeNames: Set<string>) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (excludeNames.has(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirFiltered(srcPath, destPath, excludeNames);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function exportDeployFolder(
  targetSiteCode?: string,
  customDestDir?: string
): Promise<DeployExportSummary> {
  const isSpecific = Boolean(targetSiteCode && targetSiteCode !== 'ALL');
  const packageName = isSpecific ? `deploy-${targetSiteCode}` : 'deploy-cic-landing-hub';

  const { appRoot, monorepoRoot } = resolveWorkspaceRoots();
  const baseParentDir =
    customDestDir && customDestDir.trim()
      ? path.resolve(customDestDir.trim())
      : path.join(monorepoRoot, 'dist-deploy');
  const outputDir =
    path.basename(baseParentDir).toLowerCase() === packageName.toLowerCase()
      ? baseParentDir
      : path.join(baseParentDir, packageName);

  // Clean previous export folder if present
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  // 1. Export database snapshot
  const payload = await buildSeedPayload(targetSiteCode);
  const seedDir = path.join(outputDir, 'seed');
  fs.mkdirSync(seedDir, { recursive: true });

  fs.writeFileSync(path.join(seedDir, 'schema.sql'), SCHEMA_SQL_TEMPLATE, 'utf8');
  fs.writeFileSync(path.join(seedDir, 'auto-seed.mjs'), AUTO_SEED_MJS_TEMPLATE, 'utf8');
  fs.writeFileSync(path.join(seedDir, 'seed-data.json'), JSON.stringify(payload, null, 2), 'utf8');

  // 2. Copy root workspace files & shared packages
  for (const rootFile of ['package.json', 'package-lock.json', 'tsconfig.base.json']) {
    const srcFile = path.join(monorepoRoot, rootFile);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(outputDir, rootFile));
    }
  }

  const excludeCommon = new Set(['node_modules', '.git', '.turbo', 'dist-deploy', '.DS_Store']);
  copyDirFiltered(
    path.join(monorepoRoot, 'packages'),
    path.join(outputDir, 'packages'),
    excludeCommon
  );
  copyDirFiltered(
    path.join(monorepoRoot, 'credentials'),
    path.join(outputDir, 'credentials'),
    excludeCommon
  );

  // 3. Copy apps/landing-hub (including pre-built .next production bundle, excluding .next/cache)
  const excludeLandingHub = new Set([
    'node_modules',
    '.git',
    '.turbo',
    'cache', // exclude .next/cache to keep package compact
  ]);
  copyDirFiltered(
    appRoot,
    path.join(outputDir, 'apps', 'landing-hub'),
    excludeLandingHub
  );

  // If exporting a specific site, remove other sites' folders from public/sites and public/media
  if (isSpecific && targetSiteCode) {
    for (const sub of ['sites', 'media']) {
      const publicSubDir = path.join(outputDir, 'apps', 'landing-hub', 'public', sub);
      if (fs.existsSync(publicSubDir)) {
        for (const entry of fs.readdirSync(publicSubDir, { withFileTypes: true })) {
          if (entry.isDirectory() && entry.name !== targetSiteCode) {
            fs.rmSync(path.join(publicSubDir, entry.name), { recursive: true, force: true });
          }
        }
      }
    }
  }

  // 4. Write .env.example and .env template to both package root (for auto-seed.mjs) and apps/landing-hub (for next start)
  const defaultSiteLine = isSpecific ? `DEFAULT_SITE_CODE=${targetSiteCode}\n` : '';
  const activeDbUrl = (
    process.env.DATABASE_URL?.trim() ||
    'postgresql://postgres:cic_supabase_2026@127.0.0.1:54322/postgres'
  ).replace('@localhost:', '@127.0.0.1:');

  const envTemplate = [
    '# Cấu hình Kết nối Database chung trên Host',
    `DATABASE_URL=${activeDbUrl}`,
    'PORT=3000',
    defaultSiteLine.trim(),
  ]
    .filter(Boolean)
    .join('\n') + '\n';

  fs.writeFileSync(path.join(outputDir, '.env.example'), envTemplate, 'utf8');
  fs.writeFileSync(path.join(outputDir, '.env'), envTemplate, 'utf8');
  fs.writeFileSync(
    path.join(outputDir, 'apps', 'landing-hub', '.env.example'),
    envTemplate,
    'utf8'
  );
  fs.writeFileSync(path.join(outputDir, 'apps', 'landing-hub', '.env'), envTemplate, 'utf8');

  // 5. Write 1-click Startup Scripts (Linux start.sh, Windows start.bat, PM2 ecosystem.config.cjs, README)
  const startSh = `#!/usr/bin/env bash
set -e
echo "=== [1/3] Kiểm tra thư viện hệ thống ==="
if [ ! -d "node_modules" ]; then
  npm install
fi
if [ ! -d "apps/landing-hub/.next" ]; then
  npm --prefix apps/landing-hub run build
fi
echo "=== [2/3] Tự động khởi tạo & nạp dữ liệu vào Database chung (Auto-Seed) ==="
node seed/auto-seed.mjs
echo "=== [3/3] Khởi chạy máy chủ (${packageName}) ==="
cd apps/landing-hub && npx next start -p \${PORT:-3000}
`;

  const startBat = `@echo off
echo === [1/3] Kiem tra thu vien he thong ===
if not exist "node_modules" (
  call npm install
)
if not exist "apps\\landing-hub\\.next" (
  call npm --prefix apps/landing-hub run build
)
echo === [2/3] Tu dong khoi tao va nap du lieu vao Database chung (Auto-Seed) ===
node seed/auto-seed.mjs
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
echo === [3/3] Khoi chay may chu (${packageName}) ===
cd apps\\landing-hub
npx next start -p 3000
`;

  const pm2Config = `module.exports = {
  apps: [
    {
      name: '${packageName}',
      cwd: './apps/landing-hub',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p ' + (process.env.PORT || 3000),
      env: {
        NODE_ENV: 'production',
        ${isSpecific ? `DEFAULT_SITE_CODE: '${targetSiteCode}',` : ''}
      },
    },
  ],
};
`;

  const readmeMd = `# Gói Triển Khai (${packageName})

Thư mục này đã đóng gói đầy đủ mã nguồn đã biên dịch (\`.next\`), cấu hình tên miền, nội dung (VI/EN), biểu mẫu, hình ảnh (\`bytea\`) và bộ tự động nạp dữ liệu (\`seed/auto-seed.mjs\`).

## Cách chạy trên Host (đã có chung Database PostgreSQL)

1. Mở file \`.env\` và kiểm tra chuỗi kết nối \`DATABASE_URL\` trỏ tới Database chung trên Host.
2. Chạy lệnh khởi động (hệ thống sẽ **tự động nạp dữ liệu vào Database** rồi bật máy chủ web):
   - **Trên Linux / Ubuntu Host**:
     \`\`\`bash
     chmod +x start.sh
     ./start.sh
     \`\`\`
   - **Trên Windows Server Host**:
     \`\`\`cmd
     start.bat
     \`\`\`
   - **Nếu chạy ngầm bằng PM2**:
     \`\`\`bash
     npm install && node seed/auto-seed.mjs && pm2 start ecosystem.config.cjs
     \`\`\`
`;

  fs.writeFileSync(path.join(outputDir, 'start.sh'), startSh, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'start.bat'), startBat, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'ecosystem.config.cjs'), pm2Config, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'README-DEPLOY.md'), readmeMd, 'utf8');

  return {
    packageName,
    outputPath: outputDir,
    sitesCount: payload.sites.length,
    pagesCount: payload.pages.length,
    sectionsCount: payload.sections.length,
    formsCount: payload.forms.length,
    mediaCount: payload.media.length,
    leadsCount: payload.leads.length,
    exportedAt: payload.exportedAt,
  };
}
