-- TSD 6.2: audit_logs append-only. User aplikasi hanya boleh INSERT dan SELECT.
-- Isi @app_user dengan user database yang dipakai backend (DB_USER di .env), lalu jalankan.
-- Admin tidak pernah di-DELETE (soft delete lewat is_active), sehingga FK ON DELETE SET NULL
-- tidak berbenturan dengan DENY ini.
DECLARE @app_user SYSNAME = N'sekar_app';   -- <-- ganti sesuai DB_USER
DECLARE @sql NVARCHAR(MAX);

IF USER_ID(@app_user) IS NULL
BEGIN
    PRINT 'User ' + @app_user + ' tidak ditemukan di database ini; permission tidak diubah.';
END
ELSE
BEGIN
    SET @sql = N'GRANT INSERT, SELECT ON dbo.audit_logs TO ' + QUOTENAME(@app_user) + N';
                 DENY UPDATE, DELETE ON dbo.audit_logs TO ' + QUOTENAME(@app_user) + N';';
    EXEC sys.sp_executesql @sql;
END
GO
