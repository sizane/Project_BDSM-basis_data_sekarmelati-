import { z } from 'zod';
import { ERRORS } from '../../constants/error-codes';
import { paginationShape, zDate, zMoney, zOptionalText } from '../../middlewares/validate';

export const KATEGORI_PENGELUARAN = ['Bahan Baku', 'Upah Jahit', 'Listrik', 'Lain-lain'] as const;

export const listPengeluaranQuery = z.object(paginationShape);
export type ListPengeluaranQuery = z.infer<typeof listPengeluaranQuery>;

/** POST /pengeluaran (TSD 3.3k, FSD-2.4, BR-11 s.d. BR-13). */
export const createPengeluaranBody = z
  .object({
    tanggal_pengeluaran: zDate('Tanggal pengeluaran wajib diisi'),
    kategori_pengeluaran: z.enum(KATEGORI_PENGELUARAN, {
      errorMap: () => ({ message: 'Pilih kategori biaya yang valid' }),
    }),
    jumlah: zMoney({
      required: 'Nominal pengeluaran wajib diisi dengan angka lebih dari 0.',
      min: 'positive',
      negative: { message: 'Nominal pengeluaran wajib diisi dengan angka lebih dari 0.', code: ERRORS.VAL_NOMINAL.code },
    }),
    keterangan: zOptionalText('Keterangan maksimal 255 karakter', 255, { multiline: true }),
  })
  .superRefine((v, ctx) => {
    if (v.kategori_pengeluaran === 'Lain-lain' && !v.keterangan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['keterangan'],
        message: 'Keterangan wajib diisi untuk kategori Lain-lain (maks. 255 karakter)',
        params: { code: ERRORS.VAL_NOTES_REQUIRED.code },
      });
    }
  });
export type CreatePengeluaranBody = z.infer<typeof createPengeluaranBody>;
