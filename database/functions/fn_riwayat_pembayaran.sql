-- fn_riwayat_pembayaran (TSD 5.2): riwayat pembayaran satu pesanan (inline table-valued).
-- Urutkan di sisi pemanggil: SELECT * FROM dbo.fn_riwayat_pembayaran(@id) ORDER BY tanggal_bayar DESC;
CREATE OR ALTER FUNCTION dbo.fn_riwayat_pembayaran (@pesanan_id UNIQUEIDENTIFIER)
RETURNS TABLE
AS
RETURN (
    SELECT tanggal_bayar, jenis_pembayaran, jumlah
    FROM dbo.pembayaran
    WHERE pesanan_id = @pesanan_id
);
GO
