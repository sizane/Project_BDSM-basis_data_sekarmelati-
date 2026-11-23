import { sendSuccess } from '../../utils/response';
import * as dashboardService from './dashboard.service';
export async function summary(_req, res) {
    sendSuccess(res, await dashboardService.getSummary(), 'Data dashboard berhasil dimuat');
}
//# sourceMappingURL=dashboard.controller.js.map