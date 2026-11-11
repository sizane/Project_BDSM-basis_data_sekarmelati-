import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import * as controller from './auth.controller';
import { loginBody } from './auth.schema';

const router = Router();

// Public (AC-04: satu-satunya endpoint tanpa JWT)
router.post('/login', validate({ body: loginBody }), controller.login);

// JWT wajib
router.post('/logout', authenticate, controller.logout);

export default router;
