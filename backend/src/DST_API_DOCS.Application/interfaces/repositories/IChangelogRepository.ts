import type { ChangelogRow, NewChangelog } from '../../../DST_API_DOCS.Persistence/schema';

export interface IChangelogRepository {
  findAll(version?: string): Promise<ChangelogRow[]>;
  findById(id: number): Promise<ChangelogRow | null>;
  create(data: Omit<NewChangelog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChangelogRow>;
  update(id: number, data: Partial<NewChangelog>): Promise<ChangelogRow | null>;
  softDelete(id: number, deletedBy?: number): Promise<boolean>;
}
