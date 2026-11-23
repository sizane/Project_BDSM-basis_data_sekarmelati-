import { AppError, ERRORS } from '../../constants/error-codes';
import { sendPaginated, sendSuccess } from '../../utils/response';
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
    pengeluaranService;
    constructor(service) {
        this.pengeluaranService = service ?? new PengeluaranCoreService();
    }
    extractSession(req) {
        if (!req.user)
            throw new AppError(ERRORS.AUTH_REQUIRED);
        return new SessionContext(req.user.adminId, req.user.username, req.clientIp, req.user.role);
    }
    list = async (req, res) => {
        // Memanggil method overload cariPengeluaran() dengan parameter query
        const { data, meta } = await this.pengeluaranService.cariPengeluaran(req.validated.query);
        sendPaginated(res, data, meta, 'Daftar pengeluaran berhasil dimuat');
    };
    create = async (req, res) => {
        const session = this.extractSession(req);
        const data = await this.pengeluaranService.createPengeluaran(req.validated.body, session);
        sendSuccess(res, data, 'Pengeluaran berhasil dicatat', 201);
    };
}
export const pengeluaranController = new PengeluaranController();
export const list = pengeluaranController.list;
export const create = pengeluaranController.create;
//# sourceMappingURL=pengeluaran.controller.js.map