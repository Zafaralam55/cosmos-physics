import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const doubtsTable = pgTable("doubts", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  text: text("text").notNull(),
  photoUrl: text("photo_url"),
  status: text("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doubtRepliesTable = pgTable("doubt_replies", {
  id: text("id").primaryKey(),
  doubtId: text("doubt_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  role: text("role").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Doubt = typeof doubtsTable.$inferSelect;
export type DoubtReply = typeof doubtRepliesTable.$inferSelect;
