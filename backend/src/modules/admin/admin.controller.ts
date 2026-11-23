import type { Request, Response } from 'express';
import { sendPaginated, sendSuccess } from '../../utils/response';
import type { CreateAdminBody, ListAdminsQuery, UpdateRoleBody } from './admin.schema';
import * as adminService from './admin.service';

/**
 * AdminController: Controller berbasis OOP untuk modul Admin.
 */
export class AdminController {
  public list = async (req: Request, res: Response): Promise<void> => {
    const { data, meta } = await adminService.listAdmins(req.validated.query as ListAdminsQuery);
    sendPaginated(res, data, meta, 'Daftar admin berhasil dimuat');
  };

  public detail = async (req: Request, res: Response): Promise<void> => {
    const data = await adminService.getAdmin(req, req.validated.params.id as string);
    sendSuccess(res, data, 'Detail admin berhasil dimuat');
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const data = await adminService.createAdmin(req, req.validated.body as CreateAdminBody);
    sendSuccess(res, data, 'Admin berhasil dibuat', 201);
  };

  public updateRole = async (req: Request, res: Response): Promise<void> => {
    const { role } = req.validated.body as UpdateRoleBody;
    const data = await adminService.updateRole(req, req.validated.params.id as string, role as 'Pemilik' | 'Admin');
    sendSuccess(res, data, 'Role berhasil diubah');
  };
}

export const adminController = new AdminController();

export const list = adminController.list;
export const detail = adminController.detail;
export const create = adminController.create;
export const updateRole = adminController.updateRole;
