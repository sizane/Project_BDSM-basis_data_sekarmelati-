import type { Request, Response } from 'express';
import { sendPaginated } from '../../utils/response';
import type { ListTransaksiQuery } from './transaksi.schema';
import { TransaksiService, transaksiService as defaultTransaksiService } from './transaksi.service';

/**
 * TransaksiController: Controller berbasis OOP untuk modul Transaksi.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan TransaksiService via konstruktor.
 * - ASYNC: Asynchronous handler.
 */
export class TransaksiController {
  private readonly service: TransaksiService;

  constructor(service?: TransaksiService) {
    this.service = service ?? defaultTransaksiService;
  }

  public list = async (req: Request, res: Response): Promise<void> => {
    const { data, meta } = await this.service.listRiwayatTransaksi(req.validated.query as ListTransaksiQuery);
    sendPaginated(
      res,
      data,
      meta,
      data.length === 0 ? 'Data riwayat transaksi tidak ditemukan' : 'Riwayat transaksi berhasil dimuat',
    );
  };
}

export const transaksiController = new TransaksiController();

export const list = transaksiController.list;
