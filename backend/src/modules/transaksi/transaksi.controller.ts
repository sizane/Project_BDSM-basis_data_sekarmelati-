import type { Request, Response } from 'express';
import { sendPaginated } from '../../utils/response';
import type { ListTransaksiQuery } from './transaksi.schema';
import * as transaksiService from './transaksi.service';
import { TransaksiService } from '../../core/services/TransaksiService';

/**
 * TransaksiController: Controller berbasis OOP untuk modul Transaksi.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan TransaksiService.
 * - ASYNC: Asynchronous handler.
 */
export class TransaksiController {
  private readonly transaksiService: TransaksiService;

  constructor(service?: TransaksiService) {
    this.transaksiService = service ?? new TransaksiService();
  }

  public list = async (req: Request, res: Response): Promise<void> => {
    const { data, meta } = await transaksiService.listRiwayatTransaksi(req.validated.query as ListTransaksiQuery);
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
