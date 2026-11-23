import { p, runQuery, type SqlParam } from '../../config/database';
import { monthRange } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import type { LevelUtang } from './laporan.schema';

// ---------------------------------------------------------------------------
// Laporan Laba/Rugi (FSD-2.7, BR-18/19)
// Pemasukan = pembayaran yang benar-benar diterima di bulan itu (bukan harga total pesanan).
// ---------------------------------------------------------------------------

export interface LabaRugi {
  bulan: number;
  tahun: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  laba_rugi_bersih: number;
  ada_transaksi: boolean;
}

interface LevelUtangRow {
  customer_id: string;
  nama_customer: string;
  total_debt: number;
  freq_category: string;
  total_late: number;
  days_late: number;
  debt_level: LevelUtang;
}

const PRIORITAS: Record<LevelUtang, string> = {
  Kritis: 'Prioritas 1 - tagih segera',
  Tinggi: 'Prioritas 2',
  Sedang: 'Prioritas 3',
  Rendah: 'Prioritas 4',
};

export interface LevelUtangItem {
  customer_id: string;
  nama_customer: string;
  total_piutang: number;
  frekuensi_utang_kategori: string;
  total_keterlambatan: number;
  hari_keterlambatan: number;
  level_utang: LevelUtang;
  prioritas_penagihan: string;
}

function toLevelItem(row: LevelUtangRow): LevelUtangItem {
  return {
    customer_id: row.customer_id,
    nama_customer: row.nama_customer,
    total_piutang: Number(row.total_debt),
    frekuensi_utang_kategori: row.freq_category,
    total_keterlambatan: row.total_late,
    hari_keterlambatan: row.days_late,
    level_utang: row.debt_level,
    prioritas_penagihan: PRIORITAS[row.debt_level] ?? '-',
  };
}

const LEVEL_ORDER = `CASE debt_level WHEN 'Kritis' THEN 1 WHEN 'Tinggi' THEN 2 WHEN 'Sedang' THEN 3 ELSE 4 END, total_debt DESC, nama_customer`;

function levelWhere(level?: LevelUtang): { whereSql: string; params: SqlParam[] } {
  if (!level) return { whereSql: '', params: [] };
  return { whereSql: 'WHERE debt_level = @level', params: [p.varchar('level', level, 10)] };
}

export class LaporanService {
  async getLabaRugi(bulan: number, tahun: number): Promise<LabaRugi> {
    const { start, end } = monthRange(bulan, tahun);
    const r = await runQuery<{
      total_pemasukan: number;
      total_pengeluaran: number;
      jumlah_transaksi: number;
    }>(
      `SELECT
         ISNULL((SELECT SUM(jumlah) FROM dbo.pembayaran
                  WHERE tanggal_bayar >= @start AND tanggal_bayar < @end), 0)           AS total_pemasukan,
         ISNULL((SELECT SUM(jumlah) FROM dbo.pengeluaran
                  WHERE tanggal_pengeluaran >= @start AND tanggal_pengeluaran < @end), 0) AS total_pengeluaran,
         (SELECT COUNT(*) FROM dbo.pembayaran
           WHERE tanggal_bayar >= @start AND tanggal_bayar < @end)
       + (SELECT COUNT(*) FROM dbo.pengeluaran
           WHERE tanggal_pengeluaran >= @start AND tanggal_pengeluaran < @end)          AS jumlah_transaksi`,
      [p.date('start', start), p.date('end', end)],
    );
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

  // ---------------------------------------------------------------------------
  // Laporan Level Utang (FSD-2.8 s.d. 2.10) - sumber: v_laporan_level_utang
  // ---------------------------------------------------------------------------
  async listLevelUtang(
    level: LevelUtang | undefined,
    page: number,
    perPage: number,
  ): Promise<{ data: LevelUtangItem[]; meta: PaginationMeta }> {
    const { whereSql, params } = levelWhere(level);
    const count = await runQuery<{ total: number }>(
      `SELECT COUNT(*) AS total FROM dbo.v_laporan_level_utang ${whereSql}`,
      params,
    );
    const rows = await runQuery<LevelUtangRow>(
      `SELECT customer_id, nama_customer, total_debt, freq_category, total_late, days_late, debt_level
         FROM dbo.v_laporan_level_utang
         ${whereSql}
        ORDER BY ${LEVEL_ORDER}
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [...params, p.int('offset', offsetOf(page, perPage)), p.int('limit', perPage)],
    );
    return {
      data: rows.recordset.map(toLevelItem),
      meta: buildMeta(page, perPage, count.recordset[0]?.total ?? 0),
    };
  }

  /** Semua baris (tanpa pagination) untuk ekspor PDF. */
  async listAllLevelUtang(level?: LevelUtang): Promise<LevelUtangItem[]> {
    const { whereSql, params } = levelWhere(level);
    const rows = await runQuery<LevelUtangRow>(
      `SELECT customer_id, nama_customer, total_debt, freq_category, total_late, days_late, debt_level
         FROM dbo.v_laporan_level_utang
         ${whereSql}
        ORDER BY ${LEVEL_ORDER}`,
      params,
    );
    return rows.recordset.map(toLevelItem);
  }
}

const laporanService = new LaporanService();
export const getLabaRugi = laporanService.getLabaRugi.bind(laporanService);
export const listLevelUtang = laporanService.listLevelUtang.bind(laporanService);
export const listAllLevelUtang = laporanService.listAllLevelUtang.bind(laporanService);
