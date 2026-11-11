import type { Request, Response } from 'express';
import { AppError, ERRORS } from '../../constants/error-codes';
import { sendPaginated, sendSuccess } from '../../utils/response';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';
import * as pesananService from './pesanan.service';

function requireUser(req: Request) {
  if (!req.user) throw new AppError(ERRORS.AUTH_REQUIRED);
  return req.user;
}

export async function list(req: Request, res: Response): Promise<void> {
  const { data, meta } = await pesananService.listPesanan(req.validated.query as ListPesananQuery);
  sendPaginated(res, data, meta, data.length === 0 ? 'Belum ada data pesanan.' : 'Daftar pesanan berhasil dimuat');
}

export async function detail(req: Request, res: Response): Promise<void> {
  const data = await pesananService.getPesananDetail(req.validated.params.id as string);
  sendSuccess(res, data, 'Detail pesanan berhasil dimuat');
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const data = await pesananService.createPesanan(req.validated.body as CreatePesananBody, user.adminId, req.clientIp);
  sendSuccess(res, data, 'Pesanan berhasil dibuat', 201);
}

export async function catatPembayaran(req: Request, res: Response): Promise<void> {
  const user = requireUser(req);
  const data = await pesananService.catatPembayaran(
    req.validated.params.id as string,
    req.validated.body as CatatPembayaranBody,
    user.adminId,
    req.clientIp,
  );
  sendSuccess(res, data, 'Pembayaran berhasil dicatat');
}
