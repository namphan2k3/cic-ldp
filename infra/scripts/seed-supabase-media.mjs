import fs from 'node:fs';
import path from 'node:path';
import postgres from '../../node_modules/postgres/src/index.js';

const sql = postgres({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'cic_supabase_2026',
  database: 'postgres',
  ssl: false,
});

const CMS_SOURCE_ROOT = 'd:/web-data/landing-pages/cms-intellicad/cmsintellicad.vn/public';
const ROBOT_SOURCE_ROOT = 'd:/web-data/landing-pages/robot-cong-trinh/robotcongtrinh.vn/public';
const PUBLIC_MEDIA_TARGET = 'd:/web-data/cic-platform/apps/landing-hub/public/media';

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    case '.pdf': return 'application/pdf';
    case '.rar': return 'application/vnd.rar';
    case '.zip': return 'application/zip';
    case '.mp4': return 'video/mp4';
    default: return 'application/octet-stream';
  }
}

async function collectFiles(dir, baseDir = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

async function main() {
  console.log('==> Step 1: Updating schema cic_landing.landing_media_assets...');
  await sql.unsafe(`
    ALTER TABLE cic_landing.landing_media_assets 
    ADD COLUMN IF NOT EXISTS file_content_bytea BYTEA;
  `);

  // Get site IDs
  const sites = await sql`
    SELECT landing_site_id, landing_site_code FROM cic_landing.landing_sites;
  `;
  const siteMap = new Map();
  for (const s of sites) {
    siteMap.set(s.landing_site_code, s.landing_site_id);
  }

  console.log(`Found ${siteMap.size} sites in database.`);

  const siteConfigs = [
    {
      code: 'cms-intellicad',
      sourceDir: CMS_SOURCE_ROOT,
      folders: ['images', 'downloads'],
    },
    {
      code: 'robot-cong-trinh',
      sourceDir: ROBOT_SOURCE_ROOT,
      folders: ['images', 'file', 'files'],
    },
  ];

  for (const cfg of siteConfigs) {
    const siteId = siteMap.get(cfg.code);
    if (!siteId) {
      console.warn(`Warning: Site ${cfg.code} not found in DB! Skipping.`);
      continue;
    }

    console.log(`\n==> Ingesting media for site: ${cfg.code}...`);
    const siteTargetDir = path.join(PUBLIC_MEDIA_TARGET, cfg.code);
    fs.mkdirSync(siteTargetDir, { recursive: true });

    for (const folder of cfg.folders) {
      const folderPath = path.join(cfg.sourceDir, folder);
      if (!fs.existsSync(folderPath)) continue;

      const fileList = await collectFiles(folderPath, cfg.sourceDir);
      console.log(`  Found ${fileList.length} files in ${folder}/`);

      for (const item of fileList) {
        // Skip .gitkeep, .zip backup in images, etc.
        if (item.relPath.endsWith('.gitkeep') || item.relPath.endsWith('.zip')) {
          continue;
        }

        const buffer = fs.readFileSync(item.fullPath);
        const fileName = path.basename(item.fullPath);
        const mimeType = getMimeType(item.fullPath);
        const fileSize = buffer.length;

        // Copy to public/media folder for direct fallback
        const destPath = path.join(siteTargetDir, item.relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, buffer);

        // Store into Supabase PostgreSQL cic_landing.landing_media_assets
        await sql`
          INSERT INTO cic_landing.landing_media_assets (
            landing_site_id,
            media_slot_code,
            file_name,
            file_path,
            mime_type,
            file_size_bytes,
            alt_text_vi,
            alt_text_en,
            storage_provider,
            file_content_bytea,
            updated_at_utc
          ) VALUES (
            ${siteId},
            ${fileName.replace(/\.[^/.]+$/, '')},
            ${fileName},
            ${item.relPath},
            ${mimeType},
            ${fileSize},
            ${fileName},
            ${fileName},
            'supabase_pg_bytea',
            ${buffer},
            NOW()
          )
          ON CONFLICT (landing_media_asset_id) DO UPDATE SET
            file_content_bytea = EXCLUDED.file_content_bytea,
            file_size_bytes = EXCLUDED.file_size_bytes,
            updated_at_utc = NOW();
        `;
      }
    }
  }

  const assetCount = await sql`
    SELECT COUNT(*) as count, SUM(file_size_bytes) as total_size 
    FROM cic_landing.landing_media_assets 
    WHERE file_content_bytea IS NOT NULL;
  `;
  console.log(`\n=== Ingestion Complete ===`);
  console.log(`Stored ${assetCount[0].count} assets in Supabase PostgreSQL.`);
  console.log(`Total size: ${(Number(assetCount[0].total_size) / 1024 / 1024).toFixed(2)} MB`);

  await sql.end();
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
