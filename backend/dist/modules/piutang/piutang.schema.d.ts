import { z } from 'zod';
export declare const listPiutangQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>, unknown>;
    sort: z.ZodPreprocess<z.ZodDefault<z.ZodEnum<{
        sisa_terbesar: "sisa_terbesar";
        tenggat_terdekat: "tenggat_terdekat";
    }>>, unknown>;
}, z.core.$strip>;
export type ListPiutangQuery = z.infer<typeof listPiutangQuery>;
//# sourceMappingURL=piutang.schema.d.ts.map