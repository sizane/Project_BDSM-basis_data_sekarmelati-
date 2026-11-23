import { p, runQuery } from '../../config/database';
import { monthRange } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
export async function getLabaRugi(bulan, tahun) {
    const { start, end } = monthRange(bulan, tahun);
    const r = await runQuery(`SELECT
       ISNULL((SELECT SUM(jumlah) FROM dbo.pembayaran
                WHERE tanggal_bayar >= @start AND tanggal_bayar < @end), 0)           AS total_pemasukan,
       ISNULL((SELECT SUM(jumlah) FROM dbo.pengeluaran
                WHERE tanggal_pengeluaran >= @start AND tanggal_pengeluaran < @end), 0) AS total_pengeluaran,
       (SELECT COUNT(*) FROM dbo.pembayaran
         WHERE tanggal_bayar >= @start AND tanggal_bayar < @end)
     + (SELECT COUNT(*) FROM dbo.pengeluaran
         WHERE tanggal_pengeluaran >= @start AND tanggal_pengeluaran < @end)          AS jumlah_transaksi`, [p.date('start', start), p.date('end', end)]);
    const row = r.recordset[0];
    const pemasukan = Number(row?.total_pemasukan ?? 0);
    const pengeluaran = Number(row?.total_pengeluaran ?? 0);
    return {
        bulan,
        tahun,
        total_pemasukan: pemasukan,
        total_pengeluaran: pengeluaran,
        laba_rugi_bersih: pemasukan - pengeluaran,
        ada_transaksi: Number(row?.jumlah_transaksi ?? 0) > 0,
    };
}
/** Label prioritas penagihan (SCR-12 butir 3), diturunkan dari level hasil klasifikasi. */
const PRIORITAS = {
    Kritis: 'Prioritas 1 - tagih segera',
    Tinggi: 'Prioritas 2',
    Sedang: 'Prioritas 3',
    Rendah: 'Prioritas 4',
};
function toLevelItem(r) {
    return {
        customer_id: r.customer_id,
        nama_customer: r.nama_customer,
        total_piutang: Number(r.total_debt),
        frekuensi_utang_kategori: r.freq_category,
        total_keterlambatan: r.total_late,
        hari_keterlambatan: r.days_late,
        level_utang: r.debt_level,
        prioritas_penagihan: PRIORITAS[r.debt_level] ?? '-',
    };
}
// Urut dari Kritis ke Rendah (FSD-2.8 langkah 3), lalu piutang terbesar.
const LEVEL_ORDER = `CASE debt_level WHEN 'Kritis' THEN 1 WHEN 'Tinggi' THEN 2 WHEN 'Sedang' THEN 3 ELSE 4 END, total_debt DESC, nama_customer`;
function levelWhere(level) {
    if (!level)
        return { whereSql: '', params: [] };
    return { whereSql: 'WHERE debt_level = @level', params: [p.varchar('level', level, 10)] };
}
export async function listLevelUtang(level, page, perPage) {
    const { whereSql, params } = levelWhere(level);
    const count = await runQuery(`SELECT COUNT(*) AS total FROM dbo.v_laporan_level_utang ${whereSql}`, params);
    const rows = await runQuery(`SELECT customer_id, nama_customer, total_debt, freq_category, total_late, days_late, debt_level
       FROM dbo.v_laporan_level_utang
       ${whereSql}
      ORDER BY ${LEVEL_ORDER}
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`, [...params, p.int('offset', offsetOf(page, perPage)), p.int('limit', perPage)]);
    return {
        data: rows.recordset.map(toLevelItem),
        meta: buildMeta(page, perPage, count.recordset[0]?.total ?? 0),
    };
}
/** Semua baris (tanpa pagination) untuk ekspor PDF. */
export async function listAllLevelUtang(level) {
    const { whereSql, params } = levelWhere(level);
    const rows = await runQuery(`SELECT customer_id, nama_customer, total_debt, freq_category, total_late, days_late, debt_level
       FROM dbo.v_laporan_level_utang
       ${whereSql}
      ORDER BY ${LEVEL_ORDER}`, params);
    return rows.recordset.map(toLevelItem);
}
//# sourceMappingURL=laporan.service.js.map