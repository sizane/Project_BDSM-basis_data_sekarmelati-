import { sendPaginated } from '../../utils/response';
import * as transaksiService from './transaksi.service';
import { TransaksiService } from '../../core/services/TransaksiService';
/**
 * TransaksiController: Controller berbasis OOP untuk modul Transaksi.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan TransaksiService.
 * - ASYNC: Asynchronous handler.
 */
export class TransaksiController {
    transaksiService;
    constructor(service) {
        this.transaksiService = service ?? new TransaksiService();
    }
    list = async (req, res) => {
        const { data, meta } = await transaksiService.listRiwayatTransaksi(req.validated.query);
        sendPaginated(res, data, meta, data.length === 0 ? 'Data riwayat transaksi tidak ditemukan' : 'Riwayat transaksi berhasil dimuat');
    };
}
export const transaksiController = new TransaksiController();
export const list = transaksiController.list;
//# sourceMappingURL=transaksi.controller.js.map