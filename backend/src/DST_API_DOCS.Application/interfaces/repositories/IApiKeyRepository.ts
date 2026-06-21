import type { ApiKeyRow, NewApiKey } from '../../../DST_API_DOCS.Persistence/schema';

export interface IApiKeyRepository {
  findAll(): Promise<Omit<ApiKeyRow, 'keyHash'>[]>;
  findByHash(keyHash: string): Promise<ApiKeyRow | null>;
  create(data: Omit<NewApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKeyRow>;
  revoke(id: number): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  updateLastUsed(id: number): Promise<void>;
}
