import { Transaksi } from './Transaksi';
import { ItemPesanan } from './ItemPesanan';
/**
 * Pesanan: Subclass dari Transaksi.
 * Memenuhi kriteria:
 * - ENKAPSULASI: Properti privat (#noPesanan, #items, dll.) dengan akses terkontrol.
 * - KOMPOSISI: Memiliki array ItemPesanan yang dibuat dan dikontrol secara internal (Strong Has-A).
 * - OVERRIDING: Meng-override method hitungTotal, getJenisTransaksi, dan toJSON.
 * - POLIMORFISME: Merupakan wujud konkret polimorfik dari kelas dasar Transaksi.
 */
export declare class Pesanan extends Transaksi {
    #private;
    constructor(id: string, noPesanan: string, namaCustomer: string, noHpCustomer: string, hargaTotal: number, tanggalMasuk: Date, tenggat: Date, statusPesanan?: 'Antrian' | 'Dikerjakan' | 'Selesai' | 'Batal', totalTerbayar?: number, keterangan?: string, createdAt?: Date);
    tambahItem(nama: string, kuantitas: number, hargaSatuan: number): ItemPesanan;
    get items(): ReadonlyArray<ItemPesanan>;
    get noPesanan(): string;
    get namaCustomer(): string;
    get noHpCustomer(): string;
    get statusPesanan(): string;
    set statusPesanan(status: 'Antrian' | 'Dikerjakan' | 'Selesai' | 'Batal');
    get tenggat(): Date;
    get totalTerbayar(): number;
    get sisaPiutang(): number;
    catatPembayaran(nominal: number): void;
    hitungTotal(): number;
    getJenisTransaksi(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Pesanan.d.ts.map