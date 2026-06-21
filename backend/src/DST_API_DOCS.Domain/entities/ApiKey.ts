import type { BaseEntity } from './BaseEntity';

export interface ApiKey extends BaseEntity {
  name: string;
  keyHash: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdBy: number | null;
}
