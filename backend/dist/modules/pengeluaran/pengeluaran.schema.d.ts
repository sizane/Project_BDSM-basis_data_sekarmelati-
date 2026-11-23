import { z } from 'zod';
export declare const KATEGORI_PENGELUARAN: readonly ['Bahan Baku', 'Upah Jahit', 'Listrik', 'Lain-lain'];
export declare const listPengeluaranQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type ListPengeluaranQuery = z.infer<typeof listPengeluaranQuery>;
/** POST /pengeluaran (TSD 3.3k, FSD-2.4, BR-11 s.d. BR-13). */
export declare const createPengeluaranBody: z.ZodObject<{
    tanggal_pengeluaran: z.ZodString;
    kategori_pengeluaran: z.ZodEnum<{
        [x: string]: string;
    }>;
    jumlah: z.ZodNumber;
    keterangan: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>, unknown>;
}, z.core.$strip>;
export type CreatePengeluaranBody = z.infer<typeof createPengeluaranBody>;
//# sourceMappingURL=pengeluaran.schema.d.ts.map