import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { groupsTable } from "./groups";

export const endpointsTable = pgTable("endpoints", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groupsTable.id, { onDelete: "cascade" }),
  method: text("method").notNull().default("GET"),
  path: text("path").notNull(),
  summary: text("summary").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  version: text("version").notNull().default("v1"),
  params: text("params"),
  responseExample: text("response_example"),
  responseStatus: integer("response_status").default(200),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEndpointSchema = createInsertSchema(endpointsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEndpoint = z.infer<typeof insertEndpointSchema>;
export type Endpoint = typeof endpointsTable.$inferSelect;
