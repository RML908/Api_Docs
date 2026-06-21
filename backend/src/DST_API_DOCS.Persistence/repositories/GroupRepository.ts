import { eq, asc, and, isNull } from 'drizzle-orm';
import { db } from '../context/DatabaseContext';
import { groupsTable, type GroupRow, type NewGroup } from '../schema';
import type { IGroupRepository } from '../../DST_API_DOCS.Application/interfaces/repositories/IGroupRepository';

export class GroupRepository implements IGroupRepository {
  async findAll(): Promise<GroupRow[]> {
    return db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.isDeleted, false))
      .orderBy(asc(groupsTable.sortOrder), asc(groupsTable.createdAt));
  }

  async findById(id: number): Promise<GroupRow | null> {
    const [row] = await db
      .select()
      .from(groupsTable)
      .where(and(eq(groupsTable.id, id), eq(groupsTable.isDeleted, false)));
    return row ?? null;
  }

  async create(data: Omit<NewGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroupRow> {
    const [row] = await db.insert(groupsTable).values(data).returning();
    return row!;
  }

  async update(id: number, data: Partial<NewGroup>): Promise<GroupRow | null> {
    const [row] = await db
      .update(groupsTable)
      .set(data)
      .where(and(eq(groupsTable.id, id), eq(groupsTable.isDeleted, false)))
      .returning();
    return row ?? null;
  }

  async softDelete(id: number, deletedBy?: number): Promise<boolean> {
    const [row] = await db
      .update(groupsTable)
      .set({ isDeleted: true, deletedAt: new Date(), updatedBy: deletedBy ?? null })
      .where(and(eq(groupsTable.id, id), eq(groupsTable.isDeleted, false)))
      .returning({ id: groupsTable.id });
    return !!row;
  }

  async getMaxSortOrder(): Promise<number> {
    const rows = await db
      .select({ sortOrder: groupsTable.sortOrder })
      .from(groupsTable)
      .where(eq(groupsTable.isDeleted, false))
      .orderBy(asc(groupsTable.sortOrder));
    return rows.length > 0 ? Math.max(...rows.map((r) => r.sortOrder)) : -1;
  }
}
