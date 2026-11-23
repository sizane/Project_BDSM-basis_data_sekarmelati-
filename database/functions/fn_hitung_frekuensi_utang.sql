-- fn_hitung_frekuensi_utang (TSD 5.2 / FSD-2.9)
-- Rasio >= 70 ATAU keterlambatan >= 3 kali -> 'Sangat Sering'; 40-69 -> 'Sering'; < 40 -> 'Jarang'.
CREATE OR ALTER FUNCTION dbo.fn_hitung_frekuensi_utang (@ratio DECIMAL(5, 2), @late_count INT)
RETURNS VARCHAR(15)
AS
BEGIN
    DECLARE @r DECIMAL(5, 2) = ISNULL(@ratio, 0);
    DECLARE @late INT = ISNULL(@late_count, 0);

    RETURN CASE
        WHEN @r >= 70 OR @late >= 3 THEN 'Sangat Sering'
        WHEN @r >= 40 THEN 'Sering'
        ELSE 'Jarang'
    END;
END;
GO
