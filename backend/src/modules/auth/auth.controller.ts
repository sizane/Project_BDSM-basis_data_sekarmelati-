import type { Request, Response } from 'express';
import { AppError, ERRORS } from '../../constants/error-codes';
import { sendSuccess } from '../../utils/response';
import type { LoginBody } from './auth.schema';
import * as authService from './auth.service';

/**
 * AuthController: Controller berbasis OOP untuk modul Autentikasi.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Pengelolaan alur autentikasi dan otorisasi.
 * - ASYNC: Operasi async login/logout.
 */
export class AuthController {
  public login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.validated.body as LoginBody;
    const result = await authService.login(username, password, req.clientIp);
    sendSuccess(res, result, 'Login berhasil');
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new AppError(ERRORS.AUTH_REQUIRED);
    await authService.logout(req.user, req.clientIp);
    sendSuccess(res, null, 'Logout berhasil');
  };
}

export const authController = new AuthController();

export const login = authController.login;
export const logout = authController.logout;
