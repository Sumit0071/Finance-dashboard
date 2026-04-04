import { Router } from 'express';
import { usersController } from './users.controller';
import { validate } from '../../middleware/validate';
import { updateUserSchema, listUsersQuerySchema, userIdParamSchema } from './users.validation';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

// All user management routes require ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// GET /api/users — List users with pagination and filters
router.get(
  '/',
  validate({ query: listUsersQuerySchema }),
  usersController.listUsers
);

// GET /api/users/:id — Get user details
router.get(
  '/:id',
  validate({ params: userIdParamSchema }),
  usersController.getUserById
);

// PATCH /api/users/:id — Update user role/status/name
router.patch(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  usersController.updateUser
);

// DELETE /api/users/:id — Soft-delete user
router.delete(
  '/:id',
  validate({ params: userIdParamSchema }),
  usersController.deleteUser
);

export default router;
