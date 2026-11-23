-- v_total_pembayaran (TSD 5.3): agregasi pembayaran per pesanan.
-- late_count = jumlah pembayaran yang dilakukan SETELAH tenggat pesanan (FSD-2.9 langkah 3).
CREATE OR ALTER VIEW dbo.v_total_pembayaran
AS
SELECT
    p.pesanan_id,
    SUM(b.jumlah) AS total_paid,
    COUNT(*) AS payment_count,
    SUM(CASE WHEN b.tanggal_bayar > p.tenggat THEN 1 ELSE 0 END) AS late_count
FROM dbo.pembayaran b
JOIN dbo.pesanan p ON p.pesanan_id = b.pesanan_id
GROUP BY p.pesanan_id;
GO
