-- trg_update_status_pesanan (TSD 5.4): status Lunas ditentukan di database.
-- Bila akumulasi pembayaran >= harga_total dan status masih Belum Lunas ->
-- status_pesanan = 'Lunas', tanggal_lunas = tanggal bayar terakhir.
CREATE OR ALTER TRIGGER dbo.trg_update_status_pesanan
ON dbo.pembayaran
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ps
    SET status_pesanan = 'Lunas',
        tanggal_lunas = x.tanggal_terakhir
    FROM dbo.pesanan ps
    JOIN (
        SELECT b.pesanan_id,
               SUM(b.jumlah) AS total_bayar,
               MAX(b.tanggal_bayar) AS tanggal_terakhir
        FROM dbo.pembayaran b
        WHERE b.pesanan_id IN (SELECT pesanan_id FROM inserted)
        GROUP BY b.pesanan_id
    ) x ON x.pesanan_id = ps.pesanan_id
    WHERE ps.status_pesanan = 'Belum Lunas'
      AND x.total_bayar >= ps.harga_total;
END;
GO
