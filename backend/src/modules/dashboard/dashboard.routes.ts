import { Router } from 'express';
import { ROLES } from '../../constants/roles';
import { checkRole } from '../../middlewares/authorize';
import * as controller from './dashboard.controller';

const router = Router();

router.get('/summary', checkRole(ROLES.PEMILIK, ROLES.ADMIN), controller.summary);

export default router;
