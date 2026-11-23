-- fn_hitung_sisa_piutang (TSD 5.2): harga_total - total dibayar.
-- Bernilai 0 bila pesanan lunas atau tidak ditemukan.
CREATE OR ALTER FUNCTION dbo.fn_hitung_sisa_piutang (@pesanan_id UNIQUEIDENTIFIER)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    DECLARE @sisa DECIMAL(18, 2);

    SELECT @sisa = harga_total - dbo.fn_hitung_total_dibayar(pesanan_id)
    FROM dbo.pesanan
    WHERE pesanan_id = @pesanan_id;

    RETURN CASE WHEN @sisa IS NULL OR @sisa < 0 THEN 0 ELSE @sisa END;
END;
GO
