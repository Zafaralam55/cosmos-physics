import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const quizScoresTable = pgTable("quiz_scores", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  level: text("level").default("").notNull(),
  quizId: text("quiz_id").notNull(),
  quizTitle: text("quiz_title").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  takenAt: timestamp("taken_at").defaultNow().notNull(),
});

export type QuizScoreRow = typeof quizScoresTable.$inferSelect;
export type InsertQuizScore = typeof quizScoresTable.$inferInsert;
