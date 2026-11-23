import type { PaginationMeta } from '../../types/api-response';
import type { CreatePengeluaranBody, ListPengeluaranQuery } from './pengeluaran.schema';
import { Transaksi } from '../pesanan/pesanan.service';
import { AuditService } from '../audit-log/audit.service';
import { SessionContext } from '../../middlewares/session-context';
/**
 * Pengeluaran: Subclass dari Transaksi (POLIMORFISME).
 * - POLIMORFISME: Merupakan wujud konkret polimorfik lain dari Transaksi selain Pesanan.
 * - ENKAPSULASI: Properti privat (#kategori, #penanggungJawab) dengan getter dan setter.
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 */
export declare class Pengeluaran extends Transaksi {
    #private;
    constructor(id: string, nominal: number, tanggal: Date, kategori: string, penanggungJawab?: string, keterangan?: string);
    get kategori(): string;
    set kategori(k: string);
    get penanggungJawab(): string;
    set penanggungJawab(pj: string);
    hitungTotal(): number;
    getJenisTransaksi(): string;
    toJSON(): Record<string, unknown>;
}
/**
 * PengeluaranService: Layanan bisnis berbasis OOP untuk modul Pengeluaran.
 * - AGREGASI: Menyimpan referensi AuditService yang diinjeksi melalui konstruktor.
 * - ASOSIASI: Menggunakan SessionContext untuk parameter operasional dan pencatatan audit.
 * - OVERLOADING: listPengeluaran() menerima query filter ATAU ID tunggal.
 * - ASYNC: Operasi I/O database berjalan secara asynchronous.
 */
export declare class PengeluaranService {
    private readonly audit;
    constructor(audit?: AuditService);
    listPengeluaran(query: ListPengeluaranQuery): Promise<{
        data: unknown[];
        meta: PaginationMeta;
    }>;
    listPengeluaran(id: string): Promise<Pengeluaran | null>;
    private getList;
    getPengeluaranModelById(id: string): Promise<Pengeluaran | null>;
    createPengeluaran(body: CreatePengeluaranBody, sessionOrAdminId: SessionContext | string, ipFallback?: string): Promise<{
        pengeluaran_id: string | null;
        tanggal_pengeluaran: string;
        kategori_pengeluaran: string;
        jumlah: number;
        keterangan: string | null;
    }>;
}
export declare const pengeluaranService: PengeluaranService;
export declare const listPengeluaran: (query: ListPengeluaranQuery) => Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
export declare const createPengeluaran: (body: CreatePengeluaranBody, sessionOrAdminId: SessionContext | string, ip?: string) => Promise<{
    pengeluaran_id: string | null;
    tanggal_pengeluaran: string;
    kategori_pengeluaran: string;
    jumlah: number;
    keterangan: string | null;
}>;
//# sourceMappingURL=pengeluaran.service.d.ts.map