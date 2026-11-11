import { Router } from 'express';
import { ROLES } from '../../constants/roles';
import { checkRole } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import * as controller from './pesanan.controller';
import { catatPembayaranBody, createPesananBody, listPesananQuery, pesananIdParams } from './pesanan.schema';

const router = Router();
const semuaRole = checkRole(ROLES.PEMILIK, ROLES.ADMIN);

router.get('/', semuaRole, validate({ query: listPesananQuery }), controller.list);
router.post('/', semuaRole, validate({ body: createPesananBody }), controller.create);
router.get('/:id', semuaRole, validate({ params: pesananIdParams }), controller.detail);
router.post(
  '/:id/pembayaran',
  semuaRole,
  validate({ params: pesananIdParams, body: catatPembayaranBody }),
  controller.catatPembayaran,
);

export default router;
