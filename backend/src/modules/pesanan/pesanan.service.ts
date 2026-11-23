import { p, runProc, runQuery, sql, type SqlParam } from '../../config/database';
import { AppError, ERRORS, type ErrorDef } from '../../constants/error-codes';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate, todayWIB, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import { MAX_RUPIAH } from '../../middlewares/validate';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';
import { p, runProc, runQuery, sql, type SqlParam } from '../../config/database';
import { AppError, ERRORS, type ErrorDef } from '../../constants/error-codes';
import { escapeLike } from '../../utils/sanitizer';
import { formatSqlDate, todayWIB, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import { MAX_RUPIAH } from '../../middlewares/validate';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';

// ---------------------------------------------------------------------------
// Daftar pesanan (SCR-03) - sumber: view v_ringkasan_pesanan
// ---------------------------------------------------------------------------

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

export async function listPesanan(query: ListPesananQuery): Promise<{ data: unknown[]; meta: PaginationMeta }> {
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
      harga_total: r.harga_total,
      total_dibayar: r.total_paid,
      sisa_piutang: r.remaining_debt,
      status_pesanan: r.status_pesanan,
    })),
    meta: buildMeta(query.page, query.per_page, count.recordset[0]?.total ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Detail / nota pesanan (SCR-05)
// ---------------------------------------------------------------------------

export async function getPesananDetail(pesananId: string) {
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
    data: {
      pesanan_id: row.pesanan_id,
      no_pesanan: row.no_pesanan,
      harga_total: row.harga_total,
      sisa_piutang: row.sisa_piutang,
      status_pesanan: row.status_pesanan,
    },
  };
};

export const getDetailPesanan = async (pesananId: string) => {
  const pool = await poolPromise;

  const headerRes = await pool
    .request()
    .input('pesanan_id', sql.UniqueIdentifier, pesananId)
    .query(`
      SELECT
        p.pesanan_id,
        p.no_pesanan,
        p.tanggal_masuk,
        p.tenggat,
        p.harga_total,
        dbo.fn_hitung_total_dibayar(p.pesanan_id) AS total_dibayar,
        dbo.fn_hitung_sisa_piutang(p.pesanan_id) AS sisa_piutang,
        p.status_pesanan,
        c.customer_id,
        c.nama_customer,
        c.no_kontak
      FROM pesanan p
      JOIN customers c ON p.customer_id = c.customer_id
      WHERE p.pesanan_id = @pesanan_id
    `);

  const order = headerRes.recordset[0];
  if (!order) {
    return null;
  }

  const [itemsRes, paymentsRes] = await Promise.all([
    pool
      .request()
      .input('pesanan_id', sql.UniqueIdentifier, pesananId)
      .query(`
        SELECT
          item_id,
          rincian_pesanan,
          jumlah,
          harga_per_item,
          (jumlah * harga_per_item) AS subtotal
        FROM item_pesanan
        WHERE pesanan_id = @pesanan_id
      `),
    pool
      .request()
      .input('pesanan_id', sql.UniqueIdentifier, pesananId)
      .query(`
        SELECT
          pembayaran_id,
          tanggal_bayar,
          jenis_pembayaran,
          jumlah,
          created_at
        FROM pembayaran
        WHERE pesanan_id = @pesanan_id
        ORDER BY tanggal_bayar ASC, created_at ASC
      `),
  ]);

  return {
    pesanan_id: row.pesanan_id,
    no_pesanan: row.no_pesanan,
    harga_total: Number(row.harga_total),
    sisa_piutang: Number(row.sisa_piutang),
    status_pesanan: row.status_pesanan,
  };
}

// ---------------------------------------------------------------------------
// Catat pembayaran (FSD-2.3) - sp_catat_pembayaran
// ---------------------------------------------------------------------------

export async function catatPembayaran(pesananId: string, body: CatatPembayaranBody, adminId: string, ip: string) {
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
      throw new AppError(ERRORS.VAL_NOMINAL, 'Nominal pembayaran harus lebih besar dari Rp 0.');
    case 'OVERPAYMENT':
      throw new AppError(ERRORS.VAL_OVERPAYMENT);
    default:
      throw new AppError(ERRORS.SYS_DATABASE);
  }
}
