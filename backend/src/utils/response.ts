import type { Response } from 'express';

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Berhasil',
  statusCode = 200,
  meta?: PaginationMeta
) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
    ...(meta ? { meta } : {}),
    message,
    errors: null,
  });
};

export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode = 400,
  details?: unknown
) => {
  return res.status(statusCode).json({
    status: 'error',
    data: null,
    message,
    errors: {
      code,
      ...(details ? { details } : {}),
    },
  });
};