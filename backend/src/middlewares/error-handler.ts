import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants/error-codes';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Log teknis hanya di server, jangan tampilkan ke user (FSD Bag. 6)
  console.error('[SERVER ERROR]:', err);
  return sendError(res, 'Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.', ERROR_CODES.SYSTEM_ERROR, 500);
};