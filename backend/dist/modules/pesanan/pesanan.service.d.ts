import type { PaginationMeta } from '../../types/api-response';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';
import { AuditService } from '../audit-log/audit.service';
import { SessionContext } from '../../middlewares/session-context';
/**
 * Transaksi: Kelas dasar abstrak untuk semua transaksi finansial.
 * - ENKAPSULASI: Properti privat (#id, #nominal, #tanggal, #keterangan) dengan getter & setter.
 * - POLIMORFISME: Mendefinisikan method abstrak hitungTotal() dan getJenisTransaksi().
 */
export declare abstract class Transaksi {
    #private;
    constructor(id: string, nominal: number, tanggal: Date, keterangan?: string);
    get id(): string;
    get nominal(): number;
    protected set nominal(val: number);
    get tanggal(): Date;
    get keterangan(): string;
    set keterangan(val: string);
    abstract hitungTotal(): number;
    abstract getJenisTransaksi(): string;
    toJSON(): Record<string, unknown>;
}
/**
 * ItemPesanan: Bagian dari relasi KOMPOSISI di dalam kelas Pesanan.
 * - KOMPOSISI (Strong "has-a"): Objek ItemPesanan dikelola seutuhnya oleh Pesanan induk.
 * - ENKAPSULASI: Properti privat (#nama, #kuantitas, #hargaSatuan) dengan validasi.
 */
export declare class ItemPesanan {
    #private;
    constructor(nama: string, kuantitas: number, hargaSatuan: number);
    get nama(): string;
    get kuantitas(): number;
    get hargaSatuan(): number;
    hitungSubtotal(): number;
    toJSON(): Record<string, unknown>;
}
/**
 * Pesanan: Subclass dari Transaksi.
 * - ENKAPSULASI: Properti privat (#noPesanan, #namaCustomer, dll.) dengan akses terkontrol.
 * - KOMPOSISI: Memiliki array ItemPesanan yang dibuat dan dikontrol secara internal (Strong Has-A).
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 * - POLIMORFISME: Wujud konkret polimorfik dari kelas Transaksi.
 */
export declare class Pesanan extends Transaksi {
    #private;
    constructor(id: string, noPesanan: string, namaCustomer: string, noKontak: string, hargaTotal: number, tanggalMasuk: Date, tenggat: Date, statusPesanan?: string, totalTerbayar?: number, keterangan?: string);
    tambahItem(nama: string, kuantitas: number, hargaSatuan: number): ItemPesanan;
    get items(): ReadonlyArray<ItemPesanan>;
    get noPesanan(): string;
    get namaCustomer(): string;
    get noKontak(): string;
    get statusPesanan(): string;
    set statusPesanan(status: string);
    get tenggat(): Date;
    get totalTerbayar(): number;
    get sisaPiutang(): number;
    catatPembayaran(nominal: number): void;
    hitungTotal(): number;
    getJenisTransaksi(): string;
    toJSON(): Record<string, unknown>;
}
/**
 * PesananService: Layanan bisnis berbasis OOP untuk modul Pesanan.
 * - AGREGASI (Aggregation): Menerima AuditService via konstruktor / Dependency Injection.
 * - ASOSIASI (Association): Method menggunakan objek SessionContext untuk pencatatan audit.
 * - OVERLOADING: Method cariPesanan() mendukung ID tunggal ATAU query filter.
 * - ASYNC: Semua operasi database berjalan asynchronous dengan async/await.
 */
export declare class PesananService {
    private readonly audit;
    constructor(audit?: AuditService);
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
    createPesanan(body: CreatePesananBody, sessionOrAdminId: SessionContext | string, ipFallback?: string): Promise<{
        pesanan_id: string;
        no_pesanan: string;
        harga_total: number;
        sisa_piutang: number;
        status_pesanan: string;
    }>;
    catatPembayaran(pesananId: string, body: CatatPembayaranBody, sessionOrAdminId: SessionContext | string, ipFallback?: string): Promise<{
        pembayaran_id: string;
        sisa_piutang_baru: number;
        status_pesanan: string;
    }>;
}
export declare const pesananService: PesananService;
export declare const listPesanan: (query: ListPesananQuery) => Promise<{
    data: unknown[];
    meta: PaginationMeta;
}>;
export declare const getPesananDetail: (id: string) => Promise<{
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
export declare const createPesanan: (body: CreatePesananBody, sessionOrAdminId: SessionContext | string, ip?: string) => Promise<{
    pesanan_id: string;
    no_pesanan: string;
    harga_total: number;
    sisa_piutang: number;
    status_pesanan: string;
}>;
export declare const catatPembayaran: (pesananId: string, body: CatatPembayaranBody, sessionOrAdminId: SessionContext | string, ip?: string) => Promise<{
    pembayaran_id: string;
    sisa_piutang_baru: number;
    status_pesanan: string;
}>;
//# sourceMappingURL=pesanan.service.d.ts.map