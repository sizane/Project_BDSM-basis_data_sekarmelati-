import { AppError, ERRORS } from '../../constants/error-codes';
import { formatSqlDate } from '../../utils/date';
import type { PesananDetailRepository } from './pesanan-detail.repository';

export class PesananDetailService {
  constructor(private readonly repository: PesananDetailRepository) {}

  async getPesananDetail(pesananId: string) {
    const { pesanan, items, pembayaran } =
      await this.repository.findDetail(pesananId);

    if (!pesanan) {
      throw new AppError(ERRORS.NOT_FOUND_PESANAN);
    }

    const totalDibayar = pembayaran.reduce(
      (sum, row) => sum + Number(row.jumlah),
      0,
    );
    const hargaTotal = Number(pesanan.harga_total);

    return {
      pesanan_id: pesanan.pesanan_id,
      no_pesanan: pesanan.no_pesanan,
      tanggal_masuk: formatSqlDate(pesanan.tanggal_masuk),
      tenggat: formatSqlDate(pesanan.tenggat),
      tanggal_lunas: formatSqlDate(pesanan.tanggal_lunas),
      nama_customer: pesanan.nama_customer,
      customer: {
        customer_id: pesanan.customer_id,
        nama_customer: pesanan.nama_customer,
        no_kontak: pesanan.no_kontak,
      },
      dicatat_oleh: pesanan.dicatat_oleh,
      items: items.map((item) => ({
        item_id: item.item_id,
        rincian_pesanan: item.rincian_pesanan,
        kuantitas: item.jumlah,
        harga_per_item: Number(item.harga_per_item),
        subtotal: item.jumlah * Number(item.harga_per_item),
      })),
      harga_total: hargaTotal,
      total_dibayar: totalDibayar,
      sisa_piutang: Math.max(0, hargaTotal - totalDibayar),
      status_pesanan: pesanan.status_pesanan,
      riwayat_pembayaran: pembayaran.map((row) => ({
        pembayaran_id: row.pembayaran_id,
        tanggal_bayar: formatSqlDate(row.tanggal_bayar),
        jenis_pembayaran: row.jenis_pembayaran,
        jumlah: Number(row.jumlah),
      })),
    };
  }
}