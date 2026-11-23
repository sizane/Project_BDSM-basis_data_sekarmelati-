-- v_ringkasan_pesanan (TSD 5.3): ringkasan pesanan = total, terbayar, sisa, keterlambatan.
-- days_late: hari lewat tenggat untuk pesanan yang MASIH Belum Lunas (tanggal WIB = UTC+7).
CREATE OR ALTER VIEW dbo.v_ringkasan_pesanan
AS
SELECT
    p.pesanan_id,
    p.no_pesanan,
    p.customer_id,
    c.nama_customer,
    p.tanggal_masuk,
    p.tenggat,
    p.tanggal_lunas,
    p.harga_total,
    ISNULL(t.total_paid, 0) AS total_paid,
    p.harga_total - ISNULL(t.total_paid, 0) AS remaining_debt,
    ISNULL(t.payment_count, 0) AS payment_count,
    ISNULL(t.late_count, 0) AS late_count,
    CASE WHEN p.status_pesanan = 'Belum Lunas' AND h.hari_ini > p.tenggat
         THEN DATEDIFF(DAY, p.tenggat, h.hari_ini) ELSE 0 END AS days_late,
    p.status_pesanan
FROM dbo.pesanan p
JOIN dbo.customers c ON c.customer_id = p.customer_id
LEFT JOIN dbo.v_total_pembayaran t ON t.pesanan_id = p.pesanan_id
CROSS APPLY (SELECT CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE) AS hari_ini) h;
GO
