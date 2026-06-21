import type { RefreshTokenRow, NewRefreshToken } from '../../../DST_API_DOCS.Persistence/schema';

export interface IRefreshTokenRepository {
  findByHash(tokenHash: string): Promise<RefreshTokenRow | null>;
  create(data: Omit<NewRefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefreshTokenRow>;
  revoke(id: number, replacedByHash?: string): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
  deleteExpired(): Promise<void>;
}
