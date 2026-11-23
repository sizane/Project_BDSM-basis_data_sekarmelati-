-- sp_catat_pengeluaran (TSD 5.1 / FSD-2.4)
-- Mengembalikan 1 baris: result (SUCCESS | AMOUNT_INVALID | NOTES_REQUIRED | SYSTEM_ERROR), pengeluaran_id.
CREATE OR ALTER PROCEDURE dbo.sp_catat_pengeluaran
    @admin_id UNIQUEIDENTIFIER,
    @tanggal_pengeluaran DATE,
    @kategori_pengeluaran VARCHAR(20),
    @jumlah DECIMAL(12, 2),
    @keterangan VARCHAR(255) = NULL,
    @ip_address VARCHAR(45)
AS
BEGIN
    SET NOCOUNT ON;

    IF @jumlah IS NULL OR @jumlah <= 0
    BEGIN
        SELECT 'AMOUNT_INVALID' AS result, CAST(NULL AS UNIQUEIDENTIFIER) AS pengeluaran_id;
        RETURN;
    END

    IF @kategori_pengeluaran = 'Lain-lain' AND LEN(LTRIM(RTRIM(ISNULL(@keterangan, '')))) = 0
    BEGIN
        SELECT 'NOTES_REQUIRED' AS result, CAST(NULL AS UNIQUEIDENTIFIER) AS pengeluaran_id;
        RETURN;
    END

    DECLARE @admin_username VARCHAR(50);
    SELECT @admin_username = username FROM dbo.admins WHERE admin_id = @admin_id;

    EXEC sys.sp_set_session_context @key = N'admin_id', @value = @admin_id;
    EXEC sys.sp_set_session_context @key = N'admin_username', @value = @admin_username;
    EXEC sys.sp_set_session_context @key = N'ip_address', @value = @ip_address;

    BEGIN TRY
        DECLARE @new_id UNIQUEIDENTIFIER = NEWID();

        INSERT INTO dbo.pengeluaran (pengeluaran_id, admin_id, tanggal_pengeluaran, kategori_pengeluaran, jumlah, keterangan)
        VALUES (@new_id, @admin_id, @tanggal_pengeluaran, @kategori_pengeluaran, @jumlah, NULLIF(LTRIM(RTRIM(@keterangan)), ''));

        SELECT 'SUCCESS' AS result, @new_id AS pengeluaran_id;
    END TRY
    BEGIN CATCH
        SELECT 'SYSTEM_ERROR' AS result, CAST(NULL AS UNIQUEIDENTIFIER) AS pengeluaran_id;
    END CATCH
END;
GO
