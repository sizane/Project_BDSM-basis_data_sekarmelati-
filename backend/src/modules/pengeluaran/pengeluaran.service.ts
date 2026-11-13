import { p, runProc, runQuery } from '../../config/database';
import { AppError, ERRORS } from '../../constants/error-codes';
import { formatSqlDate, toSqlDate } from '../../utils/date';
import { buildMeta, offsetOf } from '../../utils/response';
import type { PaginationMeta } from '../../types/api-response';
import type { CreatePengeluaranBody, ListPengeluaranQuery } from './pengeluaran.schema';

interface PengeluaranRow {
  pengeluaran_id: string;
  tanggal_pengeluaran: Date;
  kategori_pengeluaran: string;
  jumlah: number;
  keterangan: string | null;
}

/** SCR-09: daftar pengeluaran, terbaru dulu. */
export async function listPengeluaran(
  query: ListPengeluaranQuery,
): Promise<{ data: unknown[]; meta: PaginationMeta }> {
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

interface CatatPengeluaranRow {
  result: string;
  pengeluaran_id?: string | null;
}

/**
 * FSD-2.4: sp_catat_pengeluaran. Spesifikasi TSD hanya mengembalikan `result`; bila SP
 * tidak menyertakan kolom pengeluaran_id, id dicari dari baris yang baru saja dicatat.
 */
export async function createPengeluaran(body: CreatePengeluaranBody, adminId: string, ip: string) {
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

  switch (row.result) {
    case 'SUCCESS':
      break;
    case 'AMOUNT_INVALID':
      throw new AppError(ERRORS.VAL_NOMINAL, 'Nominal pengeluaran wajib diisi dengan angka lebih dari 0.');
    case 'NOTES_REQUIRED':
      throw new AppError(ERRORS.VAL_NOTES_REQUIRED);
    default:
      throw new AppError(ERRORS.SYS_DATABASE);
  }

  if (row.pengeluaran_id) return { pengeluaran_id: row.pengeluaran_id };

  const latest = await runQuery<{ pengeluaran_id: string }>(
    `SELECT TOP 1 pengeluaran_id
       FROM dbo.pengeluaran
      WHERE admin_id = @admin_id
        AND tanggal_pengeluaran = @tanggal
        AND kategori_pengeluaran = @kategori
        AND jumlah = @jumlah
      ORDER BY created_at DESC`,
    [
      p.uuid('admin_id', adminId),
      p.date('tanggal', toSqlDate(body.tanggal_pengeluaran)),
      p.varchar('kategori', body.kategori_pengeluaran, 20),
      p.decimal('jumlah', body.jumlah),
    ],
  );
  return { pengeluaran_id: latest.recordset[0]?.pengeluaran_id ?? null };
}
