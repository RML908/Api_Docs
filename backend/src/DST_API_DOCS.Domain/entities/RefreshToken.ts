import type { BaseEntity } from './BaseEntity';

export interface RefreshToken extends BaseEntity {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenHash: string | null;
  createdByIp: string | null;
}
