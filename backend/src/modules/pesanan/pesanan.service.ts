import { poolPromise, sql } from '../../config/database';
import { ERROR_CODES } from '../../constants/error-codes';
import type {
  ListPesananQuery,
  CreatePesananInput,
  CreatePembayaranInput,
} from './pesanan.schema';

export const getDaftarPesanan = async (query: ListPesananQuery) => {
  const pool = await poolPromise;
  const offset = (query.page - 1) * query.per_page;

  const request = pool.request();
  request.input('search', sql.VarChar(100), `%${query.search}%`);
  request.input('offset', sql.Int, offset);
  request.input('per_page', sql.Int, query.per_page);

  let whereClause = `WHERE (nama_customer LIKE @search OR no_pesanan LIKE @search)`;
  if (query.status_pesanan) {
    request.input('status_pesanan', sql.VarChar(20), query.status_pesanan);
    whereClause += ` AND status_pesanan = @status_pesanan`;
  }

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM v_ringkasan_pesanan
    ${whereClause}
  `;

  const dataQuery = `
    SELECT
      pesanan_id,
      no_pesanan,
      nama_customer,
      tanggal_masuk,
      tenggat,
      harga_total,
      total_paid AS total_dibayar,
      remaining_debt AS sisa_piutang,
      status_pesanan
    FROM v_ringkasan_pesanan
    ${whereClause}
    ORDER BY tanggal_masuk DESC, no_pesanan DESC
    OFFSET @offset ROWS FETCH NEXT @per_page ROWS ONLY
  `;

  const [countRes, dataRes] = await Promise.all([
    request.query(countQuery),
    request.query(dataQuery),
  ]);

  const total = countRes.recordset[0]?.total ?? 0;
  const last_page = Math.max(1, Math.ceil(total / query.per_page));

  return {
    items: dataRes.recordset,
    meta: {
      current_page: query.page,
      per_page: query.per_page,
      total,
      last_page,
    },
  };
};

export const createPesananBaru = async (
  input: CreatePesananInput,
  adminId: string,
  ipAddress: string
) => {
  const pool = await poolPromise;
  const firstItem = input.items[0];

  const spResult = await pool
    .request()
    .input('admin_id', sql.UniqueIdentifier, adminId)
    .input('nama_customer', sql.VarChar(100), input.nama_customer)
    .input('no_kontak', sql.VarChar(20), input.no_kontak)
    .input('rincian_pesanan', sql.VarChar(200), firstItem!.rincian_pesanan)
    .input('kuantitas', sql.Int, firstItem!.kuantitas)
    .input('harga_per_item', sql.Decimal(12, 2), firstItem!.harga_per_item)
    .input('dp', sql.Decimal(12, 2), input.dp)
    .input('tenggat', sql.Date, input.tenggat)
    .input('ip_address', sql.VarChar(45), ipAddress)
    .execute('sp_catat_pesanan_baru');

  const row = spResult.recordset?.[0];

  if (!row || row.result !== 'SUCCESS') {
    const codeMap: Record<string, { code: string; message: string; status: number }> = {
      QTY_INVALID: { code: ERROR_CODES.VAL_ZERO_OR_NEGATIVE, message: 'Kuantitas harus lebih dari 0', status: 422 },
      PRICE_INVALID: { code: ERROR_CODES.VAL_NEGATIVE, message: 'Harga per item harus lebih dari Rp 0', status: 422 },
      DP_NEGATIVE: { code: ERROR_CODES.VAL_NEGATIVE, message: 'Nominal harga atau DP tidak boleh negatif.', status: 422 },
      DP_EXCEEDS_TOTAL: { code: ERROR_CODES.VAL_NEGATIVE, message: 'DP tidak boleh melebihi total harga', status: 422 },
      DUE_DATE_INVALID: { code: ERROR_CODES.VAL_REQUIRED, message: 'Tenggat tidak boleh sebelum tanggal masuk', status: 422 },
    };

    const mapped = (row?.result && codeMap[row.result]) || {
      code: ERROR_CODES.SYSTEM_ERROR,
      message: 'Gagal menyimpan pesanan baru.',
      status: 500,
    };

    return { error: mapped };
  }

  // Jika pesanan memiliki lebih dari 1 item, tambahkan item ke-2 dst. dan sinkronkan harga_total
  if (input.items.length > 1) {
    const extraItems = input.items.slice(1);
    for (const item of extraItems) {
      await pool
        .request()
        .input('pesanan_id', sql.UniqueIdentifier, row.pesanan_id)
        .input('rincian_pesanan', sql.VarChar(200), item.rincian_pesanan)
        .input('jumlah', sql.Int, item.kuantitas)
        .input('harga_per_item', sql.Decimal(12, 2), item.harga_per_item)
        .query(`
          INSERT INTO item_pesanan (pesanan_id, rincian_pesanan, jumlah, harga_per_item)
          VALUES (@pesanan_id, @rincian_pesanan, @jumlah, @harga_per_item)
        `);
    }

    const updatedOrder = await pool
      .request()
      .input('pesanan_id', sql.UniqueIdentifier, row.pesanan_id)
      .query(`
        UPDATE pesanan
        SET harga_total = (
          SELECT SUM(jumlah * harga_per_item) FROM item_pesanan WHERE pesanan_id = @pesanan_id
        ),
        status_pesanan = CASE
          WHEN dbo.fn_hitung_total_dibayar(@pesanan_id) >= (
            SELECT SUM(jumlah * harga_per_item) FROM item_pesanan WHERE pesanan_id = @pesanan_id
          ) THEN 'Lunas'
          ELSE 'Belum Lunas'
        END
        OUTPUT
          INSERTED.pesanan_id,
          INSERTED.no_pesanan,
          INSERTED.harga_total,
          dbo.fn_hitung_sisa_piutang(INSERTED.pesanan_id) AS sisa_piutang,
          INSERTED.status_pesanan
        WHERE pesanan_id = @pesanan_id
      `);

    return { data: updatedOrder.recordset[0] };
  }

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
    pesanan_id: order.pesanan_id,
    no_pesanan: order.no_pesanan,
    tanggal_masuk: order.tanggal_masuk,
    tenggat: order.tenggat,
    customer: {
      customer_id: order.customer_id,
      nama_customer: order.nama_customer,
      no_kontak: order.no_kontak,
    },
    items: itemsRes.recordset,
    harga_total: order.harga_total,
    total_dibayar: order.total_dibayar,
    sisa_piutang: order.sisa_piutang,
    status_pesanan: order.status_pesanan,
    riwayat_pembayaran: paymentsRes.recordset,
  };
};

export const catatPembayaranPesanan = async (
  pesananId: string,
  adminId: string,
  input: CreatePembayaranInput,
  ipAddress: string
) => {
  const pool = await poolPromise;

  const spResult = await pool
    .request()
    .input('pesanan_id', sql.UniqueIdentifier, pesananId)
    .input('admin_id', sql.UniqueIdentifier, adminId)
    .input('tanggal_bayar', sql.Date, input.tanggal_bayar)
    .input('jumlah', sql.Decimal(12, 2), input.jumlah)
    .input('jenis_pembayaran', sql.VarChar(20), input.jenis_pembayaran)
    .input('ip_address', sql.VarChar(45), ipAddress)
    .execute('sp_catat_pembayaran');

  const row = spResult.recordset?.[0];

  if (!row || row.result !== 'SUCCESS') {
    const errorMap: Record<string, { code: string; message: string; status: number }> = {
      ORDER_NOT_FOUND: {
        code: ERROR_CODES.NOT_FOUND,
        message: 'Data pesanan tidak ditemukan',
        status: 404,
      },
      AMOUNT_INVALID: {
        code: ERROR_CODES.VAL_ZERO_OR_NEGATIVE,
        message: 'Nominal pembayaran harus lebih besar dari Rp 0.',
        status: 422,
      },
      OVERPAYMENT: {
        code: ERROR_CODES.VAL_OVERPAYMENT,
        message: 'Jumlah pembayaran melebihi sisa piutang tagihan.',
        status: 422,
      },
    };

    const mapped = (row?.result && errorMap[row.result]) || {
      code: ERROR_CODES.SYSTEM_ERROR,
      message: 'Gagal mencatat pembayaran.',
      status: 500,
    };

    return { error: mapped };
  }

  return {
    data: {
      pembayaran_id: row.pembayaran_id,
      sisa_piutang_baru: row.sisa_piutang_baru,
      status_pesanan: row.status_pesanan,
    },
  };
};