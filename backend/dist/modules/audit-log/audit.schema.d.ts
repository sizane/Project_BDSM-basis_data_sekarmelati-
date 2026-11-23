import { z } from 'zod';
export declare const JENIS_TINDAKAN: readonly ['Tambah', 'Edit', 'Hapus', 'Login', 'Logout', 'AksesDitolak'];
export type JenisTindakan = (typeof JENIS_TINDAKAN)[number];
export declare const listAuditLogsQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    rentang_tanggal: z.ZodPipe<z.ZodPreprocess<z.ZodOptional<z.ZodString>, unknown>, z.ZodTransform<{
        awal?: string;
        akhir?: string;
    }, string | undefined>>;
    nama_pengguna: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>, unknown>;
    jenis_tindakan: z.ZodPreprocess<z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>, unknown>;
}, z.core.$strip>;
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuery>;
//# sourceMappingURL=audit.schema.d.ts.map