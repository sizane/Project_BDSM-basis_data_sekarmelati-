-- fn_tentukan_level_utang (TSD 5.2 / FSD-2.10)
-- Level nominal : < 500rb Rendah | 500rb-2jt Sedang | > 2jt Tinggi
-- Level waktu   : telat 0 Rendah | 1-14 hari Sedang | >= 15 hari Tinggi
-- Diambil yang tertinggi (AF-1). Kritis bila (> 2jt DAN telat > 30 hari)
-- ATAU (frekuensi 'Sangat Sering' DAN telat > 30 hari). Data kosong -> 'Sedang' (EF-1).
CREATE OR ALTER FUNCTION dbo.fn_tentukan_level_utang (
    @remaining DECIMAL(12, 2),
    @days_late INT,
    @freq VARCHAR(15)
)
RETURNS VARCHAR(10)
AS
BEGIN
    IF @remaining IS NULL OR @days_late IS NULL
        RETURN 'Sedang';

    IF (@remaining > 2000000 AND @days_late > 30)
       OR (@freq = 'Sangat Sering' AND @days_late > 30)
        RETURN 'Kritis';

    DECLARE @rank_nominal INT = CASE WHEN @remaining < 500000 THEN 1
                                     WHEN @remaining <= 2000000 THEN 2
                                     ELSE 3 END;
    DECLARE @rank_waktu INT = CASE WHEN @days_late <= 0 THEN 1
                                   WHEN @days_late <= 14 THEN 2
                                   ELSE 3 END;
    DECLARE @rank INT = CASE WHEN @rank_nominal >= @rank_waktu THEN @rank_nominal ELSE @rank_waktu END;

    RETURN CASE @rank WHEN 1 THEN 'Rendah' WHEN 2 THEN 'Sedang' ELSE 'Tinggi' END;
END;
GO
