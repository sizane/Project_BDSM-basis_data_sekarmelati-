import type { Request, Response } from 'express';
import { AppError, ERRORS } from '../../constants/error-codes';
import { sendPaginated, sendSuccess } from '../../utils/response';
import type { CreatePengeluaranBody, ListPengeluaranQuery } from './pengeluaran.schema';
import { PengeluaranCoreService } from '../../core/services/PengeluaranCoreService';
import { SessionContext } from '../../core/domain/SessionContext';

/**
 * PengeluaranController: Controller berbasis OOP untuk modul Pengeluaran.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan PengeluaranCoreService.
 * - ASOSIASI: Menggunakan SessionContext.
 * - ASYNC: Asynchronous request handling.
 */
export class PengeluaranController {
  private readonly pengeluaranService: PengeluaranCoreService;

  constructor(service?: PengeluaranCoreService) {
    this.pengeluaranService = service ?? new PengeluaranCoreService();
  }

  private extractSession(req: Request): SessionContext {
    if (!req.user) throw new AppError(ERRORS.AUTH_REQUIRED);
    return new SessionContext(req.user.adminId, req.user.username, req.clientIp, req.user.role);
  }

  public list = async (req: Request, res: Response): Promise<void> => {
    // Memanggil method overload cariPengeluaran() dengan parameter query
    const { data, meta } = await this.pengeluaranService.cariPengeluaran(req.validated.query as ListPengeluaranQuery);
    sendPaginated(res, data, meta, 'Daftar pengeluaran berhasil dimuat');
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const session = this.extractSession(req);
    const data = await this.pengeluaranService.createPengeluaran(
      req.validated.body as CreatePengeluaranBody,
      session,
    );
    sendSuccess(res, data, 'Pengeluaran berhasil dicatat', 201);
  };
}

export const pengeluaranController = new PengeluaranController();

export const list = pengeluaranController.list;
export const create = pengeluaranController.create;
