import type { RequestHandler } from 'express';
import { z } from 'zod';
/** Batas nominal: DECIMAL(12,2) menampung maksimal 9.999.999.999,99. */
export declare const MAX_RUPIAH = 9999999999;
export declare const DEFAULT_PER_PAGE = 15;
export declare const MAX_PER_PAGE = 100;
/** Teks wajib: disanitasi, tidak boleh kosong, dibatasi panjang. */
export declare function zText(message: string, max: number, options?: {
    multiline?: boolean;
}): z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
/** Teks opsional: string kosong dianggap tidak diisi. */
export declare function zOptionalText(message: string, max: number, options?: {
    multiline?: boolean;
}): z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>, unknown>;
/** Nomor telepon disimpan sebagai teks; hanya angka dengan awalan + opsional. */
export declare function zPhone(message: string): z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
/** Tanggal 'YYYY-MM-DD' yang valid pada kalender. */
export declare function zDate(message: string): z.ZodString;
export declare function zOptionalDate(message: string): z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
interface MoneyOptions {
    /** Pesan bila field kosong / bukan angka (ERR-VAL-01). */
    required: string;
    /** 'positive' = harus > 0, 'nonnegative' = boleh 0. */
    min: 'positive' | 'nonnegative';
    /** Pesan + kode bila nilai 0 (hanya min 'positive'). */
    zero?: {
        message: string;
        code: string;
    };
    /** Pesan + kode bila nilai negatif. */
    negative: {
        message: string;
        code: string;
    };
}
/** Nominal Rupiah bilangan bulat dengan batas atas (TSD 6.1). */
export declare function zMoney(o: MoneyOptions): z.ZodNumber;
export declare function zUuid(message?: string): z.ZodString;
/** ?page=1&per_page=15 (default 15, maksimum 100) - TSD 7.2 / AC-11. */
export declare const paginationShape: {
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
};
export declare const paginationQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type PaginationQuery = z.infer<typeof paginationQuery>;
interface Schemas {
    params?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
}
/**
 * Validasi params/query/body dengan Zod sebelum controller berjalan.
 * Hasil parse disimpan di req.validated (req.query read-only di Express 5).
 * Gagal -> 422 dengan kode dari issue pertama dan daftar detail per field.
 */
export declare const validate: (schemas: Schemas) => RequestHandler;
export {};
//# sourceMappingURL=validate.d.ts.map