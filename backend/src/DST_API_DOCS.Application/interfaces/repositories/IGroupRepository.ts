import type { GroupRow, NewGroup } from '../../../DST_API_DOCS.Persistence/schema';

export interface IGroupRepository {
  findAll(): Promise<GroupRow[]>;
  findById(id: number): Promise<GroupRow | null>;
  create(data: Omit<NewGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroupRow>;
  update(id: number, data: Partial<NewGroup>): Promise<GroupRow | null>;
  softDelete(id: number, deletedBy?: number): Promise<boolean>;
  getMaxSortOrder(): Promise<number>;
}
