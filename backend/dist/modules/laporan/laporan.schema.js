import { z } from 'zod';
import { paginationShape } from '../../middlewares/validate';
export const LEVEL_UTANG = ['Rendah', 'Sedang', 'Tinggi', 'Kritis'];
const bulan = z.coerce
    .number({ error: 'Pilih bulan laporan yang valid' })
    .int('Pilih bulan laporan yang valid')
    .min(1, 'Pilih bulan laporan yang valid')
    .max(12, 'Pilih bulan laporan yang valid');
const tahun = z.coerce
    .number({ error: 'Pilih tahun laporan yang valid' })
    .int('Pilih tahun laporan yang valid')
    .min(2000, 'Pilih tahun laporan yang valid')
    .max(2100, 'Pilih tahun laporan yang valid');
const levelFilter = z.preprocess((v) => (v === '' ? undefined : v), z.enum([...LEVEL_UTANG], { error: 'Pilih level utang yang tersedia' }).optional());
export const labaRugiQuery = z.object({ bulan, tahun });
export const levelUtangQuery = z.object({ level: levelFilter, ...paginationShape });
export const exportParams = z.object({
    jenis: z.enum(['laba-rugi', 'level-utang'], {
        error: 'Jenis laporan tidak valid',
    }),
});
/** bulan/tahun hanya wajib untuk laba-rugi; dicek di controller. level dipakai untuk level-utang. */
export const exportQuery = z.object({
    bulan: z.preprocess((v) => (v === '' ? undefined : v), bulan.optional()),
    tahun: z.preprocess((v) => (v === '' ? undefined : v), tahun.optional()),
    level: levelFilter,
});
//# sourceMappingURL=laporan.schema.js.map