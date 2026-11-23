import { p, runProc, runQuery, sql, type SqlParam } from '../../config/database';
import { AppError, ERRORS, type ErrorDef } from '../../constants/error-codes';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate, todayWIB, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import { MAX_RUPIAH } from '../../middlewares/validate';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';
import { AuditService, auditServiceInstance } from '../audit-log/audit.service';
import { SessionContext } from '../../middlewares/session-context';

// ===========================================================================
// 1. DOMAIN CLASSES (OOP: ENKAPSULASI, POLIMORFISME, OVERRIDING, KOMPOSISI)
// ===========================================================================

/**
 * Transaksi: Kelas dasar abstrak untuk semua transaksi finansial.
 * - ENKAPSULASI: Properti privat (#id, #nominal, #tanggal, #keterangan) dengan getter & setter.
 * - POLIMORFISME: Mendefinisikan method abstrak hitungTotal() dan getJenisTransaksi().
 */
export abstract class Transaksi {
  #id: string;
  #nominal: number;
  #tanggal: Date;
  #keterangan: string;

  constructor(id: string, nominal: number, tanggal: Date, keterangan: string = '') {
    if (!id || id.trim() === '') throw new Error('ID transaksi tidak boleh kosong.');
    if (nominal < 0) throw new Error('Nominal transaksi tidak boleh negatif.');
    this.#id = id.trim();
    this.#nominal = nominal;
    this.#tanggal = tanggal;
    this.#keterangan = keterangan;
  }

  public get id(): string {
    return this.#id;
  }

  public get nominal(): number {
    return this.#nominal;
  }

  protected set nominal(val: number) {
    if (val < 0) throw new Error('Nominal transaksi tidak boleh negatif.');
    this.#nominal = val;
  }

  public get tanggal(): Date {
    return new Date(this.#tanggal.getTime());
  }

  public get keterangan(): string {
    return this.#keterangan;
  }

  public set keterangan(val: string) {
    this.#keterangan = val;
  }

  // --- POLIMORFISME: Method abstrak yang wajib di-OVERRIDE oleh subclass ---
  public abstract hitungTotal(): number;
  public abstract getJenisTransaksi(): string;

  public toJSON(): Record<string, unknown> {
    return {
      id: this.#id,
      nominal: this.#nominal,
      tanggal: this.#tanggal.toISOString(),
      keterangan: this.#keterangan,
      jenis: this.getJenisTransaksi(),
      total: this.hitungTotal(),
    };
  }
}

/**
 * ItemPesanan: Bagian dari relasi KOMPOSISI di dalam kelas Pesanan.
 * - KOMPOSISI (Strong "has-a"): Objek ItemPesanan dikelola seutuhnya oleh Pesanan induk.
 * - ENKAPSULASI: Properti privat (#nama, #kuantitas, #hargaSatuan) dengan validasi.
 */
export class ItemPesanan {
  #nama: string;
  #kuantitas: number;
  #hargaSatuan: number;

  constructor(nama: string, kuantitas: number, hargaSatuan: number) {
    if (!nama || nama.trim() === '') throw new Error('Nama item pesanan tidak boleh kosong.');
    if (kuantitas <= 0) throw new Error('Kuantitas item harus lebih besar dari 0.');
    if (hargaSatuan < 0) throw new Error('Harga satuan tidak boleh bernilai negatif.');
    this.#nama = nama.trim();
    this.#kuantitas = Math.floor(kuantitas);
    this.#hargaSatuan = hargaSatuan;
  }

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

/**
 * Pesanan: Subclass dari Transaksi.
 * - ENKAPSULASI: Properti privat (#noPesanan, #namaCustomer, dll.) dengan akses terkontrol.
 * - KOMPOSISI: Memiliki array ItemPesanan yang dibuat dan dikontrol secara internal (Strong Has-A).
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 * - POLIMORFISME: Wujud konkret polimorfik dari kelas Transaksi.
 */
export class Pesanan extends Transaksi {
  #noPesanan: string;
  #namaCustomer: string;
  #noKontak: string;
  #statusPesanan: string;
  #tenggat: Date;
  #totalTerbayar: number;
  // --- KOMPOSISI (Composition): Siklus hidup ItemPesanan terikat erat pada Pesanan ---
  #items: ItemPesanan[] = [];

  constructor(
    id: string,
    noPesanan: string,
    namaCustomer: string,
    noKontak: string,
    hargaTotal: number,
    tanggalMasuk: Date,
    tenggat: Date,
    statusPesanan: string = 'Antrian',
    totalTerbayar: number = 0,
    keterangan: string = '',
  ) {
    super(id, hargaTotal, tanggalMasuk, keterangan);
    this.#noPesanan = noPesanan;
    this.#namaCustomer = namaCustomer;
    this.#noKontak = noKontak;
    this.#statusPesanan = statusPesanan;
    this.#tenggat = tenggat;
    this.#totalTerbayar = totalTerbayar;
  }

  // --- KOMPOSISI: Item dibuat secara internal di dalam Pesanan ---
  public tambahItem(nama: string, kuantitas: number, hargaSatuan: number): ItemPesanan {
    const item = new ItemPesanan(nama, kuantitas, hargaSatuan);
    this.#items.push(item);
    return item;
  }

  public get items(): ReadonlyArray<ItemPesanan> {
    return [...this.#items];
  }

  public get noPesanan(): string {
    return this.#noPesanan;
  }

  public get namaCustomer(): string {
    return this.#namaCustomer;
  }

  public get noKontak(): string {
    return this.#noKontak;
  }

  public get statusPesanan(): string {
    return this.#statusPesanan;
  }

  public set statusPesanan(status: string) {
    this.#statusPesanan = status;
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
    if (nominal <= 0) throw new Error('Nominal pembayaran harus lebih besar dari 0.');
    if (this.#totalTerbayar + nominal > this.hitungTotal()) {
      throw new Error('Jumlah pembayaran melebihi total tagihan.');
    }
    this.#totalTerbayar += nominal;
  }

  // --- OVERRIDING: Meng-override hitungTotal dari Transaksi (POLIMORFISME) ---
  public override hitungTotal(): number {
    if (this.#items.length > 0) {
      return this.#items.reduce((sum, item) => sum + item.hitungSubtotal(), 0);
    }
    return this.nominal;
  }

  // --- OVERRIDING: Meng-override getJenisTransaksi ---
  public override getJenisTransaksi(): string {
    return 'PEMASUKAN_PESANAN';
  }

  // --- OVERRIDING: Meng-override toJSON ---
  public override toJSON(): Record<string, unknown> {
    const base = super.toJSON();
    return {
      ...base,
      noPesanan: this.#noPesanan,
      namaCustomer: this.#namaCustomer,
      noKontak: this.#noKontak,
      statusPesanan: this.#statusPesanan,
      tenggat: this.#tenggat.toISOString(),
      totalTerbayar: this.#totalTerbayar,
      sisaPiutang: this.sisaPiutang,
      items: this.#items.map((i) => i.toJSON()),
    };
  }
}

// ===========================================================================
// 2. SERVICE CLASS (OOP: AGREGASI, ASOSIASI, OVERLOADING, ASYNC)
// ===========================================================================

interface RingkasanRow {
  pesanan_id: string;
  no_pesanan: string;
  nama_customer: string;
  tanggal_masuk: Date;
  tenggat: Date;
  harga_total: number;
  total_paid: number;
  remaining_debt: number;
  status_pesanan: string;
}

interface CatatPesananRow {
  result: string;
  pesanan_id: string;
  no_pesanan: string;
  harga_total: number;
  sisa_piutang: number;
  status_pesanan: string;
}

const PESANAN_RESULT_MAP: Record<string, ErrorDef> = {
  ERR_DUE_DATE: ERRORS.VAL_DUE_DATE,
  ERR_DP_EXCEEDS: ERRORS.VAL_DP_EXCEEDS,
  ERR_QTY: ERRORS.VAL_QTY,
  ERR_NEGATIVE: ERRORS.VAL_NEGATIVE,
  ERR_TOO_LARGE: ERRORS.VAL_TOO_LARGE,
};

/**
 * PesananService: Layanan bisnis berbasis OOP untuk modul Pesanan.
 * - AGREGASI (Aggregation): Menerima AuditService via konstruktor / Dependency Injection.
 * - ASOSIASI (Association): Method menggunakan objek SessionContext untuk pencatatan audit.
 * - OVERLOADING: Method cariPesanan() mendukung ID tunggal ATAU query filter.
 * - ASYNC: Semua operasi database berjalan asynchronous dengan async/await.
 */
export class PesananService {
  // --- AGREGASI: Menyimpan referensi AuditService yang di-inject dari luar ---
  private readonly audit: AuditService;

  constructor(audit?: AuditService) {
    this.audit = audit ?? auditServiceInstance;
  }

  // --- OVERLOADING (Signature 1 & 2): Cari pesanan berdasarkan ID atau berdasarkan Query Filter ---
  public async cariPesanan(id: string): Promise<Pesanan | null>;
  public async cariPesanan(query: ListPesananQuery): Promise<{ data: unknown[]; meta: PaginationMeta }>;
  // Implementasi tunggal untuk overloading di atas
  public async cariPesanan(
    arg: string | ListPesananQuery,
  ): Promise<Pesanan | null | { data: unknown[]; meta: PaginationMeta }> {
    if (typeof arg === 'string') {
      return await this.getPesananModelById(arg);
    }
    return await this.listPesanan(arg);
  }

  // --- ASYNC: Mengambil daftar ringkasan pesanan ---
  public async listPesanan(query: ListPesananQuery): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const where: string[] = [];
    const params: SqlParam[] = [];

    if (query.search) {
      where.push(`(nama_customer LIKE @search ESCAPE '!' OR no_pesanan LIKE @search ESCAPE '!')`);
      params.push(p.varchar('search', `%${escapeLike(query.search)}%`, 110));
    }
    if (query.status_pesanan) {
      where.push('status_pesanan = @status');
      params.push(p.varchar('status', query.status_pesanan, 20));
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const count = await runQuery<{ total: number }>(
      `SELECT COUNT(*) AS total FROM dbo.v_ringkasan_pesanan ${whereSql}`,
      params,
    );
    const rows = await runQuery<RingkasanRow>(
      `SELECT pesanan_id, no_pesanan, nama_customer, tanggal_masuk, tenggat,
              harga_total, total_paid, remaining_debt, status_pesanan
         FROM dbo.v_ringkasan_pesanan
         ${whereSql}
        ORDER BY tanggal_masuk DESC, no_pesanan DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [...params, p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)],
    );

    return {
      data: rows.recordset.map((r) => ({
        pesanan_id: r.pesanan_id,
        no_pesanan: r.no_pesanan,
        nama_customer: r.nama_customer,
        tanggal_masuk: formatSqlDate(r.tanggal_masuk),
        tenggat: formatSqlDate(r.tenggat),
        harga_total: Number(r.harga_total),
        total_paid: Number(r.total_paid),
        remaining_debt: Number(r.remaining_debt),
        status_pesanan: r.status_pesanan,
      })),
      meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
    };
  }

  // --- KOMPOSISI & ENKAPSULASI: Membentuk objek domain Pesanan beserta ItemPesanan-nya ---
  public async getPesananModelById(id: string): Promise<Pesanan | null> {
    const res = await runQuery<any>(
      `SELECT pesanan_id, no_pesanan, nama_customer, no_kontak, tanggal_masuk, tenggat,
              harga_total, total_paid, remaining_debt, status_pesanan, status_pembayaran, catatan
         FROM dbo.pesanan
        WHERE pesanan_id = @id`,
      [p.uuid('id', id)],
    );
    const row = res.recordset?.[0];
    if (!row) return null;

    const pesanan = new Pesanan(
      row.pesanan_id,
      row.no_pesanan,
      row.nama_customer,
      row.no_kontak,
      Number(row.harga_total),
      row.tanggal_masuk,
      row.tenggat,
      row.status_pesanan,
      Number(row.total_paid),
      row.catatan ?? '',
    );

    const itemRes = await runQuery<any>(
      `SELECT detail_id, rincian_pesanan, kuantitas, harga_per_item, subtotal
         FROM dbo.detail_pesanan
        WHERE pesanan_id = @id`,
      [p.uuid('id', id)],
    );

    for (const it of itemRes.recordset ?? []) {
      pesanan.tambahItem(it.rincian_pesanan, it.kuantitas, Number(it.harga_per_item));
    }

    return pesanan;
  }

  public async getPesananDetail(pesananId: string) {
    const result = await runQuery(
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

    const sets = result.recordsets as unknown as Array<Array<Record<string, any>>>;
    const pesanan = sets[0]?.[0];
    if (!pesanan) throw new AppError(ERRORS.NOT_FOUND_PESANAN);

    const items = sets[1] ?? [];
    const pembayaran = sets[2] ?? [];
    const totalDibayar = pembayaran.reduce((sum, r) => sum + Number(r.jumlah), 0);
    const hargaTotal = Number(pesanan.harga_total);

    return {
      pesanan_id: pesanan.pesanan_id,
      no_pesanan: pesanan.no_pesanan,
      tanggal_masuk: formatSqlDate(pesanan.tanggal_masuk),
      tenggat: formatSqlDate(pesanan.tenggat),
      tanggal_lunas: formatSqlDate(pesanan.tanggal_lunas),
      nama_customer: pesanan.nama_customer,
      customer: {
        customer_id: pesanan.customer_id,
        nama_customer: pesanan.nama_customer,
        no_kontak: pesanan.no_kontak,
      },
      dicatat_oleh: pesanan.dicatat_oleh,
      items: items.map((i) => ({
        item_id: i.item_id,
        rincian_pesanan: i.rincian_pesanan,
        kuantitas: i.jumlah,
        harga_per_item: Number(i.harga_per_item),
        subtotal: i.jumlah * Number(i.harga_per_item),
      })),
      harga_total: hargaTotal,
      total_dibayar: totalDibayar,
      sisa_piutang: Math.max(0, hargaTotal - totalDibayar),
      status_pesanan: pesanan.status_pesanan,
      riwayat_pembayaran: pembayaran.map((b) => ({
        pembayaran_id: b.pembayaran_id,
        tanggal_bayar: formatSqlDate(b.tanggal_bayar),
        jenis_pembayaran: b.jenis_pembayaran,
        jumlah: Number(b.jumlah),
      })),
    };
  }

  // --- ASOSIASI: Menggunakan SessionContext (atau fallback adminId & ip) ---
  public async createPesanan(
    body: CreatePesananBody,
    sessionOrAdminId: SessionContext | string,
    ipFallback?: string,
  ) {
    const item = body.items[0];
    if (!item) throw new AppError(ERRORS.VAL_REQUIRED);
    const total = item.kuantitas * item.harga_per_item;

    if (total > MAX_RUPIAH) throw new AppError(ERRORS.VAL_TOO_LARGE);
    if (body.dp > total) throw new AppError(ERRORS.VAL_DP_EXCEEDS);
    if (body.tenggat < todayWIB()) throw new AppError(ERRORS.VAL_DUE_DATE);

    let adminId: string;
    let ip: string;
    let sessionCtx: SessionContext | undefined;

    if (sessionOrAdminId instanceof SessionContext) {
      sessionCtx = sessionOrAdminId;
      adminId = sessionOrAdminId.adminId ?? '00000000-0000-0000-0000-000000000000';
      ip = sessionOrAdminId.ipAddress;
    } else {
      adminId = sessionOrAdminId;
      ip = ipFallback ?? '127.0.0.1';
    }

    const result = await runProc<CatatPesananRow>('sp_catat_pesanan_baru', [
      p.uuid('admin_id', adminId),
      p.varchar('nama_customer', body.nama_customer, 100),
      p.varchar('no_kontak', body.no_kontak, 20),
      p.varchar('rincian_pesanan', item.rincian_pesanan, 200),
      p.int('kuantitas', item.kuantitas),
      p.decimal('harga_per_item', item.harga_per_item),
      p.decimal('dp', body.dp),
      p.date('tenggat', toSqlDate(body.tenggat)),
      p.varchar('ip_address', ip, 45),
    ]);

    const row = result.recordset?.[0];
    if (!row) throw new AppError(ERRORS.SYS_DATABASE);
    if (row.result !== 'SUCCESS') throw new AppError(PESANAN_RESULT_MAP[row.result] ?? ERRORS.SYS_DATABASE);

    if (sessionCtx) {
      await this.audit.catat(
        'Tambah',
        'pesanan',
        row.pesanan_id,
        `Membuat pesanan baru ${row.no_pesanan} untuk customer ${body.nama_customer}`,
        sessionCtx,
      );
    }

    return {
      pesanan_id: row.pesanan_id,
      no_pesanan: row.no_pesanan,
      harga_total: Number(row.harga_total),
      sisa_piutang: Number(row.sisa_piutang),
      status_pesanan: row.status_pesanan,
    };
  }

  // --- ASOSIASI: Catat pembayaran menggunakan SessionContext ---
  public async catatPembayaran(
    pesananId: string,
    body: CatatPembayaranBody,
    sessionOrAdminId: SessionContext | string,
    ipFallback?: string,
  ) {
    let adminId: string;
    let ip: string;
    let sessionCtx: SessionContext | undefined;

    if (sessionOrAdminId instanceof SessionContext) {
      sessionCtx = sessionOrAdminId;
      adminId = sessionOrAdminId.adminId ?? '00000000-0000-0000-0000-000000000000';
      ip = sessionOrAdminId.ipAddress;
    } else {
      adminId = sessionOrAdminId;
      ip = ipFallback ?? '127.0.0.1';
    }

    const result = await runProc(
      'sp_catat_pembayaran',
      [
        p.uuid('pesanan_id', pesananId),
        p.uuid('admin_id', adminId),
        p.date('tanggal_bayar', toSqlDate(body.tanggal_bayar)),
        p.decimal('jumlah', body.jumlah),
        p.varchar('jenis_pembayaran', body.jenis_pembayaran, 20),
        p.varchar('ip_address', ip, 45),
      ],
      [
        { name: 'result', type: sql.VarChar(30) },
        { name: 'pembayaran_id', type: sql.UniqueIdentifier },
        { name: 'sisa_piutang_baru', type: sql.Decimal(12, 2) },
        { name: 'status_pesanan', type: sql.VarChar(20) },
      ],
    );

    const out = result.output as {
      result?: string;
      pembayaran_id?: string;
      sisa_piutang_baru?: number;
      status_pesanan?: string;
    };

    if (!out.result) throw new AppError(ERRORS.SYS_DATABASE);
    if (out.result === 'ERR_NOT_FOUND') throw new AppError(ERRORS.NOT_FOUND_PESANAN);
    if (out.result === 'ERR_OVERPAYMENT') throw new AppError(ERRORS.VAL_OVERPAYMENT);
    if (out.result === 'ERR_NOMINAL') throw new AppError(ERRORS.VAL_NOMINAL);
    if (out.result !== 'SUCCESS') throw new AppError(ERRORS.SYS_DATABASE);

    if (sessionCtx) {
      await this.audit.catat(
        'Tambah',
        'pembayaran',
        pesananId,
        `Mencatat pembayaran senilai Rp ${body.jumlah.toLocaleString('id-ID')}`,
        sessionCtx,
      );
    }

    return {
      pembayaran_id: out.pembayaran_id!,
      sisa_piutang_baru: Number(out.sisa_piutang_baru ?? 0),
      status_pesanan: out.status_pesanan!,
    };
  }
}

export const pesananService = new PesananService();

// Export fungsi standalone untuk kompatibilitas penuh
export const listPesanan = (query: ListPesananQuery) => pesananService.listPesanan(query);
export const getPesananDetail = (id: string) => pesananService.getPesananDetail(id);
export const createPesanan = (body: CreatePesananBody, sessionOrAdminId: SessionContext | string, ip?: string) =>
  pesananService.createPesanan(body, sessionOrAdminId, ip);
export const catatPembayaran = (
  pesananId: string,
  body: CatatPembayaranBody,
  sessionOrAdminId: SessionContext | string,
  ip?: string,
) => pesananService.catatPembayaran(pesananId, body, sessionOrAdminId, ip);
