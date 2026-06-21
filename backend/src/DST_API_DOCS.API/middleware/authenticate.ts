import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '../di/container';
import { apiKeyService } from '../di/container';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();

      // Try JWT first
      try {
        const payload = jwtService.verifyAccessToken(token);
        req.user = { id: payload.sub, role: payload.role };
        next();
        return;
      } catch {
        // Not a valid JWT — try API key
      }

      // Try API key
      const keyInfo = await apiKeyService.validateApiKey(token);
      if (keyInfo) {
        req.user = { id: 0, role: 'admin' }; // API keys are admin-level
        next();
        return;
      }
    }
  }

  res.status(401).json({ success: false, message: 'Unauthorized', data: null, errors: ['Authentication required'] });
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const payload = jwtService.verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // Ignore — optional
    }
  }
  next();
}
