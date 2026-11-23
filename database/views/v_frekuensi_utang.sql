-- v_frekuensi_utang (TSD 5.3 / FSD-2.9): statistik berutang per pelanggan.
-- Pesanan dianggap "berutang" bila belum lunas ATAU lunasnya setelah tanggal masuk
-- (artinya tidak dibayar penuh di hari pemesanan).
CREATE OR ALTER VIEW dbo.v_frekuensi_utang
AS
SELECT
    customer_id,
    nama_customer,
    COUNT(*) AS total_pesanan,
    SUM(CASE WHEN status_pesanan = 'Belum Lunas' OR tanggal_lunas > tanggal_masuk THEN 1 ELSE 0 END) AS debt_pesanan,
    SUM(late_count) AS total_late,
    SUM(remaining_debt) AS total_debt,
    MAX(days_late) AS max_days_late
FROM dbo.v_ringkasan_pesanan
GROUP BY customer_id, nama_customer;
GO
