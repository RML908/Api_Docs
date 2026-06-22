import type { Request, Response, NextFunction } from 'express';

export function publicCache(maxAgeSeconds: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`);
    next();
  };
}
