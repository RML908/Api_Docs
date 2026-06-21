import { eq } from 'drizzle-orm';
import { db } from '../context/DatabaseContext';
import { apiKeysTable, type ApiKeyRow, type NewApiKey } from '../schema';
import type { IApiKeyRepository } from '../../DST_API_DOCS.Application/interfaces/repositories/IApiKeyRepository';

export class ApiKeyRepository implements IApiKeyRepository {
  async findAll(): Promise<Omit<ApiKeyRow, 'keyHash'>[]> {
    return db
      .select({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        keyPrefix: apiKeysTable.keyPrefix,
        isActive: apiKeysTable.isActive,
        lastUsedAt: apiKeysTable.lastUsedAt,
        createdBy: apiKeysTable.createdBy,
        createdAt: apiKeysTable.createdAt,
        updatedAt: apiKeysTable.updatedAt,
      })
      .from(apiKeysTable)
      .orderBy(apiKeysTable.createdAt);
  }

  async findByHash(keyHash: string): Promise<ApiKeyRow | null> {
    const [row] = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.keyHash, keyHash));
    return row ?? null;
  }

  async create(data: Omit<NewApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKeyRow> {
    const [row] = await db.insert(apiKeysTable).values(data).returning();
    return row!;
  }

  async revoke(id: number): Promise<boolean> {
    const [row] = await db
      .update(apiKeysTable)
      .set({ isActive: false })
      .where(eq(apiKeysTable.id, id))
      .returning({ id: apiKeysTable.id });
    return !!row;
  }

  async delete(id: number): Promise<boolean> {
    const [row] = await db
      .delete(apiKeysTable)
      .where(eq(apiKeysTable.id, id))
      .returning({ id: apiKeysTable.id });
    return !!row;
  }

  async updateLastUsed(id: number): Promise<void> {
    await db
      .update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeysTable.id, id));
  }
}
