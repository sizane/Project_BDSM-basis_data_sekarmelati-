import { Router } from 'express';
import { ROLES } from '../../constants/roles';
import { checkRole } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import * as controller from './audit.controller';
import { listAuditLogsQuery } from './audit.schema';

const router = Router();

// FSD-2.13 / BR-30: hanya Pemilik. Admin yang memaksa akses -> 403 + tercatat ACCESS_DENIED (BR-31).
router.get('/', checkRole(ROLES.PEMILIK), validate({ query: listAuditLogsQuery }), controller.list);

export default router;
