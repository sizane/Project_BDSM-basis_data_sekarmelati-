import type { Request, Response } from 'express';
import { sendPaginated } from '../../utils/response';
import type { ListPiutangQuery } from './piutang.schema';
import * as piutangService from './piutang.service';

export async function list(req: Request, res: Response): Promise<void> {
  const { data, meta } = await piutangService.listPiutang(req.validated.query as ListPiutangQuery);
  sendPaginated(res, data, meta, data.length === 0 ? 'Tidak ada piutang aktif saat ini' : 'Daftar piutang berhasil dimuat');
}
