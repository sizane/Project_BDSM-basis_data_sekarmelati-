import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { p } from '../../config/database';
import { SessionContext } from '../domain/SessionContext';
/**
 * AuditService: Layanan pencatatan jejak audit.
 * Memenuhi kriteria:
 * - AGREGASI: Mewarisi DatabaseService dari BaseService.
 * - ASOSIASI (Association / "uses-a"): Method catat() menerima objek SessionContext.
 * - OVERRIDING: Meng-override method getServiceName().
 * - ASYNC: Operasi pencatatan audit berjalan secara async.
 */
export class AuditService extends BaseService {
    constructor(db) {
        super(db);
    }
    // --- OVERRIDING: Meng-override method getServiceName dari BaseService ---
    getServiceName() {
        return 'AuditService';
    }
    // --- ASOSIASI: Menggunakan instance SessionContext sebagai parameter method ---
    async catat(aksi, tabelTerkait, recordId, deskripsi, session) {
        try {
            await this.db.proc('sp_tulis_audit_log', [
                p.varchar('aksi', aksi, 20),
                p.varchar('tabel_terkait', tabelTerkait, 50),
                p.uuid('record_id', recordId),
                p.nvarchar('deskripsi', deskripsi, 500),
            ], session);
        }
        catch {
            // Best-effort audit log
        }
    }
}
//# sourceMappingURL=AuditService.js.map