import type { PaginationMeta } from '../../types/api-response';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';
export declare function listPesanan(query: ListPesananQuery): Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
export declare function getPesananDetail(pesananId: string): Promise<{
    pesanan_id: any;
    no_pesanan: any;
    tanggal_masuk: string | null;
    tenggat: string | null;
    tanggal_lunas: string | null;
    nama_customer: any;
    customer: {
        customer_id: any;
        nama_customer: any;
        no_kontak: any;
    };
    dicatat_oleh: any;
    items: {
        item_id: any;
        rincian_pesanan: any;
        kuantitas: any;
        harga_per_item: number;
        subtotal: number;
    }[];
    harga_total: number;
    total_dibayar: number;
    sisa_piutang: number;
    status_pesanan: any;
    riwayat_pembayaran: {
        pembayaran_id: any;
        tanggal_bayar: string | null;
        jenis_pembayaran: any;
        jumlah: number;
    }[];
}>;
export declare function createPesanan(body: CreatePesananBody, adminId: string, ip: string): Promise<{
    pesanan_id: string | null;
    no_pesanan: string | null;
    harga_total: number;
    sisa_piutang: number;
    status_pesanan: string | null;
}>;
export declare function catatPembayaran(pesananId: string, body: CatatPembayaranBody, adminId: string, ip: string): Promise<{
    pembayaran_id: string | undefined;
    sisa_piutang_baru: number;
    status_pesanan: string | undefined;
}>;
//# sourceMappingURL=pesanan.service.d.ts.map