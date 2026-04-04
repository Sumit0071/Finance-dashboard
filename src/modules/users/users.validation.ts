import { z } from 'zod';

const VALID_ROLES = ['VIEWER', 'ANALYST', 'ADMIN'] as const;
const VALID_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim()
    .optional(),
  role: z.enum(VALID_ROLES, {
    error: `Role must be one of: ${VALID_ROLES.join(', ')}`,
  }).optional(),
  status: z.enum(VALID_STATUSES, {
    error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
  }).optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  role: z.enum(VALID_ROLES).optional(),
  status: z.enum(VALID_STATUSES).optional(),
  search: z.string().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
