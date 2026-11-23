import { p, runProc, runQuery } from '../../config/database';
import { AppError, ERRORS } from '../../constants/error-codes';
import { formatSqlDate, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import type { CreatePengeluaranBody, ListPengeluaranQuery } from './pengeluaran.schema';
import { Transaksi } from '../pesanan/pesanan.service';
import { AuditService, auditServiceInstance } from '../audit-log/audit.service';
import { SessionContext } from '../../middlewares/session-context';

// ===========================================================================
// 1. DOMAIN CLASS (OOP: POLIMORFISME, ENKAPSULASI, OVERRIDING)
// ===========================================================================

/**
 * Pengeluaran: Subclass dari Transaksi (POLIMORFISME).
 * - POLIMORFISME: Merupakan wujud konkret polimorfik lain dari Transaksi selain Pesanan.
 * - ENKAPSULASI: Properti privat (#kategori, #penanggungJawab) dengan getter dan setter.
 * - OVERRIDING: Meng-override hitungTotal(), getJenisTransaksi(), dan toJSON().
 */
export class Pengeluaran extends Transaksi {
  #kategori: string;
  #penanggungJawab: string;

  constructor(
    id: string,
    nominal: number,
    tanggal: Date,
    kategori: string,
    penanggungJawab: string = 'Admin',
    keterangan: string = '',
  ) {
    super(id, nominal, tanggal, keterangan);
    this.#kategori = kategori;
    this.#penanggungJawab = penanggungJawab;
  }

  public get kategori(): string {
    return this.#kategori;
  }

  public set kategori(k: string) {
    this.#kategori = k;
  }

  public get penanggungJawab(): string {
    return this.#penanggungJawab;
  }

  public set penanggungJawab(pj: string) {
    this.#penanggungJawab = pj;
  }

  // --- OVERRIDING: Meng-override method hitungTotal dari Transaksi (POLIMORFISME) ---
  public override hitungTotal(): number {
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

// ===========================================================================
// 2. SERVICE CLASS (OOP: AGREGASI, ASOSIASI, OVERLOADING, ASYNC)
// ===========================================================================

interface PengeluaranRow {
  pengeluaran_id: string;
  tanggal_pengeluaran: Date;
  kategori_pengeluaran: string;
  jumlah: number;
  keterangan: string | null;
}

interface CatatPengeluaranRow {
  result: string;
  pengeluaran_id?: string | null;
}

/**
 * PengeluaranService: Layanan bisnis berbasis OOP untuk modul Pengeluaran.
 * - AGREGASI: Menyimpan referensi AuditService yang diinjeksi melalui konstruktor.
 * - ASOSIASI: Menggunakan SessionContext untuk parameter operasional dan pencatatan audit.
 * - OVERLOADING: listPengeluaran() menerima query filter ATAU ID tunggal.
 * - ASYNC: Operasi I/O database berjalan secara asynchronous.
 */
export class PengeluaranService {
  private readonly audit: AuditService;

  constructor(audit?: AuditService) {
    this.audit = audit ?? auditServiceInstance;
  }

  // --- OVERLOADING (Signature 1 & 2): Cari berdasarkan query ATAU berdasarkan ID ---
  public async listPengeluaran(query: ListPengeluaranQuery): Promise<{ data: unknown[]; meta: PaginationMeta }>;
  public async listPengeluaran(id: string): Promise<Pengeluaran | null>;
  // Implementasi tunggal
  public async listPengeluaran(
    arg: string | ListPengeluaranQuery,
  ): Promise<Pengeluaran | null | { data: unknown[]; meta: PaginationMeta }> {
    if (typeof arg === 'string') {
      return await this.getPengeluaranModelById(arg);
    }
    return await this.getList(arg);
  }

  private async getList(query: ListPengeluaranQuery): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const count = await runQuery<{ total: number }>('SELECT COUNT(*) AS total FROM dbo.pengeluaran');
    const rows = await runQuery<PengeluaranRow>(
      `SELECT pengeluaran_id, tanggal_pengeluaran, kategori_pengeluaran, jumlah, keterangan
         FROM dbo.pengeluaran
        ORDER BY tanggal_pengeluaran DESC, created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)],
    );
    return {
      data: rows.recordset.map((r) => ({
        pengeluaran_id: r.pengeluaran_id,
        tanggal_pengeluaran: formatSqlDate(r.tanggal_pengeluaran),
        kategori_pengeluaran: r.kategori_pengeluaran,
        jumlah: Number(r.jumlah),
        keterangan: r.keterangan,
      })),
      meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
    };
  }

  public async getPengeluaranModelById(id: string): Promise<Pengeluaran | null> {
    const rows = await runQuery<PengeluaranRow>(
      `SELECT pengeluaran_id, tanggal_pengeluaran, kategori_pengeluaran, jumlah, keterangan
         FROM dbo.pengeluaran
        WHERE pengeluaran_id = @id`,
      [p.uuid('id', id)],
    );
    const r = rows.recordset?.[0];
    if (!r) return null;

    return new Pengeluaran(
      r.pengeluaran_id,
      Number(r.jumlah),
      r.tanggal_pengeluaran,
      r.kategori_pengeluaran,
      'Admin',
      r.keterangan ?? '',
    );
  }

  // --- ASOSIASI: Menggunakan SessionContext (atau fallback string adminId & ip) ---
  public async createPengeluaran(
    body: CreatePengeluaranBody,
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

    const result = await runProc<CatatPengeluaranRow>('sp_catat_pengeluaran', [
      p.uuid('admin_id', adminId),
      p.date('tanggal_pengeluaran', toSqlDate(body.tanggal_pengeluaran)),
      p.varchar('kategori_pengeluaran', body.kategori_pengeluaran, 20),
      p.decimal('jumlah', body.jumlah),
      p.varchar('keterangan', body.keterangan ?? null, 255),
      p.varchar('ip_address', ip, 45),
    ]);

    const row = result.recordset?.[0];
    if (!row) throw new AppError(ERRORS.SYS_DATABASE);
    if (row.result !== 'SUCCESS') {
      if (row.result === 'ERR_NOTES_REQUIRED') throw new AppError(ERRORS.VAL_NOTES_REQUIRED);
      throw new AppError(ERRORS.SYS_DATABASE);
    }

    let pengeluaranId = row.pengeluaran_id;
    if (!pengeluaranId) {
      const fallback = await runQuery<{ pengeluaran_id: string }>(
        `SELECT TOP 1 pengeluaran_id
           FROM dbo.pengeluaran
          WHERE admin_id = @admin_id AND tanggal_pengeluaran = @tanggal AND jumlah = @jumlah
          ORDER BY created_at DESC`,
        [p.uuid('admin_id', adminId), p.date('tanggal', toSqlDate(body.tanggal_pengeluaran)), p.decimal('jumlah', body.jumlah)],
      );
      pengeluaranId = fallback.recordset[0]?.pengeluaran_id ?? null;
    }

    if (sessionCtx && pengeluaranId) {
      await this.audit.catat(
        'Tambah',
        'pengeluaran',
        pengeluaranId,
        `Mencatat pengeluaran ${body.kategori_pengeluaran} senilai Rp ${body.jumlah.toLocaleString('id-ID')}`,
        sessionCtx,
      );
    }

    return {
      pengeluaran_id: pengeluaranId,
      tanggal_pengeluaran: body.tanggal_pengeluaran,
      kategori_pengeluaran: body.kategori_pengeluaran,
      jumlah: body.jumlah,
      keterangan: body.keterangan ?? null,
    };
  }
}

export const pengeluaranService = new PengeluaranService();

// Export fungsi standalone untuk kompatibilitas penuh
export const listPengeluaran = (query: ListPengeluaranQuery) => pengeluaranService.listPengeluaran(query);
export const createPengeluaran = (body: CreatePengeluaranBody, sessionOrAdminId: SessionContext | string, ip?: string) =>
  pengeluaranService.createPengeluaran(body, sessionOrAdminId, ip);
