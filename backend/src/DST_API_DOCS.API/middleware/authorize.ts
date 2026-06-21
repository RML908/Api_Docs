import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../DST_API_DOCS.Domain/enums/UserRole';

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', data: null, errors: ['Authentication required'] });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ success: false, message: 'Forbidden', data: null, errors: ['Insufficient permissions'] });
      return;
    }

    next();
  };
}

export const requireAdmin = authorize(UserRole.ADMIN);
