import { pgTable, text, serial, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const groupsTable = pgTable(
  'groups',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon').notNull().default('📁'),
    sortOrder: integer('sort_order').notNull().default(0),
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdBy: integer('created_by').references(() => usersTable.id, { onDelete: 'set null' }),
    updatedBy: integer('updated_by').references(() => usersTable.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('groups_sort_order_idx').on(t.sortOrder),
    index('groups_is_deleted_idx').on(t.isDeleted),
  ],
);

export type GroupRow = typeof groupsTable.$inferSelect;
export type NewGroup = typeof groupsTable.$inferInsert;
