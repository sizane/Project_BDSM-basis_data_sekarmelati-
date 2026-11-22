-- fn_hitung_total_dibayar (TSD 5.2): total pembayaran satu pesanan, 0 bila belum ada.
CREATE OR ALTER FUNCTION dbo.fn_hitung_total_dibayar (@pesanan_id UNIQUEIDENTIFIER)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    RETURN (SELECT ISNULL(SUM(jumlah), 0) FROM dbo.pembayaran WHERE pesanan_id = @pesanan_id);
END;
GO
