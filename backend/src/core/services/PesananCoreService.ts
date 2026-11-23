import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { AuditService } from './AuditService';
import { Pesanan } from '../domain/Pesanan';
import { SessionContext } from '../domain/SessionContext';
import { AppError, ERRORS, type ErrorDef } from '../../constants/error-codes';
import { p, sql, type SqlParam } from '../../config/database';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate, todayWIB, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from '../../modules/pesanan/pesanan.schema';

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

interface DetailRow {
  pesanan_id: string;
  no_pesanan: string;
  nama_customer: string;
  no_kontak: string;
  tanggal_masuk: Date;
  tenggat: Date;
  harga_total: number;
  total_paid: number;
  remaining_debt: number;
  status_pesanan: 'Antrian' | 'Dikerjakan' | 'Selesai' | 'Batal';
  status_pembayaran: string;
  catatan: string | null;
}

interface ItemRow {
  detail_id: string;
  rincian_pesanan: string;
  kuantitas: number;
  harga_per_item: number;
  subtotal: number;
}

/**
 * PesananCoreService: Layanan bisnis berbasis OOP untuk domain Pesanan.
 * Memenuhi kriteria:
 * - AGREGASI (Aggregation): Menerima DatabaseService dan AuditService melalui konstruktor.
 * - ASOSIASI (Association): Method menggunakan objek SessionContext untuk pencatatan jejak audit.
 * - OVERLOADING: Method cariPesanan() mendukung pemanggilan via ID tunggal ATAU query pencarian.
 * - KOMPOSISI (Composition): Mengonstruksi objek Pesanan dan menambahkan ItemPesanan di dalamnya.
 * - OVERRIDING: Meng-override method getServiceName() dari BaseService.
 * - ASYNC: Semua operasi database berjalan asynchronous dengan async/await.
 */
export class PesananCoreService extends BaseService {
  private static instance: PesananCoreService | null = null;

  public static getInstance(): PesananCoreService {
    if (!PesananCoreService.instance) {
      PesananCoreService.instance = new PesananCoreService();
    }
    return PesananCoreService.instance;
  }

  // --- AGREGASI: Objek AuditService di-injeksi dan disimpan sebagai atribut ---
  private readonly audit: AuditService;

  constructor(db?: DatabaseService, audit?: AuditService) {
    super(db);
    this.audit = audit ?? new AuditService(this.db);
  }

  // --- OVERRIDING: Meng-override method getServiceName dari BaseService ---
  public override getServiceName(): string {
    return 'PesananCoreService';
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

  // --- ASYNC: Pengambilan daftar pesanan secara asynchronous ---
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

    const count = await this.db.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM dbo.v_ringkasan_pesanan ${whereSql}`,
      params,
    );
    const rows = await this.db.query<RingkasanRow>(
      `SELECT pesanan_id, no_pesanan, nama_customer, tanggal_masuk, tenggat,
              harga_total, total_paid, remaining_debt, status_pesanan
         FROM dbo.v_ringkasan_pesanan
         ${whereSql}
        ORDER BY tanggal_masuk DESC, no_pesanan DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [
        ...params,
        p.int('offset', offsetOf(query.page, query.per_page)),
        p.int('limit', query.per_page),
      ],
    );

    const total = count[0]?.total ?? 0;
    const data = rows.map((r) => ({
      pesanan_id: r.pesanan_id,
      no_pesanan: r.no_pesanan,
      nama_customer: r.nama_customer,
      tanggal_masuk: formatSqlDate(r.tanggal_masuk),
      tenggat: formatSqlDate(r.tenggat),
      harga_total: Number(r.harga_total),
      total_paid: Number(r.total_paid),
      remaining_debt: Number(r.remaining_debt),
      status_pesanan: r.status_pesanan,
    }));

    return { data, meta: buildMeta(query.page, query.per_page, total) };
  }

  // --- KOMPOSISI & ENKAPSULASI: Membentuk objek domain Pesanan beserta ItemPesanan-nya ---
  public async getPesananModelById(id: string): Promise<Pesanan | null> {
    const header = await this.db.query<DetailRow>(
      `SELECT pesanan_id, no_pesanan, nama_customer, no_kontak, tanggal_masuk, tenggat,
              harga_total, total_paid, remaining_debt, status_pesanan, status_pembayaran, catatan
         FROM dbo.pesanan
        WHERE pesanan_id = @id`,
      [p.uuid('id', id)],
    );
    if (!header.length) return null;

    const row = header[0];
    if (!row) return null;
    // Buat objek Pesanan (Enkapsulasi)
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

    // Ambil rincian item pesanan
    const items = await this.db.query<ItemRow>(
      `SELECT detail_id, rincian_pesanan, kuantitas, harga_per_item, subtotal
         FROM dbo.detail_pesanan
        WHERE pesanan_id = @id`,
      [p.uuid('id', id)],
    );

    // KOMPOSISI: Tambahkan item ke dalam pesanan
    for (const it of items) {
      pesanan.tambahItem(it.rincian_pesanan, it.kuantitas, Number(it.harga_per_item));
    }

    return pesanan;
  }

  public async getPesananDetail(pesananId: string) {
    const pesanan = await this.getPesananModelById(pesananId);
    if (!pesanan) throw new AppError(ERRORS.NOT_FOUND_PESANAN);

    const rows = await this.db.query<any>(
      `SELECT p.pesanan_id, p.no_pesanan, p.tanggal_masuk, p.tenggat, p.tanggal_lunas, p.harga_total,
              p.status_pesanan, p.created_at,
              c.customer_id, c.nama_customer, c.no_kontak,
              a.full_name AS dicatat_oleh
         FROM dbo.pesanan p
         JOIN dbo.customers c ON c.customer_id = p.customer_id
         JOIN dbo.admins a ON a.admin_id = p.admin_id
        WHERE p.pesanan_id = @id`,
      [p.uuid('id', pesananId)],
    );

    const header = rows[0];
    const items = pesanan.items;

    const pembayaran = await this.db.query<any>(
      `SELECT pembayaran_id, tanggal_bayar, jenis_pembayaran, jumlah
         FROM dbo.pembayaran
        WHERE pesanan_id = @id
        ORDER BY tanggal_bayar DESC, created_at DESC`,
      [p.uuid('id', pesananId)],
    );

    const totalDibayar = pembayaran.reduce((sum: number, r: any) => sum + Number(r.jumlah), 0);
    const hargaTotal = pesanan.hitungTotal(); // POLIMORFISME method call

    return {
      pesanan_id: pesanan.id,
      no_pesanan: pesanan.noPesanan,
      tanggal_masuk: formatSqlDate(pesanan.tanggal),
      tenggat: formatSqlDate(pesanan.tenggat),
      tanggal_lunas: header ? formatSqlDate(header.tanggal_lunas) : null,
      nama_customer: pesanan.namaCustomer,
      customer: {
        customer_id: header?.customer_id,
        nama_customer: pesanan.namaCustomer,
        no_kontak: pesanan.noHpCustomer,
      },
      dicatat_oleh: header?.dicatat_oleh ?? '-',
      items: items.map((i) => ({
        rincian_pesanan: i.nama,
        kuantitas: i.kuantitas,
        harga_per_item: i.hargaSatuan,
        subtotal: i.hitungSubtotal(),
      })),
      harga_total: hargaTotal,
      total_dibayar: totalDibayar,
      sisa_piutang: Math.max(0, hargaTotal - totalDibayar),
      status_pesanan: pesanan.statusPesanan,
      riwayat_pembayaran: pembayaran.map((b: any) => ({
        pembayaran_id: b.pembayaran_id,
        tanggal_bayar: formatSqlDate(b.tanggal_bayar),
        jenis_pembayaran: b.jenis_pembayaran,
        jumlah: Number(b.jumlah),
      })),
    };
  }

  // --- ASOSIASI: Menggunakan SessionContext untuk konteks audit dan database ---
  public async createPesanan(
    body: CreatePesananBody,
    session: SessionContext,
  ): Promise<{ pesanan_id: string; no_pesanan: string; tanggal_masuk: string; harga_total: number; sisa_piutang: number }> {
    const item = body.items[0];
    if (!item) {
      throw new AppError(ERRORS.VAL_REQUIRED);
    }
    const hargaTotal = item.kuantitas * item.harga_per_item;
    const dp = body.dp ?? 0;

    if (dp > hargaTotal) {
      throw new AppError(ERRORS.VAL_DP_EXCEEDS);
    }
    const today = todayWIB();
    const tenggat = toSqlDate(body.tenggat);
    if (body.tenggat < today) {
      throw new AppError(ERRORS.VAL_DUE_DATE);
    }

    const adminId = session.adminId ?? '00000000-0000-0000-0000-000000000000';
    const rows = await this.db.proc<{ pesanan_id: string; no_pesanan: string }>(
      'sp_catat_pesanan_baru',
      [
        p.uuid('admin_id', adminId),
        p.varchar('nama_customer', body.nama_customer, 100),
        p.varchar('no_kontak', body.no_kontak, 20),
        p.varchar('rincian_pesanan', item.rincian_pesanan, 200),
        p.int('kuantitas', item.kuantitas),
        p.decimal('harga_per_item', item.harga_per_item),
        p.decimal('dp', dp),
        p.date('tenggat', tenggat),
        p.varchar('ip_address', session.ipAddress, 45),
      ],
      session,
    );

    const created = rows[0];
    if (!created) {
      throw new AppError(ERRORS.SYS_DATABASE);
    }
    const sisa = Math.max(0, hargaTotal - dp);

    // ASOSIASI: Catat audit melalui AuditService yang di-agregasikan
    await this.audit.catat(
      'Tambah',
      'pesanan',
      created.pesanan_id,
      `Membuat pesanan baru ${created.no_pesanan} untuk customer ${body.nama_customer}`,
      session,
    );

    return {
      pesanan_id: created.pesanan_id,
      no_pesanan: created.no_pesanan,
      tanggal_masuk: formatSqlDate(today) ?? today,
      harga_total: hargaTotal,
      sisa_piutang: sisa,
    };
  }

  // --- ASOSIASI: Pembayaran pesanan menggunakan SessionContext ---
  public async catatPembayaran(
    pesananId: string,
    body: CatatPembayaranBody,
    session: SessionContext,
  ): Promise<{ status_pembayaran: string; remaining_debt: number }> {
    const adminId = session.adminId ?? '00000000-0000-0000-0000-000000000000';
    const rows = await this.db.proc<{ status_pembayaran: string; remaining_debt: number }>(
      'sp_catat_pembayaran',
      [
        p.uuid('pesanan_id', pesananId),
        p.uuid('admin_id', adminId),
        p.date('tanggal_bayar', toSqlDate(body.tanggal_bayar)),
        p.decimal('jumlah', body.jumlah),
        p.varchar('jenis_pembayaran', body.jenis_pembayaran, 20),
        p.varchar('ip_address', session.ipAddress, 45),
      ],
      session,
    );

    const result = rows[0];
    await this.audit.catat(
      'Tambah',
      'pembayaran',
      pesananId,
      `Mencatat pembayaran senilai Rp ${body.jumlah.toLocaleString('id-ID')}`,
      session,
    );

    return {
      status_pembayaran: result?.status_pembayaran ?? 'Diproses',
      remaining_debt: Number(result?.remaining_debt ?? 0),
    };
  }
}
