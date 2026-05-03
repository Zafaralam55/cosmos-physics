import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pushTokensTable = pgTable("push_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  token: text("token").notNull().unique(),
  platform: text("platform").notNull().default("expo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PushToken = typeof pushTokensTable.$inferSelect;
