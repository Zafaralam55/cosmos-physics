import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const contentHistoryTable = pgTable("content_history", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  itemId: text("item_id").notNull(),
  overrideId: text("override_id").notNull(),
  data: jsonb("data").notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContentHistory = typeof contentHistoryTable.$inferSelect;
