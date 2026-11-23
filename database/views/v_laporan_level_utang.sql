-- v_laporan_level_utang (TSD 5.3 / FSD-2.8 - 2.10): level utang per pelanggan yang MASIH berutang.
-- AF-1 FSD-2.9: pelanggan dengan 1 pesanan dikategorikan dari status keterlambatan pesanan itu saja
-- (rasio 100% / 0%), bukan dari rasio, supaya pelanggan baru tidak otomatis 'Sangat Sering'.
CREATE OR ALTER VIEW dbo.v_laporan_level_utang
AS
SELECT
    f.customer_id,
    f.nama_customer,
    f.total_debt,
    fr.freq_category,
    f.total_late,
    f.max_days_late AS days_late,
    lv.debt_level
FROM dbo.v_frekuensi_utang f
CROSS APPLY (
    SELECT dbo.fn_hitung_frekuensi_utang(
        CAST(CASE WHEN f.total_pesanan = 1
                  THEN CASE WHEN f.total_late > 0 OR f.max_days_late > 0 THEN 100 ELSE 0 END
                  ELSE 100.0 * f.debt_pesanan / NULLIF(f.total_pesanan, 0)
             END AS DECIMAL(5, 2)),
        f.total_late
    ) AS freq_category
) fr
CROSS APPLY (
    SELECT dbo.fn_tentukan_level_utang(f.total_debt, f.max_days_late, fr.freq_category) AS debt_level
) lv
WHERE f.total_debt > 0;
GO
