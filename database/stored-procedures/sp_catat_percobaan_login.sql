-- SP 2: sp_catat_percobaan_login (TSD 5.1)
CREATE OR ALTER PROCEDURE dbo.sp_catat_percobaan_login
    @username VARCHAR(50),
    @success BIT,
    @ip_address VARCHAR(45)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @admin_id UNIQUEIDENTIFIER;
    SELECT @admin_id = admin_id FROM admins WHERE username = @username;
    IF @admin_id IS NULL RETURN;

    EXEC sp_set_session_context @key = N'ip_address', @value = @ip_address;

    IF @success = 1
    BEGIN
        UPDATE admins
        SET failed_login_count = 0,
            locked_until = NULL,
            last_login_at = SYSUTCDATETIME()
        WHERE admin_id = @admin_id;
    END
    ELSE
    BEGIN
        UPDATE admins
        SET failed_login_count = CASE
                WHEN locked_until IS NOT NULL AND locked_until <= SYSUTCDATETIME() THEN 1
                ELSE failed_login_count + 1
            END,
            locked_until = CASE
                WHEN (CASE WHEN locked_until IS NOT NULL AND locked_until <= SYSUTCDATETIME() THEN 1 ELSE failed_login_count + 1 END) >= 3
                    THEN DATEADD(MINUTE, 15, SYSUTCDATETIME())
                ELSE NULL
            END
        WHERE admin_id = @admin_id;
    END
END;
GO