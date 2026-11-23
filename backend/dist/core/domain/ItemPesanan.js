/**
 * ItemPesanan: Bagian dari relasi KOMPOSISI di dalam kelas Pesanan.
 * Objek ItemPesanan tidak memiliki identitas independen di luar Pesanan;
 * siklus hidupnya sepenuhnya dikelola oleh Pesanan induknya.
 */
export class ItemPesanan {
    #nama;
    #kuantitas;
    #hargaSatuan;
    constructor(nama, kuantitas, hargaSatuan) {
        if (!nama || nama.trim() === '') {
            throw new Error('Nama item pesanan tidak boleh kosong.');
        }
        if (kuantitas <= 0) {
            throw new Error('Kuantitas item harus lebih besar dari 0.');
        }
        if (hargaSatuan < 0) {
            throw new Error('Harga satuan tidak boleh bernilai negatif.');
        }
        this.#nama = nama.trim();
        this.#kuantitas = Math.floor(kuantitas);
        this.#hargaSatuan = hargaSatuan;
    }
    // --- ENKAPSULASI: Getter ---
    get nama() {
        return this.#nama;
    }
    get kuantitas() {
        return this.#kuantitas;
    }
    get hargaSatuan() {
        return this.#hargaSatuan;
    }
    hitungSubtotal() {
        return this.#kuantitas * this.#hargaSatuan;
    }
    toJSON() {
        return {
            nama: this.#nama,
            kuantitas: this.#kuantitas,
            hargaSatuan: this.#hargaSatuan,
            subtotal: this.hitungSubtotal(),
        };
    }
}
//# sourceMappingURL=ItemPesanan.js.map