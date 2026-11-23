import type { RequestHandler, Request } from 'express';
import type { DbContext } from '../config/database';
/**
 * SessionContext: Kelas independen yang merepresentasikan konteks sesi admin yang sedang aktif.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Properti privat (#adminId, #adminUsername, #ipAddress, #role) dengan getter publik.
 * - ASOSIASI (Association / "uses-a"): Digunakan oleh service dan controller sebagai parameter
 *   tanpa adanya hubungan kepemilikan siklus hidup.
 */
export declare class SessionContext {
    #private;
    constructor(adminId?: string | null, adminUsername?: string | null, ipAddress?: string, role?: string | null);
    get adminId(): string | null;
    get adminUsername(): string | null;
    get ipAddress(): string;
    get role(): string | null;
    isAuthenticated(): boolean;
    toDbContext(): DbContext;
}
/** Susun konteks DB dari request saat ini (dipanggil ulang setelah authenticate). */
export declare function buildDbContext(req: Request): DbContext;
/**
 * Menetapkan req.clientIp dan req.dbContext. Dipasang global; authenticate
 * memperbarui dbContext setelah identitas pengguna diketahui. Nilainya dikirim
 * ke SESSION_CONTEXT lewat runQuery(..., req.dbContext).
 */
export declare const sessionContext: RequestHandler;
//# sourceMappingURL=session-context.d.ts.map