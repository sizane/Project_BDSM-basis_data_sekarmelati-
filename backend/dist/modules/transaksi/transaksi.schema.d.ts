import { z } from 'zod';
/** FSD-2.6 / BR-16: kata kunci, tanggal awal, tanggal akhir; awal tidak boleh melebihi akhir. */
export declare const listTransaksiQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    keyword: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>, unknown>;
    tanggal_awal: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
    tanggal_akhir: z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>;
}, z.core.$strip>;
export type ListTransaksiQuery = z.infer<typeof listTransaksiQuery>;
//# sourceMappingURL=transaksi.schema.d.ts.map