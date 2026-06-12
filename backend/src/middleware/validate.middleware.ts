import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory that validates req.body against the given Zod schema.
 * Returns 400 with field-level error details on failure.
 */
export function validateBody(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const details = zodError.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data yang dikirim tidak valid',
        },
        details,
      });
      return;
    }

    // Replace req.body with the parsed (and possibly transformed) data
    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory that validates req.query against the given Zod schema.
 */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const details = zodError.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parameter query tidak valid',
        },
        details,
      });
      return;
    }

    req.query = result.data as Record<string, string>;
    next();
  };
}
