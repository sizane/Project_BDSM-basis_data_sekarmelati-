import type { RequestHandler } from 'express';
/**
 * Verifikasi JWT Bearer (HS256) + cek tabel revoked_tokens + akun masih aktif.
 * Semua kegagalan -> 401 ERR-AUTH-01 tanpa membocorkan penyebabnya (AC-04).
 */
export declare const authenticate: RequestHandler;
//# sourceMappingURL=authenticate.d.ts.map