import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const changelogsTable = pgTable("changelogs", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChangelogSchema = createInsertSchema(changelogsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChangelog = z.infer<typeof insertChangelogSchema>;
export type Changelog = typeof changelogsTable.$inferSelect;
