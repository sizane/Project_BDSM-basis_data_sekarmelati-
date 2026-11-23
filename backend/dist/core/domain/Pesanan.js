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
export class Pesanan extends Transaksi {
    #noPesanan;
    #namaCustomer;
    #noHpCustomer;
    #statusPesanan;
    #tenggat;
    #totalTerbayar;
    // --- KOMPOSISI (Composition): Siklus hidup ItemPesanan terikat erat pada Pesanan ---
    #items = [];
    constructor(id, noPesanan, namaCustomer, noHpCustomer, hargaTotal, tanggalMasuk, tenggat, statusPesanan = 'Antrian', totalTerbayar = 0, keterangan = '', createdAt) {
        super(id, hargaTotal, tanggalMasuk, keterangan, createdAt);
        if (!noPesanan || noPesanan.trim() === '') {
            throw new Error('Nomor pesanan wajib diisi.');
        }
        if (!namaCustomer || namaCustomer.trim() === '') {
            throw new Error('Nama customer wajib diisi.');
        }
        this.#noPesanan = noPesanan;
        this.#namaCustomer = namaCustomer;
        this.#noHpCustomer = noHpCustomer;
        this.#statusPesanan = statusPesanan;
        this.#tenggat = tenggat;
        this.#totalTerbayar = totalTerbayar;
    }
    // --- KOMPOSISI: Penambahan item pesanan dienkapsulasi di dalam kelas induk ---
    tambahItem(nama, kuantitas, hargaSatuan) {
        const item = new ItemPesanan(nama, kuantitas, hargaSatuan);
        this.#items.push(item);
        this.touch();
        return item;
    }
    get items() {
        return [...this.#items];
    }
    // --- ENKAPSULASI: Getters & Setters ---
    get noPesanan() {
        return this.#noPesanan;
    }
    get namaCustomer() {
        return this.#namaCustomer;
    }
    get noHpCustomer() {
        return this.#noHpCustomer;
    }
    get statusPesanan() {
        return this.#statusPesanan;
    }
    set statusPesanan(status) {
        this.#statusPesanan = status;
        this.touch();
    }
    get tenggat() {
        return new Date(this.#tenggat.getTime());
    }
    get totalTerbayar() {
        return this.#totalTerbayar;
    }
    get sisaPiutang() {
        const sisa = this.hitungTotal() - this.#totalTerbayar;
        return sisa > 0 ? sisa : 0;
    }
    catatPembayaran(nominal) {
        if (nominal <= 0) {
            throw new Error('Nominal pembayaran harus lebih besar dari 0.');
        }
        if (this.#totalTerbayar + nominal > this.hitungTotal()) {
            throw new Error('Jumlah pembayaran melebihi total tagihan.');
        }
        this.#totalTerbayar += nominal;
        this.touch();
    }
    // --- OVERRIDING: Meng-override method hitungTotal dari Transaksi (POLIMORFISME) ---
    hitungTotal() {
        if (this.#items.length > 0) {
            return this.#items.reduce((sum, item) => sum + item.hitungSubtotal(), 0);
        }
        return this.nominal;
    }
    // --- OVERRIDING: Meng-override getJenisTransaksi dari Transaksi ---
    getJenisTransaksi() {
        return 'PEMASUKAN_PESANAN';
    }
    // --- OVERRIDING: Meng-override toJSON dari Transaksi ---
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            noPesanan: this.#noPesanan,
            namaCustomer: this.#namaCustomer,
            noHpCustomer: this.#noHpCustomer,
            statusPesanan: this.#statusPesanan,
            tenggat: this.#tenggat.toISOString(),
            totalTerbayar: this.#totalTerbayar,
            sisaPiutang: this.sisaPiutang,
            items: this.#items.map((i) => i.toJSON()),
        };
    }
}
//# sourceMappingURL=Pesanan.js.map