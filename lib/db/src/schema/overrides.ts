import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const contentOverridesTable = pgTable("content_overrides", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  action: text("action").notNull(),
  sourceId: text("source_id"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContentOverride = typeof contentOverridesTable.$inferSelect;
