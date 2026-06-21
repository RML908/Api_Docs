import type { BaseEntity, SoftDeletable, Auditable } from './BaseEntity';

export interface Changelog extends BaseEntity, SoftDeletable, Auditable {
  version: string;
  title: string;
  content: string;
  publishedAt: Date | null;
}
