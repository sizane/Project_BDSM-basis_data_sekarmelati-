import type { RequestHandler } from 'express';
import type { Role } from '../constants/roles';
/**
 * RBAC (AC-07): dipasang SETELAH authenticate. Role di req.user berasal dari database,
 * bukan dari token, sehingga perubahan role langsung berlaku.
 * Akses ditolak -> 403 ERR-AUTH-03 dan dicatat ke audit log.
 */
export declare const checkRole: (...allowed: Role[]) => RequestHandler;
//# sourceMappingURL=authorize.d.ts.map