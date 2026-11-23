import { p, runProc, runQuery, sql } from '../../config/database';
import { escapeLike } from '../../utils/sanitizer';
import { wibDayStart, wibNextDayStart } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import { logger } from '../../utils/logger';
/**
 * AuditService: Kelas service audit untuk relasi AGREGASI dan ASOSIASI.
 * - AGREGASI: Di-inject ke dalam PesananService dan PengeluaranService.
 * - ASOSIASI: Menerima instance SessionContext sebagai parameter method.
 */
export class AuditService {
    async catat(aksi, tabelTerkait, recordId, deskripsi, session) {
        await tulisAuditLog({
            adminId: session.adminId,
            adminUsername: session.adminUsername ?? 'unknown',
            actionType: aksi,
            resourceType: tabelTerkait,
            resourceId: recordId,
            newValues: { deskripsi },
            ipAddress: session.ipAddress,
        });
    }
    async list(query) {
        return await listAuditLogs(query);
    }
}
export const auditServiceInstance = new AuditService();
/**
 * Mencatat kejadian yang tidak dipicu trigger (LOGIN_*, LOGOUT, ACCESS_DENIED, perubahan akun admin)
 * lewat sp_tulis_audit_log. Gagal menulis log TIDAK boleh membatalkan proses utama (BR-29):
 * error dicatat ke log server dan fungsi tetap selesai tanpa melempar.
 */
export async function tulisAuditLog(entry) {
    try {
        await runProc('sp_tulis_audit_log', [
            p.uuid('admin_id', entry.adminId),
            p.varchar('admin_username', entry.adminUsername.slice(0, 50), 50),
            p.varchar('action_type', entry.actionType, 50),
            p.varchar('resource_type', entry.resourceType ?? null, 50),
            p.uuid('resource_id', entry.resourceId ?? null),
            p.nvarchar('new_values', entry.newValues ? JSON.stringify(entry.newValues) : null, sql.MAX),
            p.varchar('ip_address', entry.ipAddress, 45),
        ]);
    }
    catch (err) {
        logger.error('Gagal menulis audit log', err, { actionType: entry.actionType });
    }
}
/** Catat upaya akses ditolak (BR-31, ERR-AUTH-03). */
export async function catatAksesDitolak(req, requiredRoles) {
    await tulisAuditLog({
        adminId: req.user?.adminId ?? null,
        adminUsername: req.user?.username ?? 'unknown',
        actionType: 'ACCESS_DENIED',
        resourceType: 'Akses',
        newValues: { method: req.method, path: req.originalUrl.split('?')[0], required_roles: requiredRoles },
        ipAddress: req.clientIp,
    });
}
// ---------------------------------------------------------------------------
// Daftar audit log (FSD-2.13)
// ---------------------------------------------------------------------------
/** Filter jenis tindakan dipetakan ke predikat tetap (tidak ada input user yang masuk ke SQL). */
const ACTION_PREDICATES = {
    Tambah: `action_type LIKE '%[_]CREATED'`,
    Edit: `(action_type LIKE '%[_]UPDATED' OR action_type = 'ROLE_CHANGED')`,
    Hapus: `(action_type LIKE '%[_]DELETED' OR action_type LIKE '%[_]VOIDED')`,
    Login: `action_type LIKE 'LOGIN%'`,
    Logout: `action_type = 'LOGOUT'`,
    AksesDitolak: `action_type = 'ACCESS_DENIED'`,
};
function parseJson(value) {
    if (value === null)
        return null;
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
}
export async function listAuditLogs(query) {
    const where = [];
    const params = [];
    if (query.rentang_tanggal.awal) {
        where.push('created_at >= @awal');
        params.push(p.datetime2('awal', wibDayStart(query.rentang_tanggal.awal)));
    }
    if (query.rentang_tanggal.akhir) {
        where.push('created_at < @akhir');
        params.push(p.datetime2('akhir', wibNextDayStart(query.rentang_tanggal.akhir)));
    }
    if (query.nama_pengguna) {
        where.push(`admin_username LIKE @nama ESCAPE '!'`);
        params.push(p.varchar('nama', `%${escapeLike(query.nama_pengguna)}%`, 60));
    }
    if (query.jenis_tindakan) {
        const predicate = ACTION_PREDICATES[query.jenis_tindakan];
        if (predicate)
            where.push(predicate);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const count = await runQuery(`SELECT COUNT(*) AS total FROM dbo.v_audit_detail ${whereSql}`, params);
    const total = count.recordset[0]?.total ?? 0;
    const rows = await runQuery(`SELECT log_id, created_at, admin_username, action_type, resource_type, resource_id,
            old_values, new_values, ip_address
       FROM dbo.v_audit_detail
       ${whereSql}
      ORDER BY created_at DESC, log_id
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`, [...params, p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)]);
    return {
        data: rows.recordset.map((r) => ({
            log_id: r.log_id,
            nama_pengguna: r.admin_username,
            action_type: r.action_type,
            resource_type: r.resource_type,
            resource_id: r.resource_id,
            old_values: parseJson(r.old_values),
            new_values: parseJson(r.new_values),
            ip_address: r.ip_address,
            created_at: r.created_at.toISOString(),
        })),
        meta: buildMeta(query.page, query.per_page, total),
    };
}
//# sourceMappingURL=audit.service.js.map