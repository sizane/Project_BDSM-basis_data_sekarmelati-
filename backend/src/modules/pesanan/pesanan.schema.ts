import { z } from 'zod';
import { sanitizeText } from '../../utils/sanitizer';

export const listPesananQuerySchema = z.object({
    search: z.string().trim().optional().default(''),
    status_pesanan: z.enum(['Belum Lunas', 'Lunas']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    per_page: z.coerce.number().int().min(1).max(100).default(15),
});

export const pesananIdParamSchema = z.object({
    id: z.uuid({ error: 'Format ID pesanan tidak valid' }),
});
const itemPesananSchema = z.object({
    rincian_pesanan: z
    .string()
    .trim()
    .min(1, 'Rincian pesanan wajib diisi')
    .max(200, 'Rincian pesanan maksimal 200 karakter')
    .transform(sanitizeText),
    kuantitas: z
    .number({ message: 'Kuantitas wajib diisi' })
    .int('Kuantitas harus berupa bilangan bulat')
    .positive('Kuantitas harus lebih dari 0'),
    harga_per_item: z
    .number({ message: 'Harga per item wajib diisi' })
    .positive('Harga per item harus lebih dari Rp 0'),
});

export const createPesananSchema = z
    .object({
        nama_customer: z
        .string()
        .trim()
        .min(1, 'Nama pelanggan wajib diisi')
        .max(100, 'Nama pelanggan maksimal 100 karakter')
        .transform(sanitizeText),
    no_kontak: z
        .string()
        .trim()
        .min(8, 'Nomor kontak wajib diisi dengan benar')
        .max(20, 'Nomor kontak maksimal 20 karakter')
        .regex(/^[0-9+]+$/, 'Nomor kontak hanya boleh berisi angka'),
    items: z
        .array(itemPesananSchema)
        .min(1, 'Minimal harus ada 1 rincian pesanan'),
    dp: z
        .number()
        .min(0, 'DP tidak boleh negatif')
        .optional()
        .default(0),
    tenggat: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tenggat harus YYYY-MM-DD'),
  })
  .superRefine((data, ctx) => {
    const totalHarga = data.items.reduce(
      (sum, item) => sum + item.kuantitas * item.harga_per_item,
      0
    );

    if (data.dp > totalHarga) {
        ctx.addIssue({
            code: 'custom',
            path: ['dp'],
            message: 'DP tidak boleh negatif atau melebihi total harga',
        });
    }

    // Validasi tenggat >= tanggal masuk hari ini (WIB / UTC+7)
    const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const todayStr = nowWib.toISOString().split('T')[0];

    if (data.tenggat < todayStr!) {
        ctx.addIssue({
            code: 'custom',
            path: ['tenggat'],
            message: 'Tenggat tidak boleh sebelum tanggal masuk',
        });
    }
  });

export const createPembayaranSchema = z.object({
    tanggal_bayar: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal bayar harus YYYY-MM-DD'),
    jumlah: z
    .number({ message: 'Nominal pembayaran wajib diisi' })
    .positive('Nominal pembayaran harus lebih besar dari Rp 0.'),
    jenis_pembayaran: z.enum(['DP', 'Cicilan', 'Pelunasan'], {
        message: 'Pilih jenis pembayaran yang valid',
    }),
});

export type ListPesananQuery = z.infer<typeof listPesananQuerySchema>;
export type CreatePesananInput = z.infer<typeof createPesananSchema>;
export type CreatePembayaranInput = z.infer<typeof createPembayaranSchema>;