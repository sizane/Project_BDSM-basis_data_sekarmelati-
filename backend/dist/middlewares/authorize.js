import { AppError, ERRORS } from '../constants/error-codes';
import { catatAksesDitolak } from '../modules/audit-log/audit.service';
/**
 * RBAC (AC-07): dipasang SETELAH authenticate. Role di req.user berasal dari database,
 * bukan dari token, sehingga perubahan role langsung berlaku.
 * Akses ditolak -> 403 ERR-AUTH-03 dan dicatat ke audit log.
 */
export const checkRole = (...allowed) => async (req, _res, next) => {
    if (!req.user)
        throw new AppError(ERRORS.AUTH_REQUIRED);
    if (!allowed.includes(req.user.role)) {
        await catatAksesDitolak(req, allowed);
        throw new AppError(ERRORS.AUTH_FORBIDDEN);
    }
    next();
};
//# sourceMappingURL=authorize.js.map