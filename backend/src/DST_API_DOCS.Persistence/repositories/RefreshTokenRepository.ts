import { eq, and, lt } from 'drizzle-orm';
import { db } from '../context/DatabaseContext';
import { refreshTokensTable, type RefreshTokenRow, type NewRefreshToken } from '../schema';
import type { IRefreshTokenRepository } from '../../DST_API_DOCS.Application/interfaces/repositories/IRefreshTokenRepository';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async findByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const [row] = await db
      .select()
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.tokenHash, tokenHash));
    return row ?? null;
  }

  async create(data: Omit<NewRefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefreshTokenRow> {
    const [row] = await db.insert(refreshTokensTable).values(data).returning();
    return row!;
  }

  async revoke(id: number, replacedByHash?: string): Promise<void> {
    await db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date(), replacedByTokenHash: replacedByHash ?? null })
      .where(eq(refreshTokensTable.id, id));
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokensTable.userId, userId)));
  }

  async deleteExpired(): Promise<void> {
    await db
      .delete(refreshTokensTable)
      .where(lt(refreshTokensTable.expiresAt, new Date()));
  }
}
