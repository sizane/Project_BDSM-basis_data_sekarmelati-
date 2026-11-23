-- trg_audit_login (TSD 5.4): login berhasil, gagal, dan lockout dicatat dari perubahan tabel admins
-- yang dilakukan sp_catat_percobaan_login. IP dari SESSION_CONTEXT('ip_address').
-- action_type: LOGIN_SUCCESS | LOGIN_FAILED | LOGIN_LOCKED (selaras dengan filter 'LOGIN%' di backend).
-- Kegagalan menulis log tidak boleh membatalkan login (TRY...CATCH).
CREATE OR ALTER TRIGGER dbo.trg_audit_login
ON dbo.admins
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Di dalam trigger XACT_ABORT bawaannya ON; dimatikan supaya error pada log bisa ditelan CATCH
    -- tanpa menggagalkan UPDATE login.
    SET XACT_ABORT OFF;

    IF NOT (UPDATE(last_login_at) OR UPDATE(failed_login_count) OR UPDATE(locked_until))
        RETURN;

    BEGIN TRY
        DECLARE @ip VARCHAR(45) = ISNULL(CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)), 'unknown');
        DECLARE @min_dt DATETIME2 = CAST('0001-01-01' AS DATETIME2);

        INSERT INTO dbo.audit_logs (admin_id, admin_username, action_type, resource_type, resource_id, old_values, new_values, ip_address)
        SELECT
            i.admin_id,
            i.username,
            CASE
                WHEN i.last_login_at > ISNULL(d.last_login_at, @min_dt) THEN 'LOGIN_SUCCESS'
                WHEN i.locked_until IS NOT NULL AND (d.locked_until IS NULL OR i.locked_until <> d.locked_until) THEN 'LOGIN_LOCKED'
                ELSE 'LOGIN_FAILED'
            END,
            'Autentikasi',
            i.admin_id,
            NULL,
            (SELECT
                 CASE
                     WHEN i.last_login_at > ISNULL(d.last_login_at, @min_dt) THEN 'Berhasil'
                     WHEN i.locked_until IS NOT NULL AND (d.locked_until IS NULL OR i.locked_until <> d.locked_until) THEN 'Terkunci'
                     ELSE 'Gagal'
                 END AS hasil,
                 i.failed_login_count AS percobaan_gagal
             FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            @ip
        FROM inserted i
        JOIN deleted d ON d.admin_id = i.admin_id
        WHERE i.last_login_at > ISNULL(d.last_login_at, @min_dt)
           OR (i.failed_login_count <> d.failed_login_count AND i.failed_login_count > 0)
           OR (i.locked_until IS NOT NULL AND (d.locked_until IS NULL OR i.locked_until <> d.locked_until));
    END TRY
    BEGIN CATCH
        -- Sengaja ditelan: proses login tetap berjalan.
        RETURN;
    END CATCH
END;
GO
