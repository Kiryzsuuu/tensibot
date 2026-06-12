import type { RequestHandler, Request, Response, NextFunction } from 'express';
import { AppError } from '../app';

/**
 * Factory function that returns middleware which verifies the authenticated
 * user has one of the permitted roles.
 */
export function roleMiddleware(roles: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to access this resource',
          403,
          'FORBIDDEN',
        ),
      );
    }

    next();
  };
}
