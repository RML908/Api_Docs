import jwt from 'jsonwebtoken';
import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../../DST_API_DOCS.Domain/constants/DomainConstants';

export interface JwtPayload {
  sub: number;   // user id
  role: string;
  type: 'access' | 'refresh';
}

export class JwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.accessSecret = process.env['JWT_ACCESS_SECRET'] ?? '';
    this.refreshSecret = process.env['JWT_REFRESH_SECRET'] ?? '';

    if (!this.accessSecret || !this.refreshSecret) {
      throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set');
    }
  }

  generateAccessToken(userId: number, role: string): string {
    return jwt.sign({ sub: userId, role, type: 'access' }, this.accessSecret, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
  }

  generateRefreshToken(userId: number, role: string): string {
    return jwt.sign({ sub: userId, role, type: 'refresh' }, this.refreshSecret, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessSecret) as unknown as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as unknown as JwtPayload;
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as unknown as JwtPayload;
    } catch {
      return null;
    }
  }
}
