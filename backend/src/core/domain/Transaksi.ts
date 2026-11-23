import { BaseEntity } from './BaseEntity';

/**
 * Transaksi: Kelas abstrak turunan dari BaseEntity yang menjadi basis
 * untuk konsep POLIMORFISME pada transaksi finansial (Pesanan dan Pengeluaran).
 */
export abstract class Transaksi extends BaseEntity {
  #nominal: number;
  #tanggal: Date;
  #keterangan: string;

  constructor(id: string, nominal: number, tanggal: Date, keterangan: string = '', createdAt?: Date) {
    super(id, createdAt);
    if (nominal < 0) {
      throw new Error('Nominal transaksi tidak boleh negatif.');
    }
    this.#nominal = nominal;
    this.#tanggal = tanggal;
    this.#keterangan = keterangan;
  }

  // --- ENKAPSULASI: Getter & Setter ---
  public get nominal(): number {
    return this.#nominal;
  }

  protected set nominal(val: number) {
    if (val < 0) {
      throw new Error('Nominal transaksi tidak boleh negatif.');
    }
    this.#nominal = val;
    this.touch();
  }

  public get tanggal(): Date {
    return new Date(this.#tanggal.getTime());
  }

  public get keterangan(): string {
    return this.#keterangan;
  }

  public set keterangan(val: string) {
    this.#keterangan = val;
    this.touch();
  }

  // --- POLIMORFISME: Method abstrak yang akan di-OVERRIDE secara spesifik oleh subclass ---
  public abstract hitungTotal(): number;
  public abstract getJenisTransaksi(): string;

  // --- OVERRIDING: Meng-override method toJSON dari BaseEntity ---
  public override toJSON(): Record<string, unknown> {
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

