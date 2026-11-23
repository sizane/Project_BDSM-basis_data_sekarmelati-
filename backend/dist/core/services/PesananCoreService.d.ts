import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { AuditService } from './AuditService';
import { Pesanan } from '../domain/Pesanan';
import { SessionContext } from '../domain/SessionContext';
import type { PaginationMeta } from '../../types/api-response';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from '../../modules/pesanan/pesanan.schema';
/**
 * PesananCoreService: Layanan bisnis berbasis OOP untuk domain Pesanan.
 * Memenuhi kriteria:
 * - AGREGASI (Aggregation): Menerima DatabaseService dan AuditService melalui konstruktor.
 * - ASOSIASI (Association): Method menggunakan objek SessionContext untuk pencatatan jejak audit.
 * - OVERLOADING: Method cariPesanan() mendukung pemanggilan via ID tunggal ATAU query pencarian.
 * - KOMPOSISI (Composition): Mengonstruksi objek Pesanan dan menambahkan ItemPesanan di dalamnya.
 * - OVERRIDING: Meng-override method getServiceName() dari BaseService.
 * - ASYNC: Semua operasi database berjalan asynchronous dengan async/await.
 */
export declare class PesananCoreService extends BaseService {
    private static instance;
    static getInstance(): PesananCoreService;
    private readonly audit;
    constructor(db?: DatabaseService, audit?: AuditService);
    getServiceName(): string;
    cariPesanan(id: string): Promise<Pesanan | null>;
    cariPesanan(query: ListPesananQuery): Promise<{
        data: unknown[];
        meta: PaginationMeta;
    }>;
    listPesanan(query: ListPesananQuery): Promise<{
        data: unknown[];
        meta: PaginationMeta;
    }>;
    getPesananModelById(id: string): Promise<Pesanan | null>;
    getPesananDetail(pesananId: string): Promise<{
        pesanan_id: string;
        no_pesanan: string;
        tanggal_masuk: string | null;
        tenggat: string | null;
        tanggal_lunas: string | null;
        nama_customer: string;
        customer: {
            customer_id: any;
            nama_customer: string;
            no_kontak: string;
        };
        dicatat_oleh: any;
        items: {
            rincian_pesanan: string;
            kuantitas: number;
            harga_per_item: number;
            subtotal: number;
        }[];
        harga_total: number;
        total_dibayar: number;
        sisa_piutang: number;
        status_pesanan: string;
        riwayat_pembayaran: {
            pembayaran_id: any;
            tanggal_bayar: string | null;
            jenis_pembayaran: any;
            jumlah: number;
        }[];
    }>;
    createPesanan(body: CreatePesananBody, session: SessionContext): Promise<{
        pesanan_id: string;
        no_pesanan: string;
        tanggal_masuk: string;
        harga_total: number;
        sisa_piutang: number;
    }>;
    catatPembayaran(pesananId: string, body: CatatPembayaranBody, session: SessionContext): Promise<{
        status_pembayaran: string;
        remaining_debt: number;
    }>;
}
//# sourceMappingURL=PesananCoreService.d.ts.map