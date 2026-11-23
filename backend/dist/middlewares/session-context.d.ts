import type { RequestHandler, Request } from 'express';
import type { DbContext } from '../config/database';
/** Susun konteks DB dari request saat ini (dipanggil ulang setelah authenticate). */
export declare function buildDbContext(req: Request): DbContext;
/**
 * Menetapkan req.clientIp dan req.dbContext. Dipasang global; authenticate
 * memperbarui dbContext setelah identitas pengguna diketahui. Nilainya dikirim
 * ke SESSION_CONTEXT lewat runQuery(..., req.dbContext).
 */
export declare const sessionContext: RequestHandler;
//# sourceMappingURL=session-context.d.ts.map