import type { RequestHandler, Request } from 'express';
import type { DbContext } from '../config/database';

function normalizeIp(raw: string | undefined): string {
  if (!raw) return 'unknown';
  const ip = raw.startsWith('::ffff:') ? raw.slice(7) : raw;
  return ip.slice(0, 45);
}

/** Susun konteks DB dari request saat ini (dipanggil ulang setelah authenticate). */
export function buildDbContext(req: Request): DbContext {
  return {
    adminId: req.user?.adminId ?? null,
    adminUsername: req.user?.username ?? null,
    ipAddress: req.clientIp,
  };
}

/**
 * Menetapkan req.clientIp dan req.dbContext. Dipasang global; authenticate
 * memperbarui dbContext setelah identitas pengguna diketahui. Nilainya dikirim
 * ke SESSION_CONTEXT lewat runQuery(..., req.dbContext).
 */
export const sessionContext: RequestHandler = (req, _res, next) => {
  req.clientIp = normalizeIp(req.ip);
  req.dbContext = buildDbContext(req);
  req.validated = {};
  next();
};
