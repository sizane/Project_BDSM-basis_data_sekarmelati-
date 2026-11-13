import { z } from 'zod';
import { ERRORS } from '../../constants/error-codes';
import { isValidDateString } from '../../utils/date';
import { paginationShape, zOptionalText } from '../../middlewares/validate';

export const JENIS_TINDAKAN = ['Tambah', 'Edit', 'Hapus', 'Login', 'Logout', 'AksesDitolak'] as const;
export type JenisTindakan = (typeof JENIS_TINDAKAN)[number];

const RENTANG_MESSAGE = 'Rentang tanggal tidak valid';

/**
 * rentang_tanggal = "YYYY-MM-DD,YYYY-MM-DD" (salah satu sisi boleh kosong).
 * Hasil: { awal?, akhir? } dalam format YYYY-MM-DD.
 */
const rentangTanggal = z
  .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().optional())
  .transform((value, ctx): { awal?: string; akhir?: string } => {
    if (value === undefined) return {};
    const parts = value.split(',').map((s) => s.trim());
    if (parts.length > 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: RENTANG_MESSAGE, params: { code: ERRORS.VAL_DATE_RANGE.code } });
      return z.NEVER;
    }
    const [awal, akhir] = [parts[0] || undefined, parts[1] || undefined];
    for (const d of [awal, akhir]) {
      if (d !== undefined && !isValidDateString(d)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: RENTANG_MESSAGE, params: { code: ERRORS.VAL_DATE_RANGE.code } });
        return z.NEVER;
      }
    }
    if (awal && akhir && awal > akhir) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: RENTANG_MESSAGE, params: { code: ERRORS.VAL_DATE_RANGE.code } });
      return z.NEVER;
    }
    return { awal, akhir };
  });

export const listAuditLogsQuery = z.object({
  rentang_tanggal: rentangTanggal,
  nama_pengguna: zOptionalText('Pilih pengguna yang valid', 50),
  jenis_tindakan: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(JENIS_TINDAKAN, { errorMap: () => ({ message: 'Pilih jenis tindakan yang tersedia' }) }).optional(),
  ),
  ...paginationShape,
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuery>;
