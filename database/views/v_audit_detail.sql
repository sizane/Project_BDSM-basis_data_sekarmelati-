-- v_audit_detail (TSD 5.3 menulis "v_AuditDetail"; backend memakai nama v_audit_detail).
CREATE OR ALTER VIEW dbo.v_audit_detail
AS
SELECT
    log_id,
    created_at,
    admin_username,
    action_type,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address
FROM dbo.audit_logs;
GO
