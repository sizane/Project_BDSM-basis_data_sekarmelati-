import type { RequestHandler, Request } from 'express';
import type { DbContext } from '../config/database';

/**
 * SessionContext: Kelas independen yang merepresentasikan konteks sesi admin yang sedang aktif.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Properti privat (#adminId, #adminUsername, #ipAddress, #role) dengan getter publik.
 * - ASOSIASI (Association / "uses-a"): Digunakan oleh service dan controller sebagai parameter
 *   tanpa adanya hubungan kepemilikan siklus hidup.
 */
export class SessionContext {
  #adminId: string | null;
  #adminUsername: string | null;
  #ipAddress: string;
  #role: string | null;

  constructor(
    adminId: string | null = null,
    adminUsername: string | null = null,
    ipAddress: string = '127.0.0.1',
    role: string | null = null,
  ) {
    this.#adminId = adminId;
    this.#adminUsername = adminUsername;
    this.#ipAddress = ipAddress;
    this.#role = role;
  }

  public get adminId(): string | null {
    return this.#adminId;
  }

  public get adminUsername(): string | null {
    return this.#adminUsername;
  }

  public get ipAddress(): string {
    return this.#ipAddress;
  }

  public get role(): string | null {
    return this.#role;
  }

  public isAuthenticated(): boolean {
    return this.#adminId !== null && this.#adminUsername !== null;
  }

  public toDbContext(): DbContext {
    return {
      adminId: this.#adminId,
      adminUsername: this.#adminUsername,
      ipAddress: this.#ipAddress,
    };
  }
}

function normalizeIp(raw: string | undefined): string {
  if (!raw) return 'unknown';
  const ip = raw.startsWith('::ffff:') ? raw.slice(7) : raw;
  return ip.slice(0, 45);
}

/** Susun konteks DB dari request saat ini (dipanggil ulang setelah authenticate). */
export function buildDbContext(req: Request): DbContext {
  const session = new SessionContext(
    req.user?.adminId ?? null,
    req.user?.username ?? null,
    normalizeIp(req.ip),
    req.user?.role ?? null,
  );
  return session.toDbContext();
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
