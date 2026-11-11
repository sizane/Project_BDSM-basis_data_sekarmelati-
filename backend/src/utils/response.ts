import type { Response } from 'express';
import type { ApiError, ApiSuccess, PaginationMeta } from '../types/api-response';

export function sendSuccess<T>(res: Response, data: T, message: string, status = 200): Response {
  const body: ApiSuccess<T> = { status: 'success', data, message, errors: null };
  return res.status(status).json(body);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message: string,
): Response {
  const body: ApiSuccess<T[]> = { status: 'success', data, meta, message, errors: null };
  return res.status(200).json(body);
}

export function sendError(res: Response, status: number, code: string, message: string, details?: unknown): Response {
  const body: ApiError = {
    status: 'error',
    data: null,
    message,
    errors: details === undefined ? { code } : { code, details },
  };
  return res.status(status).json(body);
}

export function buildMeta(page: number, perPage: number, total: number): PaginationMeta {
  return {
    current_page: page,
    per_page: perPage,
    total,
    last_page: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function offsetOf(page: number, perPage: number): number {
  return (page - 1) * perPage;
}
