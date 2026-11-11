import type { Request, Response } from 'express';
import { sendPaginated, sendSuccess } from '../../utils/response';
import type { CreateAdminBody, ListAdminsQuery, UpdateRoleBody } from './admin.schema';
import * as adminService from './admin.service';

export async function list(req: Request, res: Response): Promise<void> {
  const { data, meta } = await adminService.listAdmins(req.validated.query as ListAdminsQuery);
  sendPaginated(res, data, meta, 'Daftar admin berhasil dimuat');
}

export async function detail(req: Request, res: Response): Promise<void> {
  const data = await adminService.getAdmin(req, req.validated.params.id as string);
  sendSuccess(res, data, 'Detail admin berhasil dimuat');
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = await adminService.createAdmin(req, req.validated.body as CreateAdminBody);
  sendSuccess(res, data, 'Admin berhasil dibuat', 201);
}

export async function updateRole(req: Request, res: Response): Promise<void> {
  const { role } = req.validated.body as UpdateRoleBody;
  const data = await adminService.updateRole(req, req.validated.params.id as string, role);
  sendSuccess(res, data, 'Role berhasil diubah');
}
