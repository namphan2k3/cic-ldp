import tls from 'node:tls';
import { getDb, type CicSiteRow } from '@cic/db';

function checkSslExpiry(hostname: string, timeoutMs = 4000): Promise<Date | null> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host: hostname,
          port: 443,
          servername: hostname,
          rejectUnauthorized: false,
          timeout: timeoutMs,
        },
        () => {
          const cert = socket.getPeerCertificate();
          socket.end();
          if (cert && cert.valid_to) {
            const expiry = new Date(cert.valid_to);
            resolve(Number.isNaN(expiry.getTime()) ? null : expiry);
          } else {
            resolve(null);
          }
        }
      );
      socket.on('error', () => resolve(null));
      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

export async function checkSingleSiteHealth(site: CicSiteRow): Promise<{
  siteId: string;
  code: string;
  httpStatus: number;
  responseMs: number;
  sslExpiresAt: Date | null;
}> {
  const sql = getDb();
  const landingHubBase = process.env.LANDING_HUB_URL?.trim() || 'http://localhost:4301';
  const cicWebBase = process.env.CIC_WEB_URL?.trim() || 'http://localhost:4300';

  const targetUrl =
    site.site_type === 'portal'
      ? cicWebBase
      : `${landingHubBase}/_sites/${encodeURIComponent(site.code)}`;

  const started = Date.now();
  let httpStatus = 0;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    });
    clearTimeout(timer);
    httpStatus = res.status;
  } catch {
    // If local dev server isn't up yet, try primary_domain over https if configured
    if (site.primary_domain) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`https://${site.primary_domain}`, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
        });
        clearTimeout(timer);
        httpStatus = res.status;
      } catch {
        httpStatus = 0;
      }
    }
  }

  const responseMs = Date.now() - started;
  const sslExpiresAt = site.primary_domain ? await checkSslExpiry(site.primary_domain) : null;

  await sql`
    UPDATE public.cic_sites
    SET last_check_at = now(),
        last_http_status = ${httpStatus},
        last_response_ms = ${responseMs},
        ssl_expires_at = COALESCE(${sslExpiresAt}, ssl_expires_at)
    WHERE id = ${site.id}
  `;

  return {
    siteId: String(site.id),
    code: site.code,
    httpStatus,
    responseMs,
    sslExpiresAt,
  };
}

export async function checkAllSitesHealth(): Promise<
  Array<{
    siteId: string;
    code: string;
    httpStatus: number;
    responseMs: number;
    sslExpiresAt: Date | null;
  }>
> {
  const sql = getDb();
  const sites = await sql<CicSiteRow[]>`
    SELECT * FROM public.cic_sites WHERE status != 'archived' ORDER BY id ASC
  `;
  const results = [];
  for (const site of sites) {
    results.push(await checkSingleSiteHealth(site));
  }
  return results;
}
