import { sendPaginated } from '../../utils/response';
import { TransaksiService, transaksiService as defaultTransaksiService } from './transaksi.service';
/**
 * TransaksiController: Controller berbasis OOP untuk modul Transaksi.
 * Memenuhi kriteria:
 * - AGREGASI: Meng-agregasikan TransaksiService via konstruktor.
 * - ASYNC: Asynchronous handler.
 */
export class TransaksiController {
    service;
    constructor(service) {
        this.service = service ?? defaultTransaksiService;
    }
    list = async (req, res) => {
        const { data, meta } = await this.service.listRiwayatTransaksi(req.validated.query);
        sendPaginated(res, data, meta, data.length === 0 ? 'Data riwayat transaksi tidak ditemukan' : 'Riwayat transaksi berhasil dimuat');
    };
}
export const transaksiController = new TransaksiController();
export const list = transaksiController.list;
//# sourceMappingURL=transaksi.controller.js.map