import type { Request, Response, NextFunction } from 'express';
import {
    getDaftarPesanan,
    createPesananBaru,
    getDetailPesanan,
    catatPembayaranPesanan,
} from './pesanan.service';
import type {
    ListPesananQuery,
    CreatePesananInput,
    CreatePembayaranInput,
} from './pesanan.schema';
import { sendSuccess, sendError } from '../../utils/response';
import { ERROR_CODES } from '../../constants/error-codes';

export const handleListPesanan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as unknown as ListPesananQuery;
        const { items, meta } = await getDaftarPesanan(query);

        const message =
        items.length === 0 ? 'Belum ada data pesanan.' : 'Daftar pesanan berhasil dimuat';
        
        return sendSuccess(res, items, message, 200, meta);
    } catch (err) {
        next(err);
    }
};

export const handleCreatePesanan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as CreatePesananInput;
    const result = await createPesananBaru(payload, req.user!.admin_id, req.clientIp);

    if (result.error) {
      return sendError(res, result.error.message, result.error.code, result.error.status);
    }

    return sendSuccess(res, result.data, 'Pesanan berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

export const handleGetDetailPesanan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const detail = await getDetailPesanan(id);
        
        if (!detail) {
            return sendError(res, 'Data pesanan tidak ditemukan', ERROR_CODES.NOT_FOUND, 404);
        }
        
        return sendSuccess(res, detail, 'Detail pesanan berhasil dimuat', 200);
    } catch (err) {
        next(err);
    }
};

export const handleCreatePembayaran = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const payload = req.body as CreatePembayaranInput;

        const result = await catatPembayaranPesanan(id, req.user!.admin_id, payload, req.clientIp);
        
        if (result.error) {
            return sendError(res, result.error.message, result.error.code, result.error.status);
        }
        
        return sendSuccess(res, result.data, 'Pembayaran berhasil dicatat', 200);
    } catch (err) {
        next(err);
    }
};