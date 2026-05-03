import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const otpTokensTable = pgTable("otp_tokens", {
  id: text("id").primaryKey(),
  contact: text("contact").notNull(),
  type: text("type").notNull(),
  code: text("code").notNull(),
  role: text("role").notNull().default("student"),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OtpToken = typeof otpTokensTable.$inferSelect;
