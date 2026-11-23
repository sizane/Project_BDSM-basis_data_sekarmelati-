-- trg_audit_pesanan (TSD 5.4): ORDER_CREATED / ORDER_UPDATED ke audit_logs.
-- Identitas pelaku dibaca dari SESSION_CONTEXT yang di-set oleh stored procedure / backend.
CREATE OR ALTER TRIGGER dbo.trg_audit_pesanan
ON dbo.pesanan
AFTER INSERT, UPDATE
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
        CASE WHEN d.pesanan_id IS NULL THEN 'ORDER_CREATED' ELSE 'ORDER_UPDATED' END,
        'pesanan',
        i.pesanan_id,
        CASE WHEN d.pesanan_id IS NULL THEN NULL
             ELSE (SELECT d.no_pesanan AS no_pesanan, d.harga_total AS harga_total, d.status_pesanan AS status_pesanan
                   FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
        (SELECT i.no_pesanan AS no_pesanan, i.harga_total AS harga_total, i.status_pesanan AS status_pesanan
         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        @ip
    FROM inserted i
    LEFT JOIN deleted d ON d.pesanan_id = i.pesanan_id;
END;
GO
