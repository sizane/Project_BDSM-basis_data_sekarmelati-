import type { Request, Response } from 'express';
import { sendPaginated } from '../../utils/response';
import type { ListTransaksiQuery } from './transaksi.schema';
import * as transaksiService from './transaksi.service';

export async function list(req: Request, res: Response): Promise<void> {
  const { data, meta } = await transaksiService.listRiwayatTransaksi(req.validated.query as ListTransaksiQuery);
  sendPaginated(
    res,
    data,
    meta,
    data.length === 0 ? 'Data riwayat transaksi tidak ditemukan' : 'Riwayat transaksi berhasil dimuat',
  );
}
