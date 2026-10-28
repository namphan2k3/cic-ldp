import type { MetadataRoute } from 'next';
import { getAllLandingSites } from '@cic/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const rawSites = await getAllLandingSites();
    const lockedSite = process.env.DEFAULT_SITE_CODE?.trim();
    const sites = lockedSite
      ? rawSites.filter((s) => s.landing_site_code === lockedSite)
      : rawSites;

    const entries: MetadataRoute.Sitemap = [];
    for (const s of sites) {
      const base = `https://${s.primary_domain || `${s.landing_site_code}.cic.com.vn`}`;
      entries.push({
        url: base,
        lastModified: s.updated_at_utc || new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      });
      if ((s.supported_locales_json || []).includes('en')) {
        entries.push({
          url: `${base}?lang=en`,
          lastModified: s.updated_at_utc || new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }
    return entries;
  } catch {
    return [];
  }
}
