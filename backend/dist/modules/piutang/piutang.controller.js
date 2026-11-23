import { sendPaginated } from '../../utils/response';
import * as piutangService from './piutang.service';
export async function list(req, res) {
    const { data, meta } = await piutangService.listPiutang(req.validated.query);
    sendPaginated(res, data, meta, data.length === 0 ? 'Tidak ada piutang aktif saat ini' : 'Daftar piutang berhasil dimuat');
}
//# sourceMappingURL=piutang.controller.js.map