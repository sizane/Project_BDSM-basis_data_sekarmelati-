import type { Request } from 'express';
import { p, runQuery } from '../../config/database';
import { AppError, ERRORS, isUniqueViolation } from '../../constants/error-codes';
import { ROLES, type AssignableRole } from '../../constants/roles';
import { hashPassword } from '../../utils/password';
import { buildMeta, offsetOf } from '../../utils/response';
import { catatAksesDitolak, tulisAuditLog } from '../audit-log/audit.service';
import type { CreateAdminBody, ListAdminsQuery } from './admin.schema';

interface AdminRow {
  admin_id: string;
  username: string;
  full_name: string;
  role: AssignableRole;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
}

// password_hash TIDAK pernah ikut dipilih untuk respons.
const ADMIN_COLUMNS = 'admin_id, username, full_name, role, is_active, last_login_at, created_at';

function toDto(row: AdminRow) {
  return {
    admin_id: row.admin_id,
    username: row.username,
    full_name: row.full_name,
    role: row.role,
    is_active: row.is_active,
    last_login_at: row.last_login_at ? row.last_login_at.toISOString() : null,
    created_at: row.created_at.toISOString(),
  };
}

export async function listAdmins(query: ListAdminsQuery) {
  const count = await runQuery<{ total: number }>('SELECT COUNT(*) AS total FROM dbo.admins');
  const rows = await runQuery<AdminRow>(
    `SELECT ${ADMIN_COLUMNS} FROM dbo.admins
      ORDER BY created_at ASC, admin_id
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    [p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)],
  );
  return {
    data: rows.recordset.map(toDto),
    meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
  };
}

/** Pemilik boleh melihat semua admin; Admin hanya dirinya sendiri (prinsip least privilege). */
export async function getAdmin(req: Request, id: string) {
  const user = req.user;
  if (!user) throw new AppError(ERRORS.AUTH_REQUIRED);
  if (user.role !== ROLES.PEMILIK && user.adminId.toLowerCase() !== id.toLowerCase()) {
    await catatAksesDitolak(req, [ROLES.PEMILIK]);
    throw new AppError(ERRORS.AUTH_FORBIDDEN);
  }
  const r = await runQuery<AdminRow>(`SELECT ${ADMIN_COLUMNS} FROM dbo.admins WHERE admin_id = @id`, [
    p.uuid('id', id),
  ]);
  const row = r.recordset[0];
  if (!row) throw new AppError(ERRORS.NOT_FOUND_ADMIN);
  return toDto(row);
}

export async function createAdmin(req: Request, body: CreateAdminBody) {
  const passwordHash = await hashPassword(body.password);
  try {
    const r = await runQuery<{ admin_id: string }>(
      `INSERT INTO dbo.admins (username, password_hash, full_name, role)
       OUTPUT INSERTED.admin_id
       VALUES (@username, @password_hash, @full_name, @role)`,
      [
        p.varchar('username', body.username, 50),
        p.varchar('password_hash', passwordHash, 255),
        p.varchar('full_name', body.full_name, 100),
        p.varchar('role', body.role, 20),
      ],
      req.dbContext,
    );
    const adminId = r.recordset[0].admin_id;

    await tulisAuditLog({
      adminId: req.user?.adminId ?? null,
      adminUsername: req.user?.username ?? 'unknown',
      actionType: 'ADMIN_CREATED',
      resourceType: 'admins',
      resourceId: adminId,
      newValues: { username: body.username, full_name: body.full_name, role: body.role },
      ipAddress: req.clientIp,
    });

    return { admin_id: adminId, username: body.username, full_name: body.full_name, role: body.role };
  } catch (err) {
    if (isUniqueViolation(err)) throw new AppError(ERRORS.CONFLICT_USERNAME);
    throw err;
  }
}

export async function updateRole(req: Request, id: string, role: AssignableRole) {
  const current = await runQuery<AdminRow>(`SELECT ${ADMIN_COLUMNS} FROM dbo.admins WHERE admin_id = @id`, [
    p.uuid('id', id),
  ]);
  const target = current.recordset[0];
  if (!target) throw new AppError(ERRORS.NOT_FOUND_ADMIN);

  if (target.role === role) return toDto(target); // tidak ada perubahan

  // Guard di dalam UPDATE: Pemilik aktif terakhir tidak boleh diturunkan menjadi Admin.
  const upd = await runQuery<{ affected: number }>(
    `UPDATE dbo.admins SET role = @role
      WHERE admin_id = @id
        AND NOT (role = 'Pemilik' AND @role = 'Admin' AND is_active = 1
                 AND (SELECT COUNT(*) FROM dbo.admins WHERE role = 'Pemilik' AND is_active = 1) <= 1);
     SELECT @@ROWCOUNT AS affected;`,
    [p.uuid('id', id), p.varchar('role', role, 20)],
    req.dbContext,
  );
  if ((upd.recordset[0]?.affected ?? 0) === 0) throw new AppError(ERRORS.CONFLICT_LAST_OWNER);

  await tulisAuditLog({
    adminId: req.user?.adminId ?? null,
    adminUsername: req.user?.username ?? 'unknown',
    actionType: 'ROLE_CHANGED',
    resourceType: 'admins',
    resourceId: id,
    newValues: { username: target.username, previous_role: target.role, role },
    ipAddress: req.clientIp,
  });

  return toDto({ ...target, role });
}
