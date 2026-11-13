import type { Request, Response } from 'express';
import { AppError, ERRORS } from '../../constants/error-codes';
import { logger } from '../../utils/logger';
import { sendPaginated, sendSuccess } from '../../utils/response';
import type { ExportQuery, LabaRugiQuery, LevelUtangQuery } from './laporan.schema';
import * as laporanService from './laporan.service';
import { generateLabaRugiPdf, generateLevelUtangPdf } from './pdf-generator.service';

export async function labaRugi(req: Request, res: Response): Promise<void> {
  const { bulan, tahun } = req.validated.query as LabaRugiQuery;
  const { ada_transaksi, ...data } = await laporanService.getLabaRugi(bulan, tahun);
  sendSuccess(
    res,
    data,
    ada_transaksi ? 'Laporan laba/rugi berhasil dimuat' : 'Belum ada transaksi recorded pada bulan ini',
  );
}

export async function levelUtang(req: Request, res: Response): Promise<void> {
  const { level, page, per_page } = req.validated.query as LevelUtangQuery;
  const { data, meta } = await laporanService.listLevelUtang(level, page, per_page);
  sendPaginated(
    res,
    data,
    meta,
    data.length === 0 && !level
      ? 'Belum ada data piutang pelanggan untuk dianalisis'
      : 'Laporan level utang berhasil dimuat',
  );
}

/** FSD-2.11: PDF dibuat penuh di memori dulu, sehingga kegagalan menghasilkan JSON error (bukan file rusak). */
export async function exportPdf(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(ERRORS.AUTH_REQUIRED);
  const { jenis } = req.validated.params as { jenis: 'laba-rugi' | 'level-utang' };
  const query = req.validated.query as ExportQuery;

  let buffer: Buffer;
  let filename: string;

  if (jenis === 'laba-rugi') {
    if (query.bulan === undefined) throw new AppError(ERRORS.VAL_REQUIRED, 'Pilih bulan laporan yang valid');
    if (query.tahun === undefined) throw new AppError(ERRORS.VAL_REQUIRED, 'Pilih tahun laporan yang valid');
    const data = await laporanService.getLabaRugi(query.bulan, query.tahun);
    try {
      buffer = await generateLabaRugiPdf(data, req.user.fullName);
    } catch (err) {
      logger.error('Gagal membuat PDF laba/rugi', err);
      throw new AppError(ERRORS.SYS_PDF, undefined, { cause: err });
    }
    filename = `laporan-laba-rugi-${query.tahun}-${String(query.bulan).padStart(2, '0')}.pdf`;
  } else {
    const rows = await laporanService.listAllLevelUtang(query.level);
    try {
      buffer = await generateLevelUtangPdf(rows, req.user.fullName, query.level);
    } catch (err) {
      logger.error('Gagal membuat PDF level utang', err);
      throw new AppError(ERRORS.SYS_PDF, undefined, { cause: err });
    }
    filename = 'laporan-level-utang.pdf';
  }

  res
    .status(200)
    .set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'no-store',
    })
    .end(buffer);
}
