import { BaseEntity } from './BaseEntity';
/**
 * Transaksi: Kelas abstrak turunan dari BaseEntity yang menjadi basis
 * untuk konsep POLIMORFISME pada transaksi finansial (Pesanan dan Pengeluaran).
 */
export declare abstract class Transaksi extends BaseEntity {
    #private;
    constructor(id: string, nominal: number, tanggal: Date, keterangan?: string, createdAt?: Date);
    get nominal(): number;
    protected set nominal(val: number);
    get tanggal(): Date;
    get keterangan(): string;
    set keterangan(val: string);
    abstract hitungTotal(): number;
    abstract getJenisTransaksi(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Transaksi.d.ts.map