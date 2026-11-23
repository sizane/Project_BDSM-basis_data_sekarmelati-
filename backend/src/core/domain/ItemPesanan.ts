/**
 * ItemPesanan: Bagian dari relasi KOMPOSISI di dalam kelas Pesanan.
 * Objek ItemPesanan tidak memiliki identitas independen di luar Pesanan;
 * siklus hidupnya sepenuhnya dikelola oleh Pesanan induknya.
 */
export class ItemPesanan {
  #nama: string;
  #kuantitas: number;
  #hargaSatuan: number;

  constructor(nama: string, kuantitas: number, hargaSatuan: number) {
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
  public get nama(): string {
    return this.#nama;
  }

  public get kuantitas(): number {
    return this.#kuantitas;
  }

  public get hargaSatuan(): number {
    return this.#hargaSatuan;
  }

  public hitungSubtotal(): number {
    return this.#kuantitas * this.#hargaSatuan;
  }

  public toJSON(): Record<string, unknown> {
    return {
      nama: this.#nama,
      kuantitas: this.#kuantitas,
      hargaSatuan: this.#hargaSatuan,
      subtotal: this.hitungSubtotal(),
    };
  }
}

