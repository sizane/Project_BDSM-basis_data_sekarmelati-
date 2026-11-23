import { p, runQuery } from '../../config/database';
import { currentPeriodWIB, monthRange } from '../../utils/date';
import { getLabaRugi } from '../laporan/laporan.service';

/** SCR-02: ringkasan bulan berjalan (WIB). */
export async function getSummary() {
  const { bulan, tahun } = currentPeriodWIB();
  const { start, end } = monthRange(bulan, tahun);

  const [counts, labaRugi] = await Promise.all([
    runQuery<{ total_pesanan_bulan_ini: number; total_piutang_aktif: number }>(
      `SELECT
         (SELECT COUNT(*) FROM dbo.pesanan WHERE tanggal_masuk >= @start AND tanggal_masuk < @end) AS total_pesanan_bulan_ini,
         (SELECT ISNULL(SUM(remaining_debt), 0) FROM dbo.v_daftar_piutang)                           AS total_piutang_aktif`,
      [p.date('start', start), p.date('end', end)],
    ),
    getLabaRugi(bulan, tahun),
  ]);

  const row = counts.recordset[0];
  return {
    bulan,
    tahun,
    total_pesanan_bulan_ini: Number(row?.total_pesanan_bulan_ini ?? 0),
    total_piutang_aktif: Number(row?.total_piutang_aktif ?? 0),
    total_laba_rugi_bulan_ini: labaRugi.laba_rugi_bersih,
  };
}
