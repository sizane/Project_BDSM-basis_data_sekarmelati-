import type { Request, Response } from 'express';
import { AppError, ERRORS } from '../../constants/error-codes';
import { sendPaginated, sendSuccess } from '../../utils/response';
import type { CatatPembayaranBody, CreatePesananBody, ListPesananQuery } from './pesanan.schema';
import { PesananService, pesananService as defaultPesananService } from './pesanan.service';
import { SessionContext } from '../../middlewares/session-context';

/**
 * PesananController: Controller berbasis OOP untuk modul Pesanan.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan PesananService via konstruktor / dependency injection.
 * - ASOSIASI: Mengonversi request Express menjadi SessionContext dan meneruskannya ke Service.
 * - ASYNC: Seluruh handler request bersifat asynchronous.
 */
export class PesananController {
  // --- AGREGASI: Menyimpan referensi ke instance PesananService ---
  private readonly service: PesananService;

  constructor(service?: PesananService) {
    this.service = service ?? defaultPesananService;
  }

  // --- ASOSIASI: Membangun SessionContext dari objek Request Express ---
  private extractSession(req: Request): SessionContext {
    if (!req.user) throw new AppError(ERRORS.AUTH_REQUIRED);
    return new SessionContext(req.user.adminId, req.user.username, req.clientIp, req.user.role);
  }

  public list = async (req: Request, res: Response): Promise<void> => {
    // Memanggil method overload cariPesanan() dengan parameter query
    const { data, meta } = await this.service.cariPesanan(req.validated.query as ListPesananQuery);
    sendPaginated(res, data, meta, data.length === 0 ? 'Belum ada data pesanan.' : 'Daftar pesanan berhasil dimuat');
  };

  public detail = async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.getPesananDetail(req.validated.params.id as string);
    sendSuccess(res, data, 'Detail pesanan berhasil dimuat');
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const session = this.extractSession(req);
    const data = await this.service.createPesanan(req.validated.body as CreatePesananBody, session);
    sendSuccess(res, data, 'Pesanan berhasil dibuat', 201);
  };

  public catatPembayaran = async (req: Request, res: Response): Promise<void> => {
    const session = this.extractSession(req);
    const data = await this.service.catatPembayaran(
      req.validated.params.id as string,
      req.validated.body as CatatPembayaranBody,
      session,
    );
    sendSuccess(res, data, 'Pembayaran berhasil dicatat');
  };
}

export const pesananController = new PesananController();

// Export fungsi backward-compatible untuk Express route
export const list = pesananController.list;
export const detail = pesananController.detail;
export const create = pesananController.create;
export const catatPembayaran = pesananController.catatPembayaran;
