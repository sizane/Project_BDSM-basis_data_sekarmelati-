-- trg_audit_pengeluaran (TSD 5.4): EXPENSE_CREATED ke audit_logs.
CREATE OR ALTER TRIGGER dbo.trg_audit_pengeluaran
ON dbo.pengeluaran
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
        'EXPENSE_CREATED',
        'pengeluaran',
        i.pengeluaran_id,
        NULL,
        (SELECT i.kategori_pengeluaran AS kategori_pengeluaran, i.jumlah AS jumlah
         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        @ip
    FROM inserted i;
END;
GO
