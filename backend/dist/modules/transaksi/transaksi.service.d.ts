import type { PaginationMeta } from '../../types/api-response';
import type { ListTransaksiQuery } from './transaksi.schema';
import { Transaksi } from '../pesanan/pesanan.service';
/**
 * TransaksiService: Layanan berbasis OOP yang mendemonstrasikan POLIMORFISME dan ASYNC.
 * - POLIMORFISME: Memproses koleksi instance Transaksi (Pesanan & Pengeluaran) secara seragam.
 * - ASYNC: Mengambil data riwayat transaksi secara asynchronous.
 */
export declare class TransaksiService {
    /**
     * POLIMORFISME: Parameter transaksiList berisi objek kelas dasar Transaksi.
     * Pada saat runtime, pemanggilan tx.hitungTotal() memicu implementasi spesifik dari subclass.
     */
    hitungAkumulasiPolimorfik(transaksiList: Transaksi[]): {
        totalPemasukan: number;
        totalPengeluaran: number;
        saldoBersih: number;
    };
    listRiwayatTransaksi(query: ListTransaksiQuery): Promise<{
        data: unknown[];
        meta: PaginationMeta;
    }>;
}
export declare const transaksiService: TransaksiService;
export declare const listRiwayatTransaksi: (query: ListTransaksiQuery) => Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
//# sourceMappingURL=transaksi.service.d.ts.map