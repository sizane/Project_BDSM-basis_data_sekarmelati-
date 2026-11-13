import { z } from 'zod';
import { paginationShape } from '../../middlewares/validate';

export const LEVEL_UTANG = ['Rendah', 'Sedang', 'Tinggi', 'Kritis'] as const;
export type LevelUtang = (typeof LEVEL_UTANG)[number];

const bulan = z.coerce
  .number({ invalid_type_error: 'Pilih bulan laporan yang valid', required_error: 'Pilih bulan laporan yang valid' })
  .int('Pilih bulan laporan yang valid')
  .min(1, 'Pilih bulan laporan yang valid')
  .max(12, 'Pilih bulan laporan yang valid');

const tahun = z.coerce
  .number({ invalid_type_error: 'Pilih tahun laporan yang valid', required_error: 'Pilih tahun laporan yang valid' })
  .int('Pilih tahun laporan yang valid')
  .min(2000, 'Pilih tahun laporan yang valid')
  .max(2100, 'Pilih tahun laporan yang valid');

const levelFilter = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.enum(LEVEL_UTANG, { errorMap: () => ({ message: 'Pilih level utang yang tersedia' }) }).optional(),
);

export const labaRugiQuery = z.object({ bulan, tahun });
export type LabaRugiQuery = z.infer<typeof labaRugiQuery>;

export const levelUtangQuery = z.object({ level: levelFilter, ...paginationShape });
export type LevelUtangQuery = z.infer<typeof levelUtangQuery>;

export const exportParams = z.object({
  jenis: z.enum(['laba-rugi', 'level-utang'], {
    errorMap: () => ({ message: 'Jenis laporan tidak valid' }),
  }),
});

/** bulan/tahun hanya wajib untuk laba-rugi; dicek di controller. level dipakai untuk level-utang. */
export const exportQuery = z.object({
  bulan: z.preprocess((v) => (v === '' ? undefined : v), bulan.optional()),
  tahun: z.preprocess((v) => (v === '' ? undefined : v), tahun.optional()),
  level: levelFilter,
});
export type ExportQuery = z.infer<typeof exportQuery>;
