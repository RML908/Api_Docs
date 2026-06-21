import { randomBytes, createHash } from 'node:crypto';
import type { IApiKeyRepository } from '../interfaces/repositories/IApiKeyRepository';
import type { CreateApiKeyDto, ApiKeyResponseDto, CreatedApiKeyResponseDto } from '../dtos/api-keys/ApiKeyDtos';
import { API_KEY_PREFIX } from '../../DST_API_DOCS.Domain/constants/DomainConstants';

function toDto(row: { id: number; name: string; keyPrefix: string; isActive: boolean; lastUsedAt: Date | null; createdAt: Date }): ApiKeyResponseDto {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.keyPrefix,
    isActive: row.isActive,
    lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class ApiKeyService {
  constructor(private readonly apiKeyRepo: IApiKeyRepository) {}

  async listApiKeys(): Promise<ApiKeyResponseDto[]> {
    const rows = await this.apiKeyRepo.findAll();
    return rows.map(toDto);
  }

  async createApiKey(dto: CreateApiKeyDto, userId?: number): Promise<CreatedApiKeyResponseDto> {
    const raw = API_KEY_PREFIX + randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(raw).digest('hex');
    const prefix = raw.slice(0, API_KEY_PREFIX.length + 8);

    const row = await this.apiKeyRepo.create({
      name: dto.name,
      keyHash: hash,
      keyPrefix: prefix,
      isActive: true,
      lastUsedAt: null,
      createdBy: userId ?? null,
    });

    return { ...toDto(row), key: raw };
  }

  async revokeApiKey(id: number): Promise<void> {
    const ok = await this.apiKeyRepo.revoke(id);
    if (!ok) throw Object.assign(new Error('API key not found'), { statusCode: 404 });
  }

  async deleteApiKey(id: number): Promise<void> {
    const ok = await this.apiKeyRepo.delete(id);
    if (!ok) throw Object.assign(new Error('API key not found'), { statusCode: 404 });
  }

  async validateApiKey(rawKey: string): Promise<{ id: number; name: string } | null> {
    const hash = createHash('sha256').update(rawKey).digest('hex');
    const key = await this.apiKeyRepo.findByHash(hash);
    if (!key || !key.isActive) return null;
    await this.apiKeyRepo.updateLastUsed(key.id);
    return { id: key.id, name: key.name };
  }
}
