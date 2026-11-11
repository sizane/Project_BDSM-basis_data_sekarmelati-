import { z } from 'zod';
import { ERRORS } from '../../constants/error-codes';
import { paginationShape, zDate, zMoney, zOptionalText, zPhone, zText, zUuid } from '../../middlewares/validate';

const itemSchema = z.object({
  rincian_pesanan: zText('Rincian pesanan wajib diisi (maks. 200 karakter)', 200, { multiline: true }),
  kuantitas: z
    .number({
      required_error: 'Kuantitas harus berupa bilangan bulat lebih dari 0',
      invalid_type_error: 'Kuantitas harus berupa bilangan bulat lebih dari 0',
    })
    .int({ message: ERRORS.VAL_QTY.message })
    .superRefine((v, ctx) => {
      if (v <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ERRORS.VAL_QTY.message,
          params: { code: ERRORS.VAL_QTY.code },
        });
      }
    }),
  harga_per_item: zMoney({
    required: 'Harga per item wajib diisi',
    min: 'positive',
    negative: { message: ERRORS.VAL_NEGATIVE.message, code: ERRORS.VAL_NEGATIVE.code },
    zero: { message: 'Harga per item harus lebih dari Rp 0', code: ERRORS.VAL_NEGATIVE.code },
  }),
});

/**
 * POST /pesanan (TSD 3.3e). Body memakai array `items`, tetapi sp_catat_pesanan_baru
 * (TSD 5.1) baru menerima satu item per pesanan, sehingga dibatasi tepat 1 item.
 * Untuk multi-item: ubah SP agar menerima banyak item, lalu hapus .length(1) di bawah.
 */
export const createPesananBody = z.object({
  nama_customer: zText('Nama pelanggan wajib diisi (maks. 100 karakter)', 100),
  no_kontak: zPhone('Nomor kontak wajib diisi dengan benar'),
  items: z
    .array(itemSchema, {
      required_error: 'Rincian pesanan wajib diisi',
      invalid_type_error: 'Rincian pesanan wajib diisi',
    })
    .length(1, 'Satu pesanan saat ini hanya dapat memuat satu item'),
  dp: zMoney({
    required: 'DP harus berupa angka',
    min: 'nonnegative',
    negative: { message: ERRORS.VAL_NEGATIVE.message, code: ERRORS.VAL_NEGATIVE.code },
  }).default(0),
  tenggat: zDate('Tenggat pesanan wajib diisi dengan tanggal yang valid'),
});

export type CreatePesananBody = z.infer<typeof createPesananBody>;

export const pesananIdParams = z.object({ id: zUuid('ID pesanan tidak valid') });

export const listPesananQuery = z.object({
  search: zOptionalText('Kata kunci pencarian tidak valid', 100),
  status_pesanan: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['Belum Lunas', 'Lunas'], { errorMap: () => ({ message: 'Status pesanan tidak valid' }) }).optional(),
  ),
  ...paginationShape,
});
export type ListPesananQuery = z.infer<typeof listPesananQuery>;

export const catatPembayaranBody = z.object({
  tanggal_bayar: zDate('Tanggal bayar wajib diisi'),
  jumlah: zMoney({
    required: 'Jumlah bayar wajib diisi',
    min: 'positive',
    negative: { message: 'Nominal pembayaran harus lebih besar dari Rp 0.', code: ERRORS.VAL_NOMINAL.code },
  }),
  jenis_pembayaran: z.enum(['DP', 'Cicilan', 'Pelunasan'], {
    errorMap: () => ({ message: 'Pilih jenis pembayaran yang valid' }),
  }),
});
export type CatatPembayaranBody = z.infer<typeof catatPembayaranBody>;
