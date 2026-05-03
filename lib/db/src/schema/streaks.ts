import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const studyStreaksTable = pgTable("study_streaks", {
  userId: text("user_id").primaryKey(),
  currentStreak: integer("current_streak").notNull().default(1),
  longestStreak: integer("longest_streak").notNull().default(1),
  lastActivityDate: text("last_activity_date").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StudyStreak = typeof studyStreaksTable.$inferSelect;
