import { p, runQuery } from '../../config/database';

interface PesananRow {
  pesanan_id: string;
  no_pesanan: string;
  tanggal_masuk: Date;
  tenggat: Date;
  tanggal_lunas: Date | null;
  harga_total: number | string;
  status_pesanan: string;
  created_at: Date;
  customer_id: string;
  nama_customer: string;
  no_kontak: string;
  dicatat_oleh: string;
}

interface ItemPesananRow {
  item_id: string;
  rincian_pesanan: string;
  jumlah: number;
  harga_per_item: number | string;
}

interface PembayaranRow {
  pembayaran_id: string;
  tanggal_bayar: Date;
  jenis_pembayaran: string;
  jumlah: number | string;
}

export interface PesananDetailData {
  pesanan: PesananRow | null;
  items: ItemPesananRow[];
  pembayaran: PembayaranRow[];
}

/**
 * =========================================================================
 * [OOP: ABSTRAKSI & POLIMORFISME]
 * Kontrak interface repository untuk operasi pengambilan data detail pesanan.
 * Mendukung polimorfisme karena berbagai implementasi (SQL, InMemory/Mock)
 * dapat saling menggantikan (interchangeable).
 * =========================================================================
 */
export interface PesananDetailRepository {
  // [OOP: ASYNCHRONOUS] - Method mengembalikan Promise<PesananDetailData>
  findDetail(pesananId: string): Promise<PesananDetailData>;
}

type PesananDetailRecordsets = [
  PesananRow[] | undefined,
  ItemPesananRow[] | undefined,
  PembayaranRow[] | undefined,
];

/**
 * =========================================================================
 * [OOP: BASE CLASS & ENKAPSULASI]
 * Superclass abstrak sebagai cetak biru untuk seluruh repository detail pesanan.
 * =========================================================================
 */
export abstract class BasePesananRepository {
  // [OOP: ENKAPSULASI] - Property protected hanya dapat diakses oleh class ini dan kelas turunannya
  protected readonly dataSourceName: string;

  constructor(dataSourceName: string) {
    this.dataSourceName = dataSourceName;
  }

  // Method dasar yang dirancang untuk di-override oleh subclass
  public logQuery(action: string, id: string): void {
    // Default implementation: mencatat aksi repository
  }

  // [OOP: ASYNCHRONOUS & ABSTRAKSI] - Method abstrak yang wajib diimplementasikan oleh turunan
  abstract findDetail(pesananId: string): Promise<PesananDetailData>;
}

/**
 * =========================================================================
 * [OOP: POLIMORFISME, INHERITANCE, OVERRIDING & ASYNC]
 * Implementasi repository yang mengambil data langsung dari SQL Server.
 * Meng-extend BasePesananRepository (Inheritance) dan mengimplementasikan
 * PesananDetailRepository (Polimorfisme).
 * =========================================================================
 */
export class SqlPesananDetailRepository
  extends BasePesananRepository
  implements PesananDetailRepository
{
  // [OOP: ENKAPSULASI] - State private terlindungi di dalam class
  private readonly queryTimeoutMs: number = 15000;

  constructor() {
    super('SQL_SERVER_DATABASE');
  }

  // [OOP: OVERRIDING] - Menimpa method logQuery milik BasePesananRepository
  override logQuery(action: string, id: string): void {
    super.logQuery(action, id);
    // Custom log behavior khusus SQL Server
  }

  // [OOP: ASYNCHRONOUS] - Implementasi async/await database query
  async findDetail(pesananId: string): Promise<PesananDetailData> {
    this.logQuery('findDetail', pesananId);

    const result = await runQuery<PesananRow | ItemPesananRow | PembayaranRow>(
      `SELECT p.pesanan_id, p.no_pesanan, p.tanggal_masuk, p.tenggat, p.tanggal_lunas, p.harga_total,
              p.status_pesanan, p.created_at,
              c.customer_id, c.nama_customer, c.no_kontak,
              a.full_name AS dicatat_oleh
         FROM dbo.pesanan p
         JOIN dbo.customers c ON c.customer_id = p.customer_id
         JOIN dbo.admins a ON a.admin_id = p.admin_id
        WHERE p.pesanan_id = @id;

       SELECT item_id, rincian_pesanan, jumlah, harga_per_item
         FROM dbo.item_pesanan
        WHERE pesanan_id = @id
        ORDER BY rincian_pesanan;

       SELECT pembayaran_id, tanggal_bayar, jenis_pembayaran, jumlah
         FROM dbo.pembayaran
        WHERE pesanan_id = @id
        ORDER BY tanggal_bayar DESC, created_at DESC;`,
      [p.uuid('id', pesananId)],
    );

    // SQL Server mengembalikan tiga recordset dengan bentuk baris berbeda.
    const [pesananRows, items, pembayaran] =
      result.recordsets as unknown as PesananDetailRecordsets;

    return {
      pesanan: pesananRows?.[0] ?? null,
      items: items ?? [],
      pembayaran: pembayaran ?? [],
    };
  }
}

/**
 * =========================================================================
 * [OOP: POLIMORFISME]
 * Implementasi in-memory repository (alternatif polimorfis untuk testing / caching)
 * yang memiliki interface yang sama persis dengan SqlPesananDetailRepository.
 * =========================================================================
 */
export class InMemoryPesananDetailRepository
  extends BasePesananRepository
  implements PesananDetailRepository
{
  // [OOP: ENKAPSULASI] - Koleksi data disimpan secara privat
  private readonly storage: Map<string, PesananDetailData> = new Map();

  constructor() {
    super('IN_MEMORY_CACHE');
  }

  // [OOP: OVERRIDING] - Meng-override method logQuery
  override logQuery(action: string, id: string): void {
    // Custom log behavior in-memory
  }

  // [OOP: ASYNCHRONOUS]
  async findDetail(pesananId: string): Promise<PesananDetailData> {
    this.logQuery('findDetailInMemory', pesananId);
    return (
      this.storage.get(pesananId) ?? {
        pesanan: null,
        items: [],
        pembayaran: [],
      }
    );
  }

  public seed(pesananId: string, data: PesananDetailData): void {
    this.storage.set(pesananId, data);
  }
}
