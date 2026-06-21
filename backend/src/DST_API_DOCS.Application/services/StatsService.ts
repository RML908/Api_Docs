import type { IEndpointRepository } from '../interfaces/repositories/IEndpointRepository';
import type { IGroupRepository } from '../interfaces/repositories/IGroupRepository';
import { count, eq } from 'drizzle-orm';
import { db } from '../../DST_API_DOCS.Persistence/context/DatabaseContext';
import { groupsTable } from '../../DST_API_DOCS.Persistence/schema';

export interface StatsDto {
  total: number;
  published: number;
  draft: number;
  deprecated: number;
  groups: number;
}

export class StatsService {
  constructor(
    private readonly endpointRepo: IEndpointRepository,
  ) {}

  async getStats(): Promise<StatsDto> {
    const [total, statusCounts, [groupCount]] = await Promise.all([
      this.endpointRepo.countTotal(),
      this.endpointRepo.countByStatus(),
      db.select({ count: count() }).from(groupsTable).where(eq(groupsTable.isDeleted, false)),
    ]);

    return {
      total,
      published: statusCounts['published'] ?? 0,
      draft: statusCounts['draft'] ?? 0,
      deprecated: statusCounts['deprecated'] ?? 0,
      groups: groupCount?.count ?? 0,
    };
  }
}
