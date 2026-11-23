import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { AuditService } from './AuditService';
import { Pengeluaran } from '../domain/Pengeluaran';
import { SessionContext } from '../domain/SessionContext';
import type { PaginationMeta } from '../../types/api-response';
import type { CreatePengeluaranBody, ListPengeluaranQuery } from '../../modules/pengeluaran/pengeluaran.schema';
/**
 * PengeluaranCoreService: Layanan bisnis berbasis OOP untuk domain Pengeluaran.
 * Memenuhi kriteria:
 * - AGREGASI: Menyimpan referensi DatabaseService dan AuditService.
 * - ASOSIASI: Menggunakan SessionContext untuk parameter operasional.
 * - OVERLOADING: cariPengeluaran() menerima ID tunggal ATAU query filter.
 * - POLIMORFISME & OVERRIDING: Menghasilkan objek domain Pengeluaran yang meng-override Transaksi.
 * - ASYNC: async/await pada seluruh interaksi I/O.
 */
export declare class PengeluaranCoreService extends BaseService {
    private readonly audit;
    constructor(db?: DatabaseService, audit?: AuditService);
    getServiceName(): string;
    cariPengeluaran(id: string): Promise<Pengeluaran | null>;
    cariPengeluaran(query: ListPengeluaranQuery): Promise<{
        data: unknown[];
        meta: PaginationMeta;
    }>;
    listPengeluaran(query: ListPengeluaranQuery): Promise<{
        data: unknown[];
        meta: PaginationMeta;
    }>;
    getPengeluaranModelById(id: string): Promise<Pengeluaran | null>;
    createPengeluaran(body: CreatePengeluaranBody, session: SessionContext): Promise<{
        pengeluaran_id: string;
        tanggal: string;
        nominal: number;
    }>;
}
//# sourceMappingURL=PengeluaranCoreService.d.ts.map