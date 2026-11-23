import type { Response } from 'express';
import type { PaginationMeta } from '../types/api-response';
export declare function sendSuccess<T>(res: Response, data: T, message: string, status?: number): Response;
export declare function sendPaginated<T>(res: Response, data: T[], meta: PaginationMeta, message: string): Response;
export declare function sendError(res: Response, status: number, code: string, message: string, details?: unknown): Response;
export declare function buildMeta(page: number, perPage: number, total: number): PaginationMeta;
export declare function offsetOf(page: number, perPage: number): number;
//# sourceMappingURL=response.d.ts.map