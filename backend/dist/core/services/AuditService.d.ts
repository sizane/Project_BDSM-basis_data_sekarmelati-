import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { SessionContext } from '../domain/SessionContext';
/**
 * AuditService: Layanan pencatatan jejak audit.
 * Memenuhi kriteria:
 * - AGREGASI: Mewarisi DatabaseService dari BaseService.
 * - ASOSIASI (Association / "uses-a"): Method catat() menerima objek SessionContext.
 * - OVERRIDING: Meng-override method getServiceName().
 * - ASYNC: Operasi pencatatan audit berjalan secara async.
 */
export declare class AuditService extends BaseService {
    constructor(db?: DatabaseService);
    getServiceName(): string;
    catat(aksi: 'Tambah' | 'Edit' | 'Hapus' | 'Login' | 'Logout' | 'AksesDitolak', tabelTerkait: string, recordId: string | null, deskripsi: string, session: SessionContext): Promise<void>;
}
//# sourceMappingURL=AuditService.d.ts.map