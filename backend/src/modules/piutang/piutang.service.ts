import { p, runQuery, type SqlParam } from '../../config/database';
import { AppError, ERRORS, isDatabaseError } from '../../constants/error-codes';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import type { ListPiutangQuery } from './piutang.schema';

interface PiutangRow {
  customer_id: string;
  nama_customer: string;
  pesanan_id: string;
  no_pesanan: string;
  harga_total: number;
  remaining_debt: number;
  tenggat: Date;
  status_pesanan: string;
  total_piutang_pelanggan: number;
}

// Whitelist pengurutan (BR-15) - tidak ada input user yang digabung ke SQL.
const ORDER_BY = {
  sisa_terbesar: 'remaining_debt DESC, tenggat ASC',
  tenggat_terdekat: 'tenggat ASC, remaining_debt DESC',
} as const;

/** FSD-2.5: pesanan Belum Lunas dari view v_daftar_piutang. */
export async function listPiutang(query: ListPiutangQuery): Promise<{ data: unknown[]; meta: PaginationMeta }> {
  const where: string[] = [];
  const params: SqlParam[] = [];
  if (query.search) {
    where.push(`(nama_customer LIKE @search ESCAPE '!' OR no_pesanan LIKE @search ESCAPE '!')`);
    params.push(p.varchar('search', `%${escapeLike(query.search)}%`, 110));
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const count = await runQuery<{ total: number }>(
      `SELECT COUNT(*) AS total FROM dbo.v_daftar_piutang ${whereSql}`,
      params,
    );
    const rows = await runQuery<PiutangRow>(
      `SELECT customer_id, nama_customer, pesanan_id, no_pesanan, harga_total, remaining_debt,
              tenggat, status_pesanan,
              SUM(remaining_debt) OVER (PARTITION BY customer_id) AS total_piutang_pelanggan
         FROM dbo.v_daftar_piutang
         ${whereSql}
        ORDER BY ${ORDER_BY[query.sort]}, no_pesanan
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [...params, p.int('offset', offsetOf(query.page, query.per_page)), p.int('limit', query.per_page)],
    );

    return {
      data: rows.recordset.map((r) => ({
        customer_id: r.customer_id,
        nama_customer: r.nama_customer,
        pesanan_id: r.pesanan_id,
        no_pesanan: r.no_pesanan,
        total_tagihan: r.harga_total,
        sisa_piutang: r.remaining_debt,
        total_piutang_pelanggan: r.total_piutang_pelanggan,
        tenggat: formatSqlDate(r.tenggat),
        status_pesanan: r.status_pesanan,
      })),
      meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
    };
  } catch (err) {
    // FSD-2.5 EF-1 / SCR-07: pesan khusus bila data piutang gagal dimuat
    if (isDatabaseError(err)) {
      throw new AppError(ERRORS.SYS_DATABASE, 'Gagal memuat data piutang. Silakan coba beberapa saat lagi.', {
        cause: err,
      });
    }
    throw err;
  }
}
