-- v_riwayat_transaksi (TSD 5.3 / FSD-2.6): sumber pencarian riwayat.
-- Filter nama / nomor / tanggal dikerjakan query Express (parameterized).
CREATE OR ALTER VIEW dbo.v_riwayat_transaksi
AS
SELECT
    pesanan_id,
    no_pesanan,
    nama_customer,
    tanggal_masuk,
    harga_total,
    total_paid,
    remaining_debt,
    status_pesanan
FROM dbo.v_ringkasan_pesanan;
GO
