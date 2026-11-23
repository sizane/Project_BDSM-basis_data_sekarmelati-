import { p, runQuery, type SqlParam } from '../../config/database';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import type { ListTransaksiQuery } from './transaksi.schema';
import { Transaksi } from '../pesanan/pesanan.service';

interface RiwayatRow {
  pesanan_id: string;
  no_pesanan: string;
  nama_customer: string;
  tanggal_masuk: Date;
  harga_total: number;
  total_paid: number;
  remaining_debt: number;
  status_pesanan: string;
}

/**
 * TransaksiService: Layanan berbasis OOP yang mendemonstrasikan POLIMORFISME dan ASYNC.
 * - POLIMORFISME: Memproses koleksi instance Transaksi (Pesanan & Pengeluaran) secara seragam.
 * - ASYNC: Mengambil data riwayat transaksi secara asynchronous.
 */
export class TransaksiService {
  /**
   * POLIMORFISME: Parameter transaksiList berisi objek kelas dasar Transaksi.
   * Pada saat runtime, pemanggilan tx.hitungTotal() memicu implementasi spesifik dari subclass.
   */
  public hitungAkumulasiPolimorfik(transaksiList: Transaksi[]): {
    totalPemasukan: number;
    totalPengeluaran: number;
    saldoBersih: number;
  } {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    for (const tx of transaksiList) {
      const nominal = tx.hitungTotal(); // Panggilan metode polimorfik
      if (tx.getJenisTransaksi() === 'PEMASUKAN_PESANAN') {
        totalPemasukan += nominal;
      } else {
        totalPengeluaran += nominal;
      }
    }

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoBersih: totalPemasukan - totalPengeluaran,
    };
  }

  // --- ASYNC: Pencarian riwayat transaksi lewat view v_riwayat_transaksi ---
  public async listRiwayatTransaksi(
    query: ListTransaksiQuery,
  ): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const where: string[] = [];
    const params: SqlParam[] = [];

    if (query.keyword) {
      where.push(`(nama_customer LIKE @keyword ESCAPE '!' OR no_pesanan LIKE @keyword ESCAPE '!')`);
      params.push(p.varchar('keyword', `%${escapeLike(query.keyword)}%`, 110));
    }
    if (query.tanggal_awal) {
      where.push('tanggal_masuk >= @awal');
      params.push(p.date('awal', toSqlDate(query.tanggal_awal)));
    }
    if (query.tanggal_akhir) {
      where.push('tanggal_masuk <= @akhir');
      params.push(p.date('akhir', toSqlDate(query.tanggal_akhir)));
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const count = await runQuery<{ total: number }>(
      `SELECT COUNT(*) AS total FROM dbo.v_riwayat_transaksi ${whereSql}`,
      params,
    );
    const rows = await runQuery<RiwayatRow>(
      `SELECT pesanan_id, no_pesanan, nama_customer, tanggal_masuk, harga_total,
              total_paid, remaining_debt, status_pesanan
         FROM dbo.v_riwayat_transaksi
         ${whereSql}
        ORDER BY tanggal_masuk DESC, no_pesanan DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [...params, p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)],
    );

    return {
      data: rows.recordset.map((r) => ({
        pesanan_id: r.pesanan_id,
        no_pesanan: r.no_pesanan,
        nama_customer: r.nama_customer,
        tanggal: formatSqlDate(r.tanggal_masuk),
        total_harga: r.harga_total,
        total_dibayar: r.total_paid,
        sisa_piutang: r.remaining_debt,
        status_pesanan: r.status_pesanan,
      })),
      meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
    };
  }
}

export const transaksiService = new TransaksiService();

export const listRiwayatTransaksi = (query: ListTransaksiQuery) =>
  transaksiService.listRiwayatTransaksi(query);
