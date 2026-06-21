import { pgTable, text, serial, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { groupsTable } from './groups';
import { usersTable } from './users';

export const endpointsTable = pgTable(
  'endpoints',
  {
    id: serial('id').primaryKey(),
    groupId: integer('group_id')
      .notNull()
      .references(() => groupsTable.id, { onDelete: 'cascade' }),
    method: text('method').notNull().default('GET'),
    path: text('path').notNull(),
    summary: text('summary').notNull(),
    description: text('description'),
    status: text('status').notNull().default('draft'),
    version: text('version').notNull().default('v1'),
    params: text('params'),
    responseExample: text('response_example'),
    responseStatus: integer('response_status').default(200),
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
    index('endpoints_group_id_idx').on(t.groupId),
    index('endpoints_status_idx').on(t.status),
    index('endpoints_version_idx').on(t.version),
    index('endpoints_is_deleted_idx').on(t.isDeleted),
    index('endpoints_sort_order_idx').on(t.sortOrder),
  ],
);

export type EndpointRow = typeof endpointsTable.$inferSelect;
export type NewEndpoint = typeof endpointsTable.$inferInsert;
