import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getLandingSiteByCode, getLandingSiteByDomain } from '@cic/db';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let sitemapUrl = '/sitemap.xml';
  try {
    const lockedSite = process.env.DEFAULT_SITE_CODE?.trim();
    if (lockedSite) {
      const site = await getLandingSiteByCode(lockedSite);
      if (site?.primary_domain) {
        sitemapUrl = `https://${site.primary_domain}/sitemap.xml`;
      }
    } else {
      const reqHeaders = await headers();
      const host = (reqHeaders.get('host') || '').toLowerCase().split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        const site = await getLandingSiteByDomain(host);
        if (site?.primary_domain) {
          sitemapUrl = `https://${site.primary_domain}/sitemap.xml`;
        }
      }
    }
  } catch {
    // fallback to relative /sitemap.xml
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/s/'],
        disallow: ['/admin', '/admin/', '/cms', '/api/'],
      },
    ],
    sitemap: sitemapUrl,
  };
}
