import { z } from 'zod';
import { paginationShape, zOptionalText } from '../../middlewares/validate';

export const listPiutangQuery = z.object({
  search: zOptionalText('Kata kunci pencarian tidak valid', 100),
  sort: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z
      .enum(['sisa_terbesar', 'tenggat_terdekat'], { errorMap: () => ({ message: 'Pengurutan tidak valid' }) })
      .default('sisa_terbesar'),
  ),
  ...paginationShape,
});
export type ListPiutangQuery = z.infer<typeof listPiutangQuery>;
