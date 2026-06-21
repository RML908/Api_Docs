import { eq, asc, and, ilike, type SQL } from 'drizzle-orm';
import { db } from '../context/DatabaseContext';
import { endpointsTable, type EndpointRow, type NewEndpoint } from '../schema';
import type { IEndpointRepository } from '../../DST_API_DOCS.Application/interfaces/repositories/IEndpointRepository';
import type { EndpointFilterOptions } from '../../DST_API_DOCS.Application/interfaces/repositories/IEndpointRepository';

export class EndpointRepository implements IEndpointRepository {
  async findAll(filters?: EndpointFilterOptions): Promise<EndpointRow[]> {
    const conditions: SQL[] = [eq(endpointsTable.isDeleted, false)];

    if (filters?.groupId !== undefined) conditions.push(eq(endpointsTable.groupId, filters.groupId));
    if (filters?.status) conditions.push(eq(endpointsTable.status, filters.status));
    if (filters?.version) conditions.push(eq(endpointsTable.version, filters.version));
    if (filters?.search) conditions.push(ilike(endpointsTable.summary, `%${filters.search}%`));

    return db
      .select()
      .from(endpointsTable)
      .where(and(...conditions))
      .orderBy(asc(endpointsTable.sortOrder), asc(endpointsTable.createdAt));
  }

  async findById(id: number): Promise<EndpointRow | null> {
    const [row] = await db
      .select()
      .from(endpointsTable)
      .where(and(eq(endpointsTable.id, id), eq(endpointsTable.isDeleted, false)));
    return row ?? null;
  }

  async findByGroupId(groupId: number): Promise<EndpointRow[]> {
    return db
      .select()
      .from(endpointsTable)
      .where(and(eq(endpointsTable.groupId, groupId), eq(endpointsTable.isDeleted, false)))
      .orderBy(asc(endpointsTable.sortOrder));
  }

  async create(data: Omit<NewEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<EndpointRow> {
    const [row] = await db.insert(endpointsTable).values(data).returning();
    return row!;
  }

  async update(id: number, data: Partial<NewEndpoint>): Promise<EndpointRow | null> {
    const [row] = await db
      .update(endpointsTable)
      .set(data)
      .where(and(eq(endpointsTable.id, id), eq(endpointsTable.isDeleted, false)))
      .returning();
    return row ?? null;
  }

  async softDelete(id: number, deletedBy?: number): Promise<boolean> {
    const [row] = await db
      .update(endpointsTable)
      .set({ isDeleted: true, deletedAt: new Date(), updatedBy: deletedBy ?? null })
      .where(and(eq(endpointsTable.id, id), eq(endpointsTable.isDeleted, false)))
      .returning({ id: endpointsTable.id });
    return !!row;
  }

  async getMaxSortOrderByGroup(groupId: number): Promise<number> {
    const rows = await db
      .select({ sortOrder: endpointsTable.sortOrder })
      .from(endpointsTable)
      .where(and(eq(endpointsTable.groupId, groupId), eq(endpointsTable.isDeleted, false)));
    return rows.length > 0 ? Math.max(...rows.map((r) => r.sortOrder)) : -1;
  }

  async countByStatus(): Promise<Record<string, number>> {
    const { count, eq } = await import('drizzle-orm');
    const rows = await db
      .select({ status: endpointsTable.status, count: count() })
      .from(endpointsTable)
      .where(eq(endpointsTable.isDeleted, false))
      .groupBy(endpointsTable.status);
    return Object.fromEntries(rows.map((r) => [r.status, r.count]));
  }

  async countTotal(): Promise<number> {
    const { count } = await import('drizzle-orm');
    const [row] = await db
      .select({ total: count() })
      .from(endpointsTable)
      .where(eq(endpointsTable.isDeleted, false));
    return row?.total ?? 0;
  }
}
