import { p, runQuery } from '../../config/database';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import { Transaksi } from '../pesanan/pesanan.service';
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
    hitungAkumulasiPolimorfik(transaksiList) {
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        for (const tx of transaksiList) {
            const nominal = tx.hitungTotal(); // Panggilan metode polimorfik
            if (tx.getJenisTransaksi() === 'PEMASUKAN_PESANAN') {
                totalPemasukan += nominal;
            }
            else {
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
    async listRiwayatTransaksi(query) {
        const where = [];
        const params = [];
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
        const count = await runQuery(`SELECT COUNT(*) AS total FROM dbo.v_riwayat_transaksi ${whereSql}`, params);
        const rows = await runQuery(`SELECT pesanan_id, no_pesanan, nama_customer, tanggal_masuk, harga_total,
              total_paid, remaining_debt, status_pesanan
         FROM dbo.v_riwayat_transaksi
         ${whereSql}
        ORDER BY tanggal_masuk DESC, no_pesanan DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`, [...params, p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)]);
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
export const listRiwayatTransaksi = (query) => transaksiService.listRiwayatTransaksi(query);
//# sourceMappingURL=transaksi.service.js.map