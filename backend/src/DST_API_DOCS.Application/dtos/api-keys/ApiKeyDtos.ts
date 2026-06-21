import { z } from 'zod';

export const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export type CreateApiKeyDto = z.infer<typeof CreateApiKeySchema>;

export interface ApiKeyResponseDto {
  id: number;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreatedApiKeyResponseDto extends ApiKeyResponseDto {
  key: string; // Only returned once on creation
}
