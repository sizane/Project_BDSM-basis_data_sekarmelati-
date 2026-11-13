import { Router } from 'express';
import { ROLES } from '../../constants/roles';
import { checkRole } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import * as controller from './piutang.controller';
import { listPiutangQuery } from './piutang.schema';

const router = Router();

router.get('/', checkRole(ROLES.PEMILIK, ROLES.ADMIN), validate({ query: listPiutangQuery }), controller.list);

export default router;
