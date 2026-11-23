import { z } from 'zod';
export declare const LEVEL_UTANG: readonly ['Rendah', 'Sedang', 'Tinggi', 'Kritis'];
export type LevelUtang = (typeof LEVEL_UTANG)[number];
export declare const labaRugiQuery: z.ZodObject<{
    bulan: z.ZodCoercedNumber<unknown>;
    tahun: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type LabaRugiQuery = z.infer<typeof labaRugiQuery>;
export declare const levelUtangQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    level: z.ZodPreprocess<z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>, unknown>;
}, z.core.$strip>;
export type LevelUtangQuery = z.infer<typeof levelUtangQuery>;
export declare const exportParams: z.ZodObject<{
    jenis: z.ZodEnum<{
        "laba-rugi": "laba-rugi";
        "level-utang": "level-utang";
    }>;
}, z.core.$strip>;
/** bulan/tahun hanya wajib untuk laba-rugi; dicek di controller. level dipakai untuk level-utang. */
export declare const exportQuery: z.ZodObject<{
    bulan: z.ZodPreprocess<z.ZodOptional<z.ZodCoercedNumber<unknown>>, unknown>;
    tahun: z.ZodPreprocess<z.ZodOptional<z.ZodCoercedNumber<unknown>>, unknown>;
    level: z.ZodPreprocess<z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>, unknown>;
}, z.core.$strip>;
export type ExportQuery = z.infer<typeof exportQuery>;
//# sourceMappingURL=laporan.schema.d.ts.map