import { Transaksi } from './Transaksi';
/**
 * Pengeluaran: Subclass lain dari Transaksi (POLIMORFISME).
 * Memenuhi kriteria:
 * - POLIMORFISME: Merupakan wujud konkret polimorfik lain dari Transaksi selain Pesanan.
 * - ENKAPSULASI: Properti privat (#kategori, #penanggungJawab) dengan getter/setter.
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 */
export declare class Pengeluaran extends Transaksi {
    #private;
    constructor(id: string, nominal: number, tanggal: Date, kategori: 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain', penanggungJawab: string, keterangan?: string, createdAt?: Date);
    get kategori(): 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain';
    set kategori(k: 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain');
    get penanggungJawab(): string;
    set penanggungJawab(pj: string);
    hitungTotal(): number;
    getJenisTransaksi(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Pengeluaran.d.ts.map