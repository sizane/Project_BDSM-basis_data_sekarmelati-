import type { Request, Response } from 'express';
import { AppError, ERRORS } from '../../constants/error-codes';
import { sendPaginated, sendSuccess } from '../../utils/response';
import type { CreatePengeluaranBody, ListPengeluaranQuery } from './pengeluaran.schema';
import * as pengeluaranService from './pengeluaran.service';

export async function list(req: Request, res: Response): Promise<void> {
  const { data, meta } = await pengeluaranService.listPengeluaran(req.validated.query as ListPengeluaranQuery);
  sendPaginated(res, data, meta, 'Daftar pengeluaran berhasil dimuat');
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(ERRORS.AUTH_REQUIRED);
  const data = await pengeluaranService.createPengeluaran(
    req.validated.body as CreatePengeluaranBody,
    req.user.adminId,
    req.clientIp,
  );
  sendSuccess(res, data, 'Pengeluaran berhasil dicatat', 201);
}
