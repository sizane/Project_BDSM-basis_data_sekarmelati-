import { Transaksi } from './Transaksi';
/**
 * Pengeluaran: Subclass lain dari Transaksi (POLIMORFISME).
 * Memenuhi kriteria:
 * - POLIMORFISME: Merupakan wujud konkret polimorfik lain dari Transaksi selain Pesanan.
 * - ENKAPSULASI: Properti privat (#kategori, #penanggungJawab) dengan getter/setter.
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 */
export class Pengeluaran extends Transaksi {
    #kategori;
    #penanggungJawab;
    constructor(id, nominal, tanggal, kategori, penanggungJawab, keterangan = '', createdAt) {
        super(id, nominal, tanggal, keterangan, createdAt);
        if (!penanggungJawab || penanggungJawab.trim() === '') {
            throw new Error('Penanggung jawab wajib diisi.');
        }
        this.#kategori = kategori;
        this.#penanggungJawab = penanggungJawab.trim();
    }
    // --- ENKAPSULASI: Getters & Setters ---
    get kategori() {
        return this.#kategori;
    }
    set kategori(k) {
        this.#kategori = k;
        this.touch();
    }
    get penanggungJawab() {
        return this.#penanggungJawab;
    }
    set penanggungJawab(pj) {
        if (!pj || pj.trim() === '') {
            throw new Error('Penanggung jawab wajib diisi.');
        }
        this.#penanggungJawab = pj.trim();
        this.touch();
    }
    // --- OVERRIDING: Meng-override method hitungTotal (POLIMORFISME) ---
    hitungTotal() {
        // Pengeluaran dihitung sebagai nilai nominal operasional murni
        return this.nominal;
    }
    // --- OVERRIDING: Meng-override getJenisTransaksi ---
    getJenisTransaksi() {
        return 'PENGELUARAN_OPERASIONAL';
    }
    // --- OVERRIDING: Meng-override toJSON ---
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            kategori: this.#kategori,
            penanggungJawab: this.#penanggungJawab,
        };
    }
}
//# sourceMappingURL=Pengeluaran.js.map