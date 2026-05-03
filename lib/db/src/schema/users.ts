import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  phone: text("phone").default("").notNull(),
  subject: text("subject"),
  bio: text("bio"),
  qualification: text("qualification"),
  level: text("level"),
  subscriptionTier: text("subscription_tier").default("Free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
