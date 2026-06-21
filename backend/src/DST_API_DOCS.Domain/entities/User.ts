import type { BaseEntity, SoftDeletable } from './BaseEntity';
import type { UserRole } from '../enums/UserRole';

export interface User extends BaseEntity, SoftDeletable {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  lastLoginAt: Date | null;
}
