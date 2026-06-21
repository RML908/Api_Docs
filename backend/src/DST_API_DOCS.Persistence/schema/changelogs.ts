import { pgTable, text, serial, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const changelogsTable = pgTable(
  'changelogs',
  {
    id: serial('id').primaryKey(),
    version: text('version').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
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
    index('changelogs_version_idx').on(t.version),
    index('changelogs_is_deleted_idx').on(t.isDeleted),
  ],
);

export type ChangelogRow = typeof changelogsTable.$inferSelect;
export type NewChangelog = typeof changelogsTable.$inferInsert;
