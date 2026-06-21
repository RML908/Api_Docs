import { eq, and } from 'drizzle-orm';
import { db } from '../context/DatabaseContext';
import { usersTable, type UserRow, type NewUser } from '../schema';
import type { IUserRepository } from '../../DST_API_DOCS.Application/interfaces/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<UserRow | null> {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, id), eq(usersTable.isDeleted, false)));
    return row ?? null;
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.username, username), eq(usersTable.isDeleted, false)));
    return row ?? null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), eq(usersTable.isDeleted, false)));
    return row ?? null;
  }

  async create(data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRow> {
    const [row] = await db.insert(usersTable).values(data).returning();
    return row!;
  }

  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(usersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(usersTable.id, id));
  }
}
