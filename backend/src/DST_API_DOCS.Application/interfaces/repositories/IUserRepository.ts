import type { UserRow, NewUser } from '../../../DST_API_DOCS.Persistence/schema';

export interface IUserRepository {
  findById(id: number): Promise<UserRow | null>;
  findByUsername(username: string): Promise<UserRow | null>;
  findByEmail(email: string): Promise<UserRow | null>;
  create(data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRow>;
  updateLastLogin(id: number): Promise<void>;
}
