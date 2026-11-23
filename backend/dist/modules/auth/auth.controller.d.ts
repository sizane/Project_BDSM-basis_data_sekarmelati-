import type { Request, Response } from 'express';
/**
 * AuthController: Controller berbasis OOP untuk modul Autentikasi.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Pengelolaan alur autentikasi dan otorisasi.
 * - ASYNC: Operasi async login/logout.
 */
export declare class AuthController {
    login: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
}
export declare const authController: AuthController;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map