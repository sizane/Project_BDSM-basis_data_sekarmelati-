import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, ERRORS, isDatabaseError } from '../constants/error-codes';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

/** 404 untuk route yang tidak dikenal. */
export const notFoundHandler: RequestHandler = (req, res) => {
  sendError(res, ERRORS.NOT_FOUND_ROUTE.status, ERRORS.NOT_FOUND_ROUTE.code, ERRORS.NOT_FOUND_ROUTE.message);
  void req;
};

/**
 * Global error handler (AC-03): semua error diubah menjadi envelope JSON standar.
 * Detail teknis (stack trace, pesan driver) hanya masuk log server, tidak ke klien.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (res.headersSent) {
    logger.error('Error setelah respons terkirim', err, { path: req.path });
    return;
  }

  if (err instanceof AppError) {
    if (err.status >= 500) logger.error(`AppError ${err.code}`, err.cause ?? err, { path: req.path });
    sendError(res, err.status, err.code, err.message, err.details);
    return;
  }

  // Body JSON rusak / terlalu besar (dari express.json)
  const bodyErr = err as { type?: string; status?: number };
  if (bodyErr?.type === 'entity.parse.failed') {
    sendError(res, ERRORS.REQ_MALFORMED.status, ERRORS.REQ_MALFORMED.code, ERRORS.REQ_MALFORMED.message);
    return;
  }
  if (bodyErr?.type === 'entity.too.large') {
    sendError(res, 413, ERRORS.REQ_MALFORMED.code, 'Data yang dikirim terlalu besar.');
    return;
  }

  // Kegagalan koneksi / query SQL Server -> ERR-SYS-01 (503)
  if (isDatabaseError(err)) {
    logger.error('Kesalahan database', err, { method: req.method, path: req.path });
    sendError(res, ERRORS.SYS_DATABASE.status, ERRORS.SYS_DATABASE.code, ERRORS.SYS_DATABASE.message);
    return;
  }

  logger.error('Kesalahan tidak terduga', err, { method: req.method, path: req.path });
  sendError(res, ERRORS.SYS_UNEXPECTED.status, ERRORS.SYS_UNEXPECTED.code, ERRORS.SYS_UNEXPECTED.message);
};
