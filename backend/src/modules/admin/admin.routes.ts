import { Router } from 'express';
import { ROLES } from '../../constants/roles';
import { checkRole } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import * as controller from './admin.controller';
import { adminIdParams, createAdminBody, listAdminsQuery, updateRoleBody } from './admin.schema';

const router = Router();

// TSD 3.2: GET /admins = Admin+, POST /admins & PATCH role = SuperAdmin (Pemilik), GET /admins/:id = JWT
router.get('/', checkRole(ROLES.PEMILIK, ROLES.ADMIN), validate({ query: listAdminsQuery }), controller.list);
router.post('/', checkRole(ROLES.PEMILIK), validate({ body: createAdminBody }), controller.create);
router.get('/:id', validate({ params: adminIdParams }), controller.detail);
router.patch(
  '/:id/role',
  checkRole(ROLES.PEMILIK),
  validate({ params: adminIdParams, body: updateRoleBody }),
  controller.updateRole,
);

export default router;
