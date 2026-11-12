import { z } from 'zod';
import { ERRORS } from '../../constants/error-codes';
import { paginationShape, zOptionalDate, zOptionalText } from '../../middlewares/validate';

/** FSD-2.6 / BR-16: kata kunci, tanggal awal, tanggal akhir; awal tidak boleh melebihi akhir. */
export const listTransaksiQuery = z
  .object({
    keyword: zOptionalText('Kata kunci pencarian tidak valid', 100),
    tanggal_awal: zOptionalDate('Tanggal awal tidak valid'),
    tanggal_akhir: zOptionalDate('Tanggal akhir tidak valid'),
    ...paginationShape,
  })
  .superRefine((v, ctx) => {
    if (v.tanggal_awal && v.tanggal_akhir && v.tanggal_awal > v.tanggal_akhir) {
      const params = { code: ERRORS.VAL_DATE_RANGE.code };
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tanggal_awal'],
        message: 'Tanggal awal tidak boleh melebihi tanggal akhir',
        params,
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tanggal_akhir'],
        message: 'Tanggal akhir tidak boleh sebelum tanggal awal',
        params,
      });
    }
  });
export type ListTransaksiQuery = z.infer<typeof listTransaksiQuery>;
