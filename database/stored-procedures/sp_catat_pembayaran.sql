-- sp_catat_pembayaran (TSD 5.1 / FSD-2.3)
-- Kontrak dengan backend (pesanan.service.ts -> catatPembayaran): hasil lewat OUTPUT parameter.
-- result: SUCCESS | ORDER_NOT_FOUND | AMOUNT_INVALID | OVERPAYMENT | SYSTEM_ERROR
-- Status 'Lunas' diubah oleh trg_update_status_pesanan.
CREATE OR ALTER PROCEDURE dbo.sp_catat_pembayaran
    @pesanan_id UNIQUEIDENTIFIER,
    @admin_id UNIQUEIDENTIFIER,
    @tanggal_bayar DATE,
    @jumlah DECIMAL(12, 2),
    @jenis_pembayaran VARCHAR(20),
    @ip_address VARCHAR(45),
    @result VARCHAR(30) OUTPUT,
    @pembayaran_id UNIQUEIDENTIFIER = NULL OUTPUT,
    @sisa_piutang_baru DECIMAL(12, 2) = NULL OUTPUT,
    @status_pesanan VARCHAR(20) = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @result = NULL;
    SET @pembayaran_id = NULL;
    SET @sisa_piutang_baru = NULL;
    SET @status_pesanan = NULL;

    IF @jumlah IS NULL OR @jumlah <= 0
    BEGIN
        SET @result = 'AMOUNT_INVALID';
        RETURN;
    END

    -- Konteks sesi untuk trigger audit (trg_audit_pembayaran, trg_audit_pesanan).
    DECLARE @admin_username VARCHAR(50);
    SELECT @admin_username = username FROM dbo.admins WHERE admin_id = @admin_id;

    EXEC sys.sp_set_session_context @key = N'admin_id', @value = @admin_id;
    EXEC sys.sp_set_session_context @key = N'admin_username', @value = @admin_username;
    EXEC sys.sp_set_session_context @key = N'ip_address', @value = @ip_address;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Kunci baris pesanan: dua pembayaran bersamaan tidak bisa sama-sama lolos cek sisa.
        DECLARE @harga_total DECIMAL(12, 2);
        SELECT @harga_total = harga_total
        FROM dbo.pesanan WITH (UPDLOCK, HOLDLOCK)
        WHERE pesanan_id = @pesanan_id;

        IF @harga_total IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SET @result = 'ORDER_NOT_FOUND';
            RETURN;
        END

        DECLARE @sisa DECIMAL(18, 2) = dbo.fn_hitung_sisa_piutang(@pesanan_id);

        -- Pesanan yang sudah Lunas juga masuk ke sini karena sisanya 0.
        IF @jumlah > @sisa
        BEGIN
            ROLLBACK TRANSACTION;
            SET @result = 'OVERPAYMENT';
            RETURN;
        END

        -- Jenis pembayaran disesuaikan: sama dengan sisa => Pelunasan;
        -- 'Pelunasan' tetapi kurang dari sisa => Cicilan; selain itu pakai input.
        DECLARE @jenis VARCHAR(20) = CASE
            WHEN @jumlah = @sisa THEN 'Pelunasan'
            WHEN @jenis_pembayaran = 'Pelunasan' THEN 'Cicilan'
            WHEN @jenis_pembayaran IN ('DP', 'Cicilan') THEN @jenis_pembayaran
            ELSE 'Cicilan'
        END;

        -- ID dibuat di sini (bukan OUTPUT INSERTED) karena tabel pembayaran punya trigger INSERT.
        DECLARE @new_id UNIQUEIDENTIFIER = NEWID();

        INSERT INTO dbo.pembayaran (pembayaran_id, pesanan_id, admin_id, tanggal_bayar, jumlah, jenis_pembayaran)
        VALUES (@new_id, @pesanan_id, @admin_id, @tanggal_bayar, @jumlah, @jenis);

        -- Trigger sudah mengubah status bila lunas.
        SET @sisa_piutang_baru = dbo.fn_hitung_sisa_piutang(@pesanan_id);
        SELECT @status_pesanan = status_pesanan FROM dbo.pesanan WHERE pesanan_id = @pesanan_id;

        COMMIT TRANSACTION;

        SET @pembayaran_id = @new_id;
        SET @result = 'SUCCESS';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @pembayaran_id = NULL;
        SET @sisa_piutang_baru = NULL;
        SET @status_pesanan = NULL;
        SET @result = 'SYSTEM_ERROR';
    END CATCH
END;
GO
