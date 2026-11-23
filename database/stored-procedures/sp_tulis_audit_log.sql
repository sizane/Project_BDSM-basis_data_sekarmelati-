-- sp_tulis_audit_log (TSD 5.1): kejadian yang tidak dicatat trigger
-- (LOGIN_FAILED tanpa baris admin, LOGOUT, ACCESS_DENIED, ROLE_CHANGED, dst.). Append-only.
CREATE OR ALTER PROCEDURE dbo.sp_tulis_audit_log
    @admin_id UNIQUEIDENTIFIER = NULL,
    @admin_username VARCHAR(50),
    @action_type VARCHAR(50),
    @resource_type VARCHAR(50) = NULL,
    @resource_id UNIQUEIDENTIFIER = NULL,
    @new_values NVARCHAR(MAX) = NULL,
    @ip_address VARCHAR(45)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kolom new_values punya CHECK ISJSON; bungkus teks biasa agar log tidak ditolak.
    IF @new_values IS NOT NULL AND ISJSON(@new_values) = 0
        SET @new_values = (SELECT @new_values AS pesan FOR JSON PATH, WITHOUT_ARRAY_WRAPPER);

    INSERT INTO dbo.audit_logs (admin_id, admin_username, action_type, resource_type, resource_id, old_values, new_values, ip_address)
    VALUES (
        @admin_id,
        ISNULL(@admin_username, 'unknown'),
        @action_type,
        @resource_type,
        @resource_id,
        NULL,
        @new_values,
        ISNULL(@ip_address, 'unknown')
    );
END;
GO
