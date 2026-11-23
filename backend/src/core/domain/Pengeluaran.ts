import { Transaksi } from './Transaksi';

/**
 * Pengeluaran: Subclass lain dari Transaksi (POLIMORFISME).
 * Memenuhi kriteria:
 * - POLIMORFISME: Merupakan wujud konkret polimorfik lain dari Transaksi selain Pesanan.
 * - ENKAPSULASI: Properti privat (#kategori, #penanggungJawab) dengan getter/setter.
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 */
export class Pengeluaran extends Transaksi {
  #kategori: 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain';
  #penanggungJawab: string;

  constructor(
    id: string,
    nominal: number,
    tanggal: Date,
    kategori: 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain',
    penanggungJawab: string,
    keterangan: string = '',
    createdAt?: Date,
  ) {
    super(id, nominal, tanggal, keterangan, createdAt);
    if (!penanggungJawab || penanggungJawab.trim() === '') {
      throw new Error('Penanggung jawab wajib diisi.');
    }
    this.#kategori = kategori;
    this.#penanggungJawab = penanggungJawab.trim();
  }

  // --- ENKAPSULASI: Getters & Setters ---
  public get kategori(): 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain' {
    return this.#kategori;
  }

  public set kategori(k: 'Bahan Baku' | 'Upah Jahit' | 'Listrik' | 'Lain-lain') {
    this.#kategori = k;
    this.touch();
  }

  public get penanggungJawab(): string {
    return this.#penanggungJawab;
  }

  public set penanggungJawab(pj: string) {
    if (!pj || pj.trim() === '') {
      throw new Error('Penanggung jawab wajib diisi.');
    }
    this.#penanggungJawab = pj.trim();
    this.touch();
  }

  // --- OVERRIDING: Meng-override method hitungTotal (POLIMORFISME) ---
  public override hitungTotal(): number {
    // Pengeluaran dihitung sebagai nilai nominal operasional murni
    return this.nominal;
  }

  // --- OVERRIDING: Meng-override getJenisTransaksi ---
  public override getJenisTransaksi(): string {
    return 'PENGELUARAN_OPERASIONAL';
  }

  // --- OVERRIDING: Meng-override toJSON ---
  public override toJSON(): Record<string, unknown> {
    const base = super.toJSON();
    return {
      ...base,
      kategori: this.#kategori,
      penanggungJawab: this.#penanggungJawab,
    };
  }
}

