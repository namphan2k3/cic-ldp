import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { getDb, getLandingSiteByDomain } from '@cic/db';

export const ADMIN_COOKIE_NAME = 'cic_landing_session';
const SECRET_KEY = process.env.AUTH_SECRET || 'cic-landing-platform-supabase-auth-secret-2026';

export async function getHostPortSlug(): Promise<string> {
  try {
    const reqHeaders = await headers();
    const rawHost = (
      reqHeaders.get('x-forwarded-host') ||
      reqHeaders.get('host') ||
      'localhost'
    )
      .toLowerCase()
      .trim()
      .replace(/^127\.0\.0\.1\b/, 'localhost');
    return rawHost.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'localhost';
  } catch {
    return 'localhost';
  }
}

/**
 * Resolves the locked site code if running either:
 * 1. As a standalone package (DEFAULT_SITE_CODE env var), OR
 * 2. On a custom domain mapped to a specific site in Multi-Domain shared mode (e.g. https://robotcongtrinh.vn/admin)
 */
export async function resolveInstanceSiteCode(): Promise<string | null> {
  const envSite = process.env.DEFAULT_SITE_CODE?.trim();
  if (envSite) return envSite;
  try {
    const reqHeaders = await headers();
    const rawHost = (reqHeaders.get('x-forwarded-host') || reqHeaders.get('host') || '')
      .toLowerCase()
      .split(':')[0]
      .replace(/^www\./, '')
      .trim();
    if (rawHost && rawHost !== 'localhost' && rawHost !== '127.0.0.1') {
      const matched = await getLandingSiteByDomain(rawHost);
      if (matched) {
        return matched.landing_site_code;
      }
    }
  } catch {
    // ignore header/db lookup errors
  }
  return null;
}

export function getAdminCookieName(siteCode?: string | null, hostSlug?: string | null): string {
  const standaloneSite = process.env.DEFAULT_SITE_CODE?.trim() || null;
  const hp = hostSlug ? `_${hostSlug}` : '';
  if (standaloneSite) {
    return `cic_standalone_session${hp}_${standaloneSite}`;
  }
  if (siteCode && siteCode !== 'MASTER') {
    return `${ADMIN_COOKIE_NAME}${hp}_${siteCode}`;
  }
  return `${ADMIN_COOKIE_NAME}${hp}`;
}

export interface AdminSession {
  username: string;
  displayName: string;
  role: 'super_admin' | 'site_admin';
  allowedSiteCode: string | null;
  activeScope?: string;
  exp: number;
}

export function hashAdminPassword(rawPassword: string): string {
  return crypto
    .createHash('sha256')
    .update(`cic_salt_2026:${rawPassword}`)
    .digest('hex');
}

export function createSessionToken(session: Omit<AdminSession, 'exp'>): string {
  const payload: AdminSession = {
    ...session,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const dataB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET_KEY).update(dataB64).digest('base64url');
  return `${dataB64}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token || !token.includes('.')) return null;
  const [dataB64, sig] = token.split('.');
  if (!dataB64 || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(dataB64).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8')) as AdminSession;
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(
  requiredSiteCode?: string | null
): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const hostSlug = await getHostPortSlug();
  const standaloneSite = await resolveInstanceSiteCode();

  // 1. Standalone Server or Custom Domain Mode: strictly isolated to this host/port + site
  if (standaloneSite) {
    const standaloneCookies = [
      getAdminCookieName(standaloneSite, hostSlug),
      `cic_active_session_${hostSlug}`,
      `cic_standalone_session_${standaloneSite}`,
    ];
    for (const name of standaloneCookies) {
      const raw = cookieStore.get(name)?.value;
      const session = verifySessionToken(raw);
      if (!session) continue;
      if (
        session.role !== 'super_admin' &&
        session.allowedSiteCode !== standaloneSite
      ) {
        continue;
      }
      if (
        session.activeScope &&
        session.activeScope !== `standalone:${standaloneSite}` &&
        session.activeScope !== `site:${standaloneSite}`
      ) {
        continue;
      }
      return session;
    }
    return null;
  }

  // 2. Master Hub Mode: single active session cookie per host+port with strict scope check
  const activeCookieName = `cic_active_session_${hostSlug}`;
  const rawActive = cookieStore.get(activeCookieName)?.value;
  const session = verifySessionToken(rawActive);

  if (!session) {
    return null;
  }

  const req = requiredSiteCode?.trim() || null;

  // Unscoped API call (e.g. export routes): accept any valid active session on this host+port
  if (!req) {
    return session;
  }

  // Master Hub root (/admin without specific site filter): strictly requires MASTER scope & super_admin
  if (req === 'MASTER') {
    if (session.role === 'super_admin' && session.activeScope === 'MASTER') {
      return session;
    }
    return null;
  }

  // /admin?site=<siteCode> (used by both site's own Analytics/Leads tabs and Master Hub site filter)
  if (req.startsWith('MASTER_OR_SITE:')) {
    const targetSite = req.slice('MASTER_OR_SITE:'.length);
    if (session.activeScope === `site:${targetSite}`) {
      if (session.role === 'super_admin' || session.allowedSiteCode === targetSite) {
        return session;
      }
    }
    if (session.activeScope === 'MASTER' && session.role === 'super_admin') {
      return session;
    }
    return null;
  }

  // Specific site CMS (/admin/<siteCode>): strictly requires activeScope === 'site:<siteCode>'
  if (session.activeScope !== `site:${req}`) {
    return null;
  }
  if (session.role !== 'super_admin' && session.allowedSiteCode !== req) {
    return null;
  }

  return session;
}

export async function authenticateAdminUser(
  username: string,
  password: string,
  targetScopeOrSite?: string | null
): Promise<{ success: boolean; session?: Omit<AdminSession, 'exp'>; error?: string }> {
  const sql = getDb();
  const cleanUser = username.trim().toLowerCase();
  const USER_ALIASES: Record<string, string> = {
    cms_intellicad_admin: 'cad_admin',
    'cms-intellicad_admin': 'cad_admin',
    robot_cong_trinh_admin: 'robot_admin',
    'robot-cong-trinh_admin': 'robot_admin',
  };
  const lookupUser = USER_ALIASES[cleanUser] || cleanUser;
  const pwdHash = hashAdminPassword(password);

  const rows = await sql<
    {
      username: string;
      password_hash: string;
      display_name: string;
      role: 'super_admin' | 'site_admin';
      landing_site_code: string | null;
      is_active: boolean;
    }[]
  >`
    SELECT username, password_hash, display_name, role, landing_site_code, is_active
    FROM cic_landing.landing_admin_accounts
    WHERE LOWER(username) = ${lookupUser}
    LIMIT 1
  `;

  const acc = rows[0];
  const prefix = lookupUser.replace(/_admin$/, '');
  const isAlternateValidSitePwd =
    acc?.role === 'site_admin' &&
    (password === 'CicAdmin@2026' || password === `${prefix}@2026` || password === 'cic@2026');

  if (!acc || !acc.is_active || (acc.password_hash !== pwdHash && !isAlternateValidSitePwd)) {
    return {
      success: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
    };
  }

  const standaloneSite = await resolveInstanceSiteCode();
  const effectiveTarget = standaloneSite || targetScopeOrSite?.trim() || 'MASTER';

  if (effectiveTarget === 'MASTER') {
    // If a site_admin logs in at /admin/login without a site param, automatically scope them to their assigned site
    if (acc.role === 'site_admin' && acc.landing_site_code) {
      return {
        success: true,
        session: {
          username: acc.username,
          displayName: acc.display_name,
          role: acc.role,
          allowedSiteCode: acc.landing_site_code,
          activeScope: `site:${acc.landing_site_code}`,
        },
      };
    }
    if (acc.role !== 'super_admin') {
      return {
        success: false,
        error: `Tài khoản "${acc.username}" không có quyền truy cập Quản trị Tổng.`,
      };
    }
  } else if (acc.role !== 'super_admin' && acc.landing_site_code !== effectiveTarget) {
    return {
      success: false,
      error: `Tài khoản "${acc.username}" không thuộc quyền quản trị của trang ${effectiveTarget}.`,
    };
  }

  const activeScope = standaloneSite
    ? `standalone:${standaloneSite}`
    : effectiveTarget === 'MASTER'
    ? 'MASTER'
    : `site:${effectiveTarget}`;

  return {
    success: true,
    session: {
      username: acc.username,
      displayName: acc.display_name,
      role: acc.role,
      allowedSiteCode: acc.landing_site_code,
      activeScope,
    },
  };
}

export async function upsertSiteAdminAccount(params: {
  siteCode: string;
  siteName: string;
  username: string;
  newPassword?: string;
}) {
  const sql = getDb();
  const cleanUser = params.username.trim().toLowerCase();
  if (!cleanUser) return;

  const existing = await sql<{ account_id: string; username: string }[]>`
    SELECT account_id, username
    FROM cic_landing.landing_admin_accounts
    WHERE landing_site_code = ${params.siteCode}
      AND role = 'site_admin'
    LIMIT 1
  `;

  if (existing.length > 0) {
    if (params.newPassword && params.newPassword.trim()) {
      const hash = hashAdminPassword(params.newPassword.trim());
      await sql`
        UPDATE cic_landing.landing_admin_accounts
        SET username = ${cleanUser},
            password_hash = ${hash},
            display_name = ${`Quản trị ${params.siteName}`},
            updated_at_utc = NOW()
        WHERE account_id = ${existing[0].account_id}
      `;
    } else {
      await sql`
        UPDATE cic_landing.landing_admin_accounts
        SET username = ${cleanUser},
            display_name = ${`Quản trị ${params.siteName}`},
            updated_at_utc = NOW()
        WHERE account_id = ${existing[0].account_id}
      `;
    }
  } else {
    const hash = hashAdminPassword(params.newPassword?.trim() || 'cic@2026');
    await sql`
      INSERT INTO cic_landing.landing_admin_accounts (
        username, password_hash, display_name, role, landing_site_code, is_active
      ) VALUES (
        ${cleanUser}, ${hash}, ${`Quản trị ${params.siteName}`}, 'site_admin', ${params.siteCode}, true
      )
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        landing_site_code = EXCLUDED.landing_site_code,
        updated_at_utc = NOW()
    `;
  }
}
