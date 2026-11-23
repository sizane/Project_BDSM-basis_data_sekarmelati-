import { AppError, ERRORS } from '../../constants/error-codes';
import { sendSuccess } from '../../utils/response';
import * as authService from './auth.service';
/**
 * AuthController: Controller berbasis OOP untuk modul Autentikasi.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Pengelolaan alur autentikasi dan otorisasi.
 * - ASYNC: Operasi async login/logout.
 */
export class AuthController {
    login = async (req, res) => {
        const { username, password } = req.validated.body;
        const result = await authService.login(username, password, req.clientIp);
        sendSuccess(res, result, 'Login berhasil');
    };
    logout = async (req, res) => {
        if (!req.user)
            throw new AppError(ERRORS.AUTH_REQUIRED);
        await authService.logout(req.user, req.clientIp);
        sendSuccess(res, null, 'Logout berhasil');
    };
}
export const authController = new AuthController();
export const login = authController.login;
export const logout = authController.logout;
//# sourceMappingURL=auth.controller.js.map