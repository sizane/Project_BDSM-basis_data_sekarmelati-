import { Router, type RequestHandler } from 'express';
import { ROLES } from '../../constants/roles';
import { checkRole } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import * as controller from './laporan.controller';
import { exportParams, exportQuery, labaRugiQuery, levelUtangQuery } from './laporan.schema';

const router = Router();

const semuaRole = checkRole(ROLES.PEMILIK, ROLES.ADMIN);
const hanyaPemilik = checkRole(ROLES.PEMILIK);

// Ekspor: laba-rugi = Pemilik & Admin, level-utang = Pemilik saja (RBAC Matrix FSD 4.3)
const authorizeExport: RequestHandler = (req, res, next) =>
  req.params.jenis === 'level-utang' ? hanyaPemilik(req, res, next) : semuaRole(req, res, next);

router.get('/laba-rugi', semuaRole, validate({ query: labaRugiQuery }), controller.labaRugi);
router.get('/level-utang', hanyaPemilik, validate({ query: levelUtangQuery }), controller.levelUtang);
router.get(
  '/:jenis/export',
  authorizeExport,
  validate({ params: exportParams, query: exportQuery }),
  controller.exportPdf,
);

export default router;
