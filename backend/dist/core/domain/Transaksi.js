import { BaseEntity } from './BaseEntity';
/**
 * Transaksi: Kelas abstrak turunan dari BaseEntity yang menjadi basis
 * untuk konsep POLIMORFISME pada transaksi finansial (Pesanan dan Pengeluaran).
 */
export class Transaksi extends BaseEntity {
    #nominal;
    #tanggal;
    #keterangan;
    constructor(id, nominal, tanggal, keterangan = '', createdAt) {
        super(id, createdAt);
        if (nominal < 0) {
            throw new Error('Nominal transaksi tidak boleh negatif.');
        }
        this.#nominal = nominal;
        this.#tanggal = tanggal;
        this.#keterangan = keterangan;
    }
    // --- ENKAPSULASI: Getter & Setter ---
    get nominal() {
        return this.#nominal;
    }
    set nominal(val) {
        if (val < 0) {
            throw new Error('Nominal transaksi tidak boleh negatif.');
        }
        this.#nominal = val;
        this.touch();
    }
    get tanggal() {
        return new Date(this.#tanggal.getTime());
    }
    get keterangan() {
        return this.#keterangan;
    }
    set keterangan(val) {
        this.#keterangan = val;
        this.touch();
    }
    // --- OVERRIDING: Meng-override method toJSON dari BaseEntity ---
    toJSON() {
        return {
            id: this.id,
            nominal: this.#nominal,
            tanggal: this.#tanggal.toISOString(),
            keterangan: this.#keterangan,
            jenis: this.getJenisTransaksi(),
            totalAkhir: this.hitungTotal(),
            createdAt: this.createdAt.toISOString(),
        };
    }
}
//# sourceMappingURL=Transaksi.js.map