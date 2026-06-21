import type { BaseEntity, SoftDeletable, Auditable } from './BaseEntity';

export interface Group extends BaseEntity, SoftDeletable, Auditable {
  name: string;
  description: string | null;
  icon: string;
  sortOrder: number;
}
