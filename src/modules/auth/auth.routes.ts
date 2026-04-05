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

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post(
  '/register',
  authRateLimit,
  validate({ body: registerSchema }),
  authController.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login to get access token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 */
router.post(
  '/login',
  authRateLimit,
  validate({ body: loginSchema }),
  authController.login
);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Get current logged in user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

export default router;
