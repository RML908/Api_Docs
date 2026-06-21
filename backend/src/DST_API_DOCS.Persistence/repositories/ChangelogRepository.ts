import { eq, desc, and } from 'drizzle-orm';
import { db } from '../context/DatabaseContext';
import { changelogsTable, type ChangelogRow, type NewChangelog } from '../schema';
import type { IChangelogRepository } from '../../DST_API_DOCS.Application/interfaces/repositories/IChangelogRepository';

export class ChangelogRepository implements IChangelogRepository {
  async findAll(version?: string): Promise<ChangelogRow[]> {
    const rows = await db
      .select()
      .from(changelogsTable)
      .where(eq(changelogsTable.isDeleted, false))
      .orderBy(desc(changelogsTable.createdAt));

    if (version) return rows.filter((r) => r.version === version);
    return rows;
  }

  async findById(id: number): Promise<ChangelogRow | null> {
    const [row] = await db
      .select()
      .from(changelogsTable)
      .where(and(eq(changelogsTable.id, id), eq(changelogsTable.isDeleted, false)));
    return row ?? null;
  }

  async create(data: Omit<NewChangelog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChangelogRow> {
    const [row] = await db.insert(changelogsTable).values(data).returning();
    return row!;
  }

  async update(id: number, data: Partial<NewChangelog>): Promise<ChangelogRow | null> {
    const [row] = await db
      .update(changelogsTable)
      .set(data)
      .where(and(eq(changelogsTable.id, id), eq(changelogsTable.isDeleted, false)))
      .returning();
    return row ?? null;
  }

  async softDelete(id: number, deletedBy?: number): Promise<boolean> {
    const [row] = await db
      .update(changelogsTable)
      .set({ isDeleted: true, deletedAt: new Date(), updatedBy: deletedBy ?? null })
      .where(and(eq(changelogsTable.id, id), eq(changelogsTable.isDeleted, false)))
      .returning({ id: changelogsTable.id });
    return !!row;
  }
}
