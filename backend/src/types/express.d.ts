import type { Role } from '../constants/roles';
import type { DbContext } from '../config/database';

export interface AuthUser {
  adminId: string;
  username: string;
  fullName: string;
  role: Role;
  jti: string;
  /** Waktu kedaluwarsa token (detik sejak epoch). */
  exp: number;
}

export interface ValidatedRequest {
  body?: any;
  query?: any;
  params?: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      /** IP klien (sudah dinormalisasi). */
      clientIp: string;
      /** Konteks yang dikirim ke SESSION_CONTEXT SQL Server. */
      dbContext: DbContext;
      /** Hasil parse Zod. req.query bersifat read-only di Express 5, jadi disimpan di sini. */
      validated: ValidatedRequest;
    }
  }
}

export {};
