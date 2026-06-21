import type { EndpointRow, NewEndpoint } from '../../../DST_API_DOCS.Persistence/schema';

export interface EndpointFilterOptions {
  groupId?: number;
  status?: string;
  version?: string;
  search?: string;
}

export interface IEndpointRepository {
  findAll(filters?: EndpointFilterOptions): Promise<EndpointRow[]>;
  findById(id: number): Promise<EndpointRow | null>;
  findByGroupId(groupId: number): Promise<EndpointRow[]>;
  create(data: Omit<NewEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<EndpointRow>;
  update(id: number, data: Partial<NewEndpoint>): Promise<EndpointRow | null>;
  softDelete(id: number, deletedBy?: number): Promise<boolean>;
  getMaxSortOrderByGroup(groupId: number): Promise<number>;
  countByStatus(): Promise<Record<string, number>>;
  countTotal(): Promise<number>;
}
