import { pgTable, text, serial, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const apiKeysTable = pgTable(
  'api_keys',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    keyHash: text('key_hash').notNull().unique(),
    keyPrefix: text('key_prefix').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdBy: integer('created_by').references(() => usersTable.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('api_keys_is_active_idx').on(t.isActive)],
);

export type ApiKeyRow = typeof apiKeysTable.$inferSelect;
export type NewApiKey = typeof apiKeysTable.$inferInsert;
