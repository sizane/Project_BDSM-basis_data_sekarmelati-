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
  #noPesanan: string;
  #namaCustomer: string;
  #noHpCustomer: string;
  #statusPesanan: 'Antrian' | 'Dikerjakan' | 'Selesai' | 'Batal';
  #tenggat: Date;
  #totalTerbayar: number;
  // --- KOMPOSISI (Composition): Siklus hidup ItemPesanan terikat erat pada Pesanan ---
  #items: ItemPesanan[] = [];

  constructor(
    id: string,
    noPesanan: string,
    namaCustomer: string,
    noHpCustomer: string,
    hargaTotal: number,
    tanggalMasuk: Date,
    tenggat: Date,
    statusPesanan: 'Antrian' | 'Dikerjakan' | 'Selesai' | 'Batal' = 'Antrian',
    totalTerbayar: number = 0,
    keterangan: string = '',
    createdAt?: Date,
  ) {
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
  public tambahItem(nama: string, kuantitas: number, hargaSatuan: number): ItemPesanan {
    const item = new ItemPesanan(nama, kuantitas, hargaSatuan);
    this.#items.push(item);
    this.touch();
    return item;
  }

  public get items(): ReadonlyArray<ItemPesanan> {
    return [...this.#items];
  }

  // --- ENKAPSULASI: Getters & Setters ---
  public get noPesanan(): string {
    return this.#noPesanan;
  }

  public get namaCustomer(): string {
    return this.#namaCustomer;
  }

  public get noHpCustomer(): string {
    return this.#noHpCustomer;
  }

  public get statusPesanan(): string {
    return this.#statusPesanan;
  }

  public set statusPesanan(status: 'Antrian' | 'Dikerjakan' | 'Selesai' | 'Batal') {
    this.#statusPesanan = status;
    this.touch();
  }

  public get tenggat(): Date {
    return new Date(this.#tenggat.getTime());
  }

  public get totalTerbayar(): number {
    return this.#totalTerbayar;
  }

  public get sisaPiutang(): number {
    const sisa = this.hitungTotal() - this.#totalTerbayar;
    return sisa > 0 ? sisa : 0;
  }

  public catatPembayaran(nominal: number): void {
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
  public override hitungTotal(): number {
    if (this.#items.length > 0) {
      return this.#items.reduce((sum, item) => sum + item.hitungSubtotal(), 0);
    }
    return this.nominal;
  }

  // --- OVERRIDING: Meng-override getJenisTransaksi dari Transaksi ---
  public override getJenisTransaksi(): string {
    return 'PEMASUKAN_PESANAN';
  }

  // --- OVERRIDING: Meng-override toJSON dari Transaksi ---
  public override toJSON(): Record<string, unknown> {
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

