/**
 * Authentication middleware.
 * Extracts and verifies JWT from the Authorization header.
 * Attaches the decoded user payload to req.user.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../utils/errors';
import prisma from '../config/database';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header. Expected: Bearer <token>');
    }

    let token = authHeader.split(' ')[1];

    if (!token) {
      throw AppError.unauthorized('Token not provided');
    }

    // Strip surrounding quotes if the user accidentally included them
    token = token.replace(/(^"|"$)/g, '').replace(/(^'|'$)/g, '');

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized('Token has expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized(`Invalid token: ${error.message}`));
      return;
    }
    next(AppError.unauthorized('Authentication failed'));
  }
}

/**
 * Optional auth — attaches user if token is present, but doesn't fail if missing.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    let token = authHeader.split(' ')[1];
    if (!token) return next();

    // Strip surrounding quotes if the user accidentally included them
    token = token.replace(/(^"|"$)/g, '').replace(/(^'|'$)/g, '');

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    // Silently continue without user context
    next();
  }
}
