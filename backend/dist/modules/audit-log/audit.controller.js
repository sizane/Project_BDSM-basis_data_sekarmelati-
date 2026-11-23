import { sendPaginated } from '../../utils/response';
import * as auditService from './audit.service';
export async function list(req, res) {
    const query = req.validated.query;
    const { data, meta } = await auditService.listAuditLogs(query);
    sendPaginated(res, data, meta, data.length === 0
        ? 'Tidak ada riwayat aktivitas yang ditemukan pada kriteria tersebut.'
        : 'Audit log berhasil dimuat');
}
//# sourceMappingURL=audit.controller.js.map