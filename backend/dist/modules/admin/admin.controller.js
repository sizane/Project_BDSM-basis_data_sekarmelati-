import { sendPaginated, sendSuccess } from '../../utils/response';
import * as adminService from './admin.service';
/**
 * AdminController: Controller berbasis OOP untuk modul Admin.
 */
export class AdminController {
    list = async (req, res) => {
        const { data, meta } = await adminService.listAdmins(req.validated.query);
        sendPaginated(res, data, meta, 'Daftar admin berhasil dimuat');
    };
    detail = async (req, res) => {
        const data = await adminService.getAdmin(req, req.validated.params.id);
        sendSuccess(res, data, 'Detail admin berhasil dimuat');
    };
    create = async (req, res) => {
        const data = await adminService.createAdmin(req, req.validated.body);
        sendSuccess(res, data, 'Admin berhasil dibuat', 201);
    };
    updateRole = async (req, res) => {
        const { role } = req.validated.body;
        const data = await adminService.updateRole(req, req.validated.params.id, role);
        sendSuccess(res, data, 'Role berhasil diubah');
    };
}
export const adminController = new AdminController();
export const list = adminController.list;
export const detail = adminController.detail;
export const create = adminController.create;
export const updateRole = adminController.updateRole;
//# sourceMappingURL=admin.controller.js.map