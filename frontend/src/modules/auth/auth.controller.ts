import type { Request, Response } from 'express';
import { AppError, ERRORS } from '../../constants/error-codes';
import { sendSuccess } from '../../utils/response';
import type { LoginBody } from './auth.schema';
import * as authService from './auth.service';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.validated.body as LoginBody;
  const result = await authService.login(username, password, req.clientIp);
  sendSuccess(res, result, 'Login berhasil');
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(ERRORS.AUTH_REQUIRED);
  await authService.logout(req.user, req.clientIp);
  sendSuccess(res, null, 'Logout berhasil');
}
