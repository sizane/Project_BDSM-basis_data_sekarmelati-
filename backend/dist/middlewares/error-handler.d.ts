import type { ErrorRequestHandler, RequestHandler } from 'express';
/** 404 untuk route yang tidak dikenal. */
export declare const notFoundHandler: RequestHandler;
/**
 * Global error handler (AC-03): semua error diubah menjadi envelope JSON standar.
 * Detail teknis (stack trace, pesan driver) hanya masuk log server, tidak ke klien.
 */
export declare const errorHandler: ErrorRequestHandler;
//# sourceMappingURL=error-handler.d.ts.map