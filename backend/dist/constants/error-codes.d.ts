/**
 * Katalog error (FSD Bagian 6) + class AppError.
 * Kode ERR-VAL-05 s.d. ERR-VAL-10, ERR-REQ-01, ERR-CONFLICT-* dan ERR-NOTFOUND-02/03
 * adalah perluasan katalog FSD untuk aturan bisnis yang di FSD belum punya kode sendiri.
 */
export interface ErrorDef {
    readonly code: string;
    readonly message: string;
    readonly status: number;
}
export declare const ERRORS: {
    readonly VAL_REQUIRED: ErrorDef;
    readonly VAL_NEGATIVE: ErrorDef;
    readonly VAL_OVERPAYMENT: ErrorDef;
    readonly VAL_NOMINAL: ErrorDef;
    readonly VAL_DP_EXCEEDS: ErrorDef;
    readonly VAL_DUE_DATE: ErrorDef;
    readonly VAL_QTY: ErrorDef;
    readonly VAL_NOTES_REQUIRED: ErrorDef;
    readonly VAL_DATE_RANGE: ErrorDef;
    readonly VAL_TOO_LARGE: ErrorDef;
    readonly REQ_MALFORMED: ErrorDef;
    readonly AUTH_REQUIRED: ErrorDef;
    readonly AUTH_INVALID: ErrorDef;
    readonly AUTH_FORBIDDEN: ErrorDef;
    readonly LOCKED: ErrorDef;
    readonly NOT_FOUND_PESANAN: ErrorDef;
    readonly NOT_FOUND_ROUTE: ErrorDef;
    readonly NOT_FOUND_ADMIN: ErrorDef;
    readonly CONFLICT_USERNAME: ErrorDef;
    readonly CONFLICT_LAST_OWNER: ErrorDef;
    readonly SYS_DATABASE: ErrorDef;
    readonly SYS_PDF: ErrorDef;
    readonly SYS_UNEXPECTED: ErrorDef;
};
export declare class AppError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(error: ErrorDef, message?: string, options?: {
        details?: unknown;
        cause?: unknown;
    });
}
/** Error dari driver mssql (koneksi putus, timeout, error query). */
export declare function isDatabaseError(err: unknown): boolean;
/** SQL Server error 2627 / 2601 = pelanggaran UNIQUE / PRIMARY KEY. */
export declare function isUniqueViolation(err: unknown): boolean;
//# sourceMappingURL=error-codes.d.ts.map