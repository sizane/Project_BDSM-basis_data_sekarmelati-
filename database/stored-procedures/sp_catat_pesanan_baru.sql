-- SP 3: sp_catat_pesanan_baru (TSD 5.1)
CREATE OR ALTER PROCEDURE dbo.sp_catat_pesanan_baru
    @admin_id UNIQUEIDENTIFIER,
    @nama_customer VARCHAR(100),
    @no_kontak VARCHAR(20),
    @rincian_pesanan VARCHAR(200),
    @kuantitas INT,
    @harga_per_item DECIMAL(12, 2),
    @dp DECIMAL(12, 2) = 0,
    @tenggat DATE,
    @ip_address VARCHAR(45)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @hari_ini DATE = CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE);
    DECLARE @total DECIMAL(12, 2) = @kuantitas * @harga_per_item;

    IF @kuantitas <= 0 BEGIN SELECT 'QTY_INVALID' AS result; RETURN; END
    IF @harga_per_item <= 0 BEGIN SELECT 'PRICE_INVALID' AS result; RETURN; END
    IF @dp < 0 BEGIN SELECT 'DP_NEGATIVE' AS result; RETURN; END
    IF @dp > @total BEGIN SELECT 'DP_EXCEEDS_TOTAL' AS result; RETURN; END
    IF @tenggat < @hari_ini BEGIN SELECT 'DUE_DATE_INVALID' AS result; RETURN; END

    DECLARE @admin_username VARCHAR(50);
    SELECT @admin_username = username FROM admins WHERE admin_id = @admin_id;

    EXEC sp_set_session_context @key = N'admin_id', @value = @admin_id;
    EXEC sp_set_session_context @key = N'admin_username', @value = @admin_username;
    EXEC sp_set_session_context @key = N'ip_address', @value = @ip_address;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @customer_id UNIQUEIDENTIFIER;
        SELECT @customer_id = customer_id
        FROM customers
        WHERE nama_customer = @nama_customer AND no_kontak = @no_kontak;

        IF @customer_id IS NULL
        BEGIN
            SET @customer_id = NEWID();
            INSERT INTO customers (customer_id, nama_customer, no_kontak)
            VALUES (@customer_id, @nama_customer, @no_kontak);
        END

        -- Generate nomor nota unik SM-yyMMdd-XXX
        DECLARE @prefix VARCHAR(10) = 'SM-' + FORMAT(@hari_ini, 'yyMMdd') + '-';
        DECLARE @last_seq INT = 0;

        SELECT @last_seq = ISNULL(MAX(TRY_CAST(RIGHT(no_pesanan, 3) AS INT)), 0)
        FROM pesanan WITH (UPDLOCK, HOLDLOCK)
        WHERE no_pesanan LIKE @prefix + '%';

        DECLARE @no_pesanan VARCHAR(20) = @prefix + RIGHT('000' + CAST(@last_seq + 1 AS VARCHAR(3)), 3);
        DECLARE @pesanan_id UNIQUEIDENTIFIER = NEWID();

        INSERT INTO pesanan (pesanan_id, no_pesanan, customer_id, admin_id, tanggal_masuk, tenggat, harga_total, status_pesanan)
        VALUES (@pesanan_id, @no_pesanan, @customer_id, @admin_id, @hari_ini, @tenggat, @total, 'Belum Lunas');

        INSERT INTO item_pesanan (pesanan_id, rincian_pesanan, jumlah, harga_per_item)
        VALUES (@pesanan_id, @rincian_pesanan, @kuantitas, @harga_per_item);

        IF @dp > 0
        BEGIN
            INSERT INTO pembayaran (pesanan_id, admin_id, tanggal_bayar, jumlah, jenis_pembayaran)
            VALUES (@pesanan_id, @admin_id, @hari_ini, @dp, CASE WHEN @dp = @total THEN 'Pelunasan' ELSE 'DP' END);
        END

        DECLARE @sisa_piutang DECIMAL(18, 2) = dbo.fn_hitung_sisa_piutang(@pesanan_id);
        DECLARE @status_pesanan VARCHAR(20);
        SELECT @status_pesanan = status_pesanan FROM pesanan WHERE pesanan_id = @pesanan_id;

        COMMIT TRANSACTION;

        SELECT
            'SUCCESS' AS result,
            @pesanan_id AS pesanan_id,
            @no_pesanan AS no_pesanan,
            @total AS harga_total,
            @sisa_piutang AS sisa_piutang,
            @status_pesanan AS status_pesanan;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 'SYSTEM_ERROR' AS result;
    END CATCH
END;
GO