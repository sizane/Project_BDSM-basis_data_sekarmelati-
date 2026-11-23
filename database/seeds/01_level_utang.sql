-- Seed referensi level_utang (TSD 4.3g). Ambang di sini hanya dokumentasi/referensi tampilan;
-- logika klasifikasi sebenarnya ada di dbo.fn_tentukan_level_utang (nominal DAN keterlambatan).
-- Kritis tidak punya batas atas (batas_max_piutang NULL).
MERGE dbo.level_utang AS t
USING (VALUES
    ('Rendah', CAST(0 AS DECIMAL(12, 2)),       CAST(500000 AS DECIMAL(12, 2))),
    ('Sedang', CAST(500000 AS DECIMAL(12, 2)),  CAST(2000000 AS DECIMAL(12, 2))),
    ('Tinggi', CAST(2000000 AS DECIMAL(12, 2)), CAST(NULL AS DECIMAL(12, 2))),
    ('Kritis', CAST(2000000 AS DECIMAL(12, 2)), CAST(NULL AS DECIMAL(12, 2)))
) AS s (nama_level, batas_min_piutang, batas_max_piutang)
ON t.nama_level = s.nama_level
WHEN MATCHED THEN UPDATE SET batas_min_piutang = s.batas_min_piutang, batas_max_piutang = s.batas_max_piutang
WHEN NOT MATCHED THEN INSERT (nama_level, batas_min_piutang, batas_max_piutang)
     VALUES (s.nama_level, s.batas_min_piutang, s.batas_max_piutang);
GO
