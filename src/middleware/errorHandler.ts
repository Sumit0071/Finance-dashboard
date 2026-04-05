/**
 * Global error handling middleware.
 * Catches all errors and returns a standardized error response.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Always log standard errors for Docker to capture, but only include stack trace in development
  console.error('🔴 Error:', {
    name: err.name,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  // Handle Prisma-specific errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    switch (prismaErr.code) {
      case 'P2002':
        sendError(
          res,
          `A record with this ${prismaErr.meta?.target?.join(', ') || 'value'} already exists`,
          409,
          'DUPLICATE_ENTRY'
        );
        return;
      case 'P2025':
        sendError(res, 'Record not found', 404, 'NOT_FOUND');
        return;
      default:
        sendError(res, 'Database error', 500, 'DATABASE_ERROR');
        return;
    }
  }

  if (err.constructor.name === 'PrismaClientValidationError') {
    sendError(res, 'Invalid data provided', 422, 'VALIDATION_ERROR');
    return;
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 'Invalid JSON in request body', 400, 'INVALID_JSON');
    return;
  }

  // Fallback — unknown errors
  sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    500,
    'INTERNAL_ERROR'
  );
}
