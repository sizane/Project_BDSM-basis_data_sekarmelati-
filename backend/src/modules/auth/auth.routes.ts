// --- backend/src/modules/auth/auth.routes.ts ---
import { Router } from 'express';
import { handleLogin, handleLogout } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { loginSchema } from './auth.schema';

const router = Router();

router.post('/login', validate(loginSchema), handleLogin);
router.post('/logout', authenticate, handleLogout);

export default router;