/**
 * Role-Based Access Control (RBAC) middleware.
 * Restricts endpoint access to users with specific roles.
 * Also checks that the user's account is active.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import prisma from '../config/database';

// Role hierarchy: ADMIN > ANALYST > VIEWER
const ROLE_HIERARCHY: Record<string, number> = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

/**
 * Requires exact role match — user must have one of the specified roles.
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required');
      }

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true, status: true, deleted: true },
      });

      if (!user || user.deleted) {
        throw AppError.unauthorized('User account not found');
      }

      if (user.status !== 'ACTIVE') {
        throw AppError.forbidden('User account is inactive');
      }

      if (!allowedRoles.includes(user.role)) {
        throw AppError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${user.role}`
        );
      }

      // Update the role in case it was changed since token was issued
      req.user.role = user.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Requires minimum role level — uses role hierarchy.
 * e.g., requireMinRole('ANALYST') allows ANALYST and ADMIN.
 */
export function requireMinRole(minRole: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true, status: true, deleted: true },
      });

      if (!user || user.deleted) {
        throw AppError.unauthorized('User account not found');
      }

      if (user.status !== 'ACTIVE') {
        throw AppError.forbidden('User account is inactive');
      }

      const userLevel = ROLE_HIERARCHY[user.role] || 0;
      const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

      if (userLevel < requiredLevel) {
        throw AppError.forbidden(
          `Access denied. Minimum required role: ${minRole}. Your role: ${user.role}`
        );
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}
