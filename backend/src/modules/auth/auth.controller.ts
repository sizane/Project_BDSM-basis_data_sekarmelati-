import type { Request, Response, NextFunction } from 'express';
import { loginUser, logoutUser } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { verifyToken } from '../../utils/jwt';

export const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password, req.clientIp);

    if (result.error) {
      return sendError(res, result.error.message, result.error.code, result.error.status);
    }

    return sendSuccess(res, result.data, 'Login berhasil', 200);
  } catch (err) {
    next(err);
  }
};

export const handleLogout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization!.split(' ')[1];
    const decoded = verifyToken(token) as { admin_id: string; username: string; jti: string; exp: number };

    await logoutUser(decoded.admin_id, decoded.username, decoded.jti, decoded.exp, req.clientIp);
    return sendSuccess(res, null, 'Logout berhasil', 200);
  } catch (err) {
    next(err);
  }
};