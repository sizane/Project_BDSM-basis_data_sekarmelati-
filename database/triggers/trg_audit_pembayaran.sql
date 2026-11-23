-- trg_audit_pembayaran (TSD 5.4): PAYMENT_CREATED ke audit_logs.
CREATE OR ALTER TRIGGER dbo.trg_audit_pembayaran
ON dbo.pembayaran
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @admin_id UNIQUEIDENTIFIER = TRY_CAST(SESSION_CONTEXT(N'admin_id') AS UNIQUEIDENTIFIER);
    DECLARE @admin_username VARCHAR(50) = ISNULL(CAST(SESSION_CONTEXT(N'admin_username') AS VARCHAR(50)), 'system');
    DECLARE @ip VARCHAR(45) = ISNULL(CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)), 'unknown');

    INSERT INTO dbo.audit_logs (admin_id, admin_username, action_type, resource_type, resource_id, old_values, new_values, ip_address)
    SELECT
        @admin_id,
        @admin_username,
        'PAYMENT_CREATED',
        'pembayaran',
        i.pembayaran_id,
        NULL,
        (SELECT i.pesanan_id AS pesanan_id, i.jumlah AS jumlah, i.jenis_pembayaran AS jenis_pembayaran
         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        @ip
    FROM inserted i;
END;
GO
