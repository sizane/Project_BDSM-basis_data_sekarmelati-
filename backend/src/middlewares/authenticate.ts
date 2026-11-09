import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants/error-codes';
import { poolPromise, sql } from '../config/database';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Anda harus login untuk mengakses halaman ini', ERROR_CODES.AUTH_UNAUTHORIZED, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    // Cek apakah token sudah di-revoke saat logout (TSD 6.2)
    const pool = await poolPromise;
    const revokedCheck = await pool
      .request()
      .input('jti', sql.VarChar(100), decoded.jti)
      .query('SELECT 1 FROM revoked_tokens WHERE jti = @jti');

    if (revokedCheck.recordset.length > 0) {
      return sendError(res, 'Sesi telah berakhir. Silakan login kembali.', ERROR_CODES.AUTH_UNAUTHORIZED, 401);
    }

    req.user = decoded;
    next();
  } catch {
    return sendError(res, 'Anda harus login untuk mengakses halaman ini', ERROR_CODES.AUTH_UNAUTHORIZED, 401);
  }
};