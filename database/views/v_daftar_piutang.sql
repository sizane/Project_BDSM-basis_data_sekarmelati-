-- v_daftar_piutang (TSD 5.3 / FSD-2.5): pesanan berstatus Belum Lunas.
CREATE OR ALTER VIEW dbo.v_daftar_piutang
AS
SELECT
    customer_id,
    nama_customer,
    pesanan_id,
    no_pesanan,
    harga_total,
    remaining_debt,
    tenggat,
    status_pesanan
FROM dbo.v_ringkasan_pesanan
WHERE status_pesanan = 'Belum Lunas';
GO
