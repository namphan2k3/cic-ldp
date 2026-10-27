import { getDb } from '@cic/db';

export interface PlatformActor {
  userId: number;
  email: string;
  fullName: string;
  roleCode: string;
  roleName: string;
}

export async function getDefaultPlatformActor(): Promise<PlatformActor> {
  const sql = getDb();
  const [user] = await sql<{
    id: number;
    email: string;
    full_name: string | null;
    username: string | null;
    role_code: string | null;
    role_name: string | null;
  }[]>`
    SELECT
      u.id,
      COALESCE(u.email, 'admin@cic.com.vn') AS email,
      u.full_name,
      u.username,
      r.code AS role_code,
      r.name AS role_name
    FROM public.cic_users u
    LEFT JOIN public.cic_user_roles ur ON ur.user_id = u.id
    LEFT JOIN public.cic_roles r ON r.id = ur.role_id
    WHERE COALESCE(u.published, true) = true
    ORDER BY
      CASE WHEN r.code = 'superadmin' THEN 0 WHEN r.code = 'admin' THEN 1 ELSE 2 END,
      u.id ASC
    LIMIT 1
  `;

  if (!user) {
    return {
      userId: 1,
      email: 'admin@cic.com.vn',
      fullName: 'CIC Administrator',
      roleCode: 'superadmin',
      roleName: 'Super Administrator',
    };
  }

  return {
    userId: Number(user.id),
    email: user.email,
    fullName: user.full_name || user.username || 'CIC Admin',
    roleCode: user.role_code || 'admin',
    roleName: user.role_name || 'Quản trị viên',
  };
}

export async function hasPlatformPermission(
  userId: number,
  taskKey: 'sites' | 'sheet_sync' | 'backups' | 'landing_content' | 'forms' | 'activity_logs',
  action: string
): Promise<boolean> {
  const sql = getDb();
  const [row] = await sql<{ allowed: boolean }[]>`
    SELECT true AS allowed
    FROM public.cic_user_roles ur
    JOIN public.cic_roles r ON r.id = ur.role_id
    LEFT JOIN public.cic_role_permissions rp ON rp.role_id = r.id
    LEFT JOIN public.cic_permission_tasks pt ON pt.id = rp.permission_task_id
    WHERE ur.user_id = ${userId}
      AND (
        r.code IN ('superadmin', 'admin')
        OR (pt._task = ${taskKey} AND rp.action = ${action} AND rp.allowed = true)
      )
    LIMIT 1
  `;
  return Boolean(row?.allowed);
}
