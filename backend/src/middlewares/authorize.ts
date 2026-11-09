import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../constants/roles';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants/error-codes';
import { poolPromise, sql } from '../config/database';

export const checkRole = (...allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Anda harus login untuk mengakses halaman ini', ERROR_CODES.AUTH_UNAUTHORIZED, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Catat upaya akses ilegal ke Audit Log sesuai BR-31 & ERR-AUTH-03
      try {
        const pool = await poolPromise;
        await pool
          .request()
          .input('admin_id', sql.UniqueIdentifier, req.user.admin_id)
          .input('admin_username', sql.VarChar(50), req.user.username)
          .input('action_type', sql.VarChar(50), 'ACCESS_DENIED')
          .input('resource_type', sql.VarChar(50), req.originalUrl)
          .input('new_values', sql.NVarChar(sql.MAX), JSON.stringify({ role: req.user.role, method: req.method }))
          .input('ip_address', sql.VarChar(45), req.clientIp)
          .execute('sp_tulis_audit_log');
      } catch (logErr) {
        console.error('Failed to write ACCESS_DENIED audit log:', logErr);
      }

      return sendError(res, 'Anda tidak memiliki izin untuk mengakses halaman ini.', ERROR_CODES.AUTH_FORBIDDEN, 403);
    }

    next();
  };
};