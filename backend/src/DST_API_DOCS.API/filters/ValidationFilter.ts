import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { failure } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      res.status(400).json(failure(errors, 'Validation failed'));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      res.status(400).json(failure(errors, 'Validation failed'));
      return;
    }
    (req as any).validatedQuery = result.data;
    next();
  };
}
