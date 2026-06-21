import type { Request, Response, NextFunction } from "express";

export function requireSessionAuth(req: Request, res: Response, next: NextFunction): void {
  if ((req.session as any)?.admin === true) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized — session required" });
}
