import type { RequestHandler } from 'express';
import { p, runQuery } from '../config/database';
import { AppError, ERRORS } from '../constants/error-codes';
import { isRole, type Role } from '../constants/roles';
import { verifyToken } from '../utils/jwt';
import { buildDbContext } from './session-context';

interface AuthRow {
  admin_id: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_revoked: number;
}

/**
 * Verifikasi JWT Bearer (HS256) + cek tabel revoked_tokens + akun masih aktif.
 * Semua kegagalan -> 401 ERR-AUTH-01 tanpa membocorkan penyebabnya (AC-04).
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) throw new AppError(ERRORS.AUTH_REQUIRED);

  let payload;
  try {
    payload = verifyToken(header.slice(7).trim());
  } catch {
    throw new AppError(ERRORS.AUTH_REQUIRED);
  }

  const result = await runQuery<AuthRow>(
    `SELECT a.admin_id, a.username, a.full_name, a.role, a.is_active,
            CASE WHEN EXISTS (SELECT 1 FROM dbo.revoked_tokens rt WHERE rt.jti = @jti) THEN 1 ELSE 0 END AS is_revoked
       FROM dbo.admins a
      WHERE a.admin_id = @admin_id`,
    [p.varchar('jti', payload.jti, 64), p.uuid('admin_id', payload.admin_id)],
  );

  const row = result.recordset[0];
  if (!row || !row.is_active || row.is_revoked === 1 || !isRole(row.role)) {
    throw new AppError(ERRORS.AUTH_REQUIRED);
  }

  req.user = {
    adminId: row.admin_id,
    username: row.username,
    fullName: row.full_name,
    role: row.role as Role,
    jti: payload.jti,
    exp: payload.exp,
  };
  req.dbContext = buildDbContext(req);
  next();
};
