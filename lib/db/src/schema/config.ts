import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const appConfigTable = pgTable("app_config", {
  id: integer("id").primaryKey(),
  adminEmail: text("admin_email").notNull(),
  adminPasswordHash: text("admin_password_hash").notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull(),
});

export type AppConfig = typeof appConfigTable.$inferSelect;
