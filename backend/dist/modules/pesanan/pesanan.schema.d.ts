import { z } from 'zod';
/**
 * POST /pesanan (TSD 3.3e). Body memakai array `items`, tetapi sp_catat_pesanan_baru
 * (TSD 5.1) baru menerima satu item per pesanan, sehingga dibatasi tepat 1 item.
 * Untuk multi-item: ubah SP agar menerima banyak item, lalu hapus .length(1) di bawah.
 */
export declare const createPesananBody: z.ZodObject<{
    nama_customer: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    no_kontak: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        rincian_pesanan: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
        kuantitas: z.ZodNumber;
        harga_per_item: z.ZodNumber;
    }, z.core.$strip>>;
    dp: z.ZodDefault<z.ZodNumber>;
    tenggat: z.ZodString;
}, z.core.$strip>;
export type CreatePesananBody = z.infer<typeof createPesananBody>;
export declare const pesananIdParams: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const listPesananQuery: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    per_page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodPreprocess<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>, unknown>;
    status_pesanan: z.ZodPreprocess<z.ZodOptional<z.ZodEnum<{
        "Belum Lunas": "Belum Lunas";
        Lunas: "Lunas";
    }>>, unknown>;
}, z.core.$strip>;
export type ListPesananQuery = z.infer<typeof listPesananQuery>;
export declare const catatPembayaranBody: z.ZodObject<{
    tanggal_bayar: z.ZodString;
    jumlah: z.ZodNumber;
    jenis_pembayaran: z.ZodEnum<{
        Cicilan: "Cicilan";
        DP: "DP";
        Pelunasan: "Pelunasan";
    }>;
}, z.core.$strip>;
export type CatatPembayaranBody = z.infer<typeof catatPembayaranBody>;
//# sourceMappingURL=pesanan.schema.d.ts.map