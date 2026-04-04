import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.validation';
import { authenticate } from '../../middleware/auth';
import { rateLimit } from '../../middleware/rateLimit';
import { config } from '../../config';

const router = Router();

// Rate limit auth endpoints more strictly
const authRateLimit = rateLimit(config.rateLimit.authMaxRequests, config.rateLimit.windowMs);

// POST /api/auth/register — Register a new user
router.post(
  '/register',
  authRateLimit,
  validate({ body: registerSchema }),
  authController.register
);

// POST /api/auth/login — Login and get JWT
router.post(
  '/login',
  authRateLimit,
  validate({ body: loginSchema }),
  authController.login
);

// GET /api/auth/profile — Get current user profile
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

export default router;
