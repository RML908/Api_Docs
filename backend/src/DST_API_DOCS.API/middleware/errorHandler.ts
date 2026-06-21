import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../DST_API_DOCS.Infrastructure/logging/Logger';
import { failure } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    res.status(400).json(failure(errors, 'Validation failed'));
    return;
  }

  if (err instanceof Error) {
    const statusCode = (err as any).statusCode ?? 500;
    const isOperational = statusCode < 500;

    if (!isOperational) {
      logger.error({ err, url: req.url, method: req.method }, 'Unhandled server error');
    }

    const message = isOperational ? err.message : 'Internal server error';
    res.status(statusCode).json(failure([message], message));
    return;
  }

  logger.error({ err }, 'Unknown error type');
  res.status(500).json(failure(['Internal server error'], 'Internal server error'));
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(failure([`Route ${req.method} ${req.path} not found`], 'Not found'));
}
