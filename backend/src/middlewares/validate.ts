import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError, ERRORS } from '../constants/error-codes';
import { isValidDateString } from '../utils/date';
import { sanitizeText, normalizePhone } from '../utils/sanitizer';

/** Batas nominal: DECIMAL(12,2) menampung maksimal 9.999.999.999,99. */
export const MAX_RUPIAH = 9_999_999_999;
export const DEFAULT_PER_PAGE = 15;
export const MAX_PER_PAGE = 100;

// ---------------------------------------------------------------------------
// Helper skema Zod yang dipakai semua modul
// ---------------------------------------------------------------------------

function addCodedIssue(ctx: z.RefinementCtx, message: string, code: string): void {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message, params: { code } });
}

/** Teks wajib: disanitasi, tidak boleh kosong, dibatasi panjang. */
export function zText(message: string, max: number, options: { multiline?: boolean } = {}) {
  return z
    .string({ required_error: message, invalid_type_error: message })
    .transform((v) => sanitizeText(v, options))
    .pipe(z.string().min(1, message).max(max, message));
}

/** Teks opsional: string kosong dianggap tidak diisi. */
export function zOptionalText(message: string, max: number, options: { multiline?: boolean } = {}) {
  return z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    zText(message, max, options).optional(),
  );
}

/** Nomor telepon disimpan sebagai teks; hanya angka dengan awalan + opsional. */
export function zPhone(message: string) {
  return z
    .string({ required_error: message, invalid_type_error: message })
    .transform((v) => normalizePhone(v.trim()))
    .pipe(z.string().regex(/^\+?[0-9]{8,15}$/, message));
}

/** Tanggal 'YYYY-MM-DD' yang valid pada kalender. */
export function zDate(message: string) {
  return z
    .string({ required_error: message, invalid_type_error: message })
    .refine(isValidDateString, { message });
}

export function zOptionalDate(message: string) {
  return z.preprocess((v) => (v === '' ? undefined : v), zDate(message).optional());
}

interface MoneyOptions {
  /** Pesan bila field kosong / bukan angka (ERR-VAL-01). */
  required: string;
  /** 'positive' = harus > 0, 'nonnegative' = boleh 0. */
  min: 'positive' | 'nonnegative';
  /** Pesan + kode bila nilai 0 (hanya min 'positive'). */
  zero?: { message: string; code: string };
  /** Pesan + kode bila nilai negatif. */
  negative: { message: string; code: string };
}

/** Nominal Rupiah bilangan bulat dengan batas atas (TSD 6.1). */
export function zMoney(o: MoneyOptions) {
  return z
    .number({ required_error: o.required, invalid_type_error: o.required })
    .int({ message: 'Nominal harus berupa bilangan bulat' })
    .superRefine((v, ctx) => {
      if (v < 0) addCodedIssue(ctx, o.negative.message, o.negative.code);
      else if (v === 0 && o.min === 'positive') {
        const zero = o.zero ?? o.negative;
        addCodedIssue(ctx, zero.message, zero.code);
      } else if (v > MAX_RUPIAH) addCodedIssue(ctx, ERRORS.VAL_TOO_LARGE.message, ERRORS.VAL_TOO_LARGE.code);
    });
}

export function zUuid(message = 'ID tidak valid') {
  return z.string({ required_error: message, invalid_type_error: message }).uuid(message);
}

/** ?page=1&per_page=15 (default 15, maksimum 100) - TSD 7.2 / AC-11. */
export const paginationShape = {
  page: z.coerce
    .number({ invalid_type_error: 'Nomor halaman tidak valid' })
    .int('Nomor halaman tidak valid')
    .min(1, 'Nomor halaman tidak valid')
    .default(1),
  per_page: z.coerce
    .number({ invalid_type_error: 'Jumlah data per halaman tidak valid' })
    .int('Jumlah data per halaman tidak valid')
    .min(1, 'Jumlah data per halaman tidak valid')
    .max(MAX_PER_PAGE, `Jumlah data per halaman maksimal ${MAX_PER_PAGE}`)
    .default(DEFAULT_PER_PAGE),
};
export const paginationQuery = z.object(paginationShape);
export type PaginationQuery = z.infer<typeof paginationQuery>;

// ---------------------------------------------------------------------------
// Middleware validasi (AC-08)
// ---------------------------------------------------------------------------

interface Schemas {
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
}

function issueCode(issue: z.ZodIssue): string {
  const params = (issue as z.ZodCustomIssue).params as { code?: string } | undefined;
  return params?.code ?? ERRORS.VAL_REQUIRED.code;
}

/**
 * Validasi params/query/body dengan Zod sebelum controller berjalan.
 * Hasil parse disimpan di req.validated (req.query read-only di Express 5).
 * Gagal -> 422 dengan kode dari issue pertama dan daftar detail per field.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    const failures: Array<{ field: string; message: string; code: string }> = [];

    for (const key of ['params', 'query', 'body'] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key] ?? {});
      if (result.success) {
        req.validated[key] = result.data;
      } else {
        for (const issue of result.error.issues) {
          failures.push({ field: issue.path.join('.') || key, message: issue.message, code: issueCode(issue) });
        }
      }
    }

    if (failures.length > 0) {
      const first = failures[0];
      return next(
        new AppError(
          { code: first.code, message: first.message, status: 422 },
          first.message,
          { details: failures },
        ),
      );
    }
    next();
  };
