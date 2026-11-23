import type { Request } from 'express';
import type { PaginationMeta } from '../../types/api-response';
import type { ListAuditLogsQuery } from './audit.schema';
import type { SessionContext } from '../../middlewares/session-context';
/**
 * AuditService: Kelas service audit untuk relasi AGREGASI dan ASOSIASI.
 * - AGREGASI: Di-inject ke dalam PesananService dan PengeluaranService.
 * - ASOSIASI: Menerima instance SessionContext sebagai parameter method.
 */
export declare class AuditService {
    catat(aksi: string, tabelTerkait: string, recordId: string | null, deskripsi: string, session: SessionContext): Promise<void>;
    list(query: ListAuditLogsQuery): Promise<{
        data: unknown[];
        meta: PaginationMeta;
    }>;
}
export declare const auditServiceInstance: AuditService;
export interface AuditEntry {
    adminId: string | null;
    adminUsername: string;
    actionType: string;
    resourceType?: string | null;
    resourceId?: string | null;
    newValues?: Record<string, unknown> | null;
    ipAddress: string;
}
/**
 * Mencatat kejadian yang tidak dipicu trigger (LOGIN_*, LOGOUT, ACCESS_DENIED, perubahan akun admin)
 * lewat sp_tulis_audit_log. Gagal menulis log TIDAK boleh membatalkan proses utama (BR-29):
 * error dicatat ke log server dan fungsi tetap selesai tanpa melempar.
 */
export declare function tulisAuditLog(entry: AuditEntry): Promise<void>;
/** Catat upaya akses ditolak (BR-31, ERR-AUTH-03). */
export declare function catatAksesDitolak(req: Request, requiredRoles: readonly string[]): Promise<void>;
export declare function listAuditLogs(query: ListAuditLogsQuery): Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
//# sourceMappingURL=audit.service.d.ts.map