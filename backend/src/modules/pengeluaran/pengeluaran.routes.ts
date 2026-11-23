import { Router } from 'express';
import { ROLES } from '../../constants/roles';
import { checkRole } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import * as controller from './pengeluaran.controller';
import { createPengeluaranBody, listPengeluaranQuery } from './pengeluaran.schema';

const router = Router();
const semuaRole = checkRole(ROLES.PEMILIK, ROLES.ADMIN);

router.get('/', semuaRole, validate({ query: listPengeluaranQuery }), controller.list);
router.post('/', semuaRole, validate({ body: createPengeluaranBody }), controller.create);

export default router;
