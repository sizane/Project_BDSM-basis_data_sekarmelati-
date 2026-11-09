import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';
import { ERROR_CODES } from '../constants/error-codes';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, details[0]?.message || 'Input tidak valid', ERROR_CODES.VAL_REQUIRED, 422, details);
      }
      next(err);
    }
  };
};