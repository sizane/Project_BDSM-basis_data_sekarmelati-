import { p, runProc, runQuery, sql, type SqlParam } from '../../config/database';
import { AppError, ERRORS, type ErrorDef } from '../../constants/error-codes';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate, todayWIB, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import { MAX_RUPIAH } from '../../middlewares/validate';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';
import { SqlPesananDetailRepository } from './pesanan-detail.repository';
import { PesananDetailService } from './pesanan-detail.service';

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

const PESANAN_RESULT_MAP: Record<string, ErrorDef> = {
  QTY_INVALID: ERRORS.VAL_QTY,
  PRICE_INVALID: ERRORS.VAL_NEGATIVE,
  DP_NEGATIVE: ERRORS.VAL_NEGATIVE,
  DP_EXCEEDS_TOTAL: ERRORS.VAL_DP_EXCEEDS,
  DUE_DATE_INVALID: ERRORS.VAL_DUE_DATE,
  SYSTEM_ERROR: ERRORS.SYS_DATABASE,
};

interface CatatPesananRow {
  result: string;
  pesanan_id: string | null;
  no_pesanan: string | null;
  harga_total: number | null;
  sisa_piutang: number | null;
  status_pesanan: string | null;
}

export class PesananService {
    constructor(
      private readonly detailService: PesananDetailService = new PesananDetailService(
        new SqlPesananDetailRepository(),
      ),
    ) {}

    async listPesanan(
      query: ListPesananQuery,
    ): Promise<{ data: unknown[]; meta: PaginationMeta }> {
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
        data: rows.recordset.map((row) => ({
          pesanan_id: row.pesanan_id,
          no_pesanan: row.no_pesanan,
          nama_customer: row.nama_customer,
          tanggal_masuk: formatSqlDate(row.tanggal_masuk),
          tenggat: formatSqlDate(row.tenggat),
          harga_total: row.harga_total,
          total_dibayar: row.total_paid,
          sisa_piutang: row.remaining_debt,
          status_pesanan: row.status_pesanan,
        })),
        meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
      };
    }

    async getPesananDetail(pesananId: string) {
      return this.detailService.getPesananDetail(pesananId);
    }

    async createPesanan(body: CreatePesananBody, adminId: string, ip: string) {
      const item = body.items[0];
      if (!item) throw new AppError(ERRORS.VAL_REQUIRED);

      const total = item.kuantitas * item.harga_per_item;
      if (total > MAX_RUPIAH) throw new AppError(ERRORS.VAL_TOO_LARGE);
      if (body.dp > total) throw new AppError(ERRORS.VAL_DP_EXCEEDS);
      if (body.tenggat < todayWIB()) throw new AppError(ERRORS.VAL_DUE_DATE);

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
      if (row.result !== 'SUCCESS') {
        throw new AppError(PESANAN_RESULT_MAP[row.result] ?? ERRORS.SYS_DATABASE);
      }

      return {
        pesanan_id: row.pesanan_id,
        no_pesanan: row.no_pesanan,
        harga_total: Number(row.harga_total),
        sisa_piutang: Number(row.sisa_piutang),
        status_pesanan: row.status_pesanan,
      };
    }

    async catatPembayaran(
      pesananId: string,
      body: CatatPembayaranBody,
      adminId: string,
      ip: string,
    ) {
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

      switch (out.result) {
        case 'SUCCESS':
          return {
            pembayaran_id: out.pembayaran_id,
            sisa_piutang_baru: Number(out.sisa_piutang_baru),
            status_pesanan: out.status_pesanan,
          };
        case 'ORDER_NOT_FOUND':
          throw new AppError(ERRORS.NOT_FOUND_PESANAN);
        case 'AMOUNT_INVALID':
          throw new AppError(
            ERRORS.VAL_NOMINAL,
            'Nominal pembayaran harus lebih besar dari Rp 0.',
          );
        case 'OVERPAYMENT':
          throw new AppError(ERRORS.VAL_OVERPAYMENT);
        default:
          throw new AppError(ERRORS.SYS_DATABASE);
      }
    }
}

const pesananService = new PesananService();
export const listPesanan = pesananService.listPesanan.bind(pesananService);
export const getPesananDetail = pesananService.getPesananDetail.bind(pesananService);
export const createPesanan = pesananService.createPesanan.bind(pesananService);
export const catatPembayaran = pesananService.catatPembayaran.bind(pesananService);
