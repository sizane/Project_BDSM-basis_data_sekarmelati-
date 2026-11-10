import { Router } from 'express';
import {
    handleListPesanan,
    handleCreatePesanan,
    handleGetDetailPesanan,
    handleCreatePembayaran,
} from './pesanan.controller';
import { authenticate } from '../../middlewares/authenticate';
import { checkRole } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { ROLES } from '../../constants/roles';
import {
    listPesananQuerySchema,
    pesananIdParamSchema,
    createPesananSchema,
    createPembayaranSchema,
} from './pesanan.schema';

const router = Router();

// Semua endpoint /pesanan memerlukan JWT & role Pemilik atau Admin
router.use(authenticate, checkRole(ROLES.PEMILIK, ROLES.ADMIN));

router.get('/', validate(listPesananQuerySchema, 'query'), handleListPesanan);
router.post('/', validate(createPesananSchema, 'body'), handleCreatePesanan);
router.get('/:id', validate(pesananIdParamSchema, 'params'), handleGetDetailPesanan);
router.post(
    '/:id/pembayaran',
    validate(pesananIdParamSchema, 'params'),
    validate(createPembayaranSchema, 'body'),
    handleCreatePembayaran
);

export default router;