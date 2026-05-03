import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const dailyChallengesTable = pgTable("daily_challenges", {
  challengeDate: text("challenge_date").primaryKey(),
  question: text("question").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull().default("Medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyChallengeAnswersTable = pgTable("daily_challenge_answers", {
  userId: text("user_id").notNull(),
  challengeDate: text("challenge_date").notNull(),
  chosenIndex: integer("chosen_index").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  streakAtAnswer: integer("streak_at_answer").notNull().default(0),
  streakBonus: integer("streak_bonus").notNull().default(0),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export type DailyChallenge = typeof dailyChallengesTable.$inferSelect;
export type DailyChallengeAnswer = typeof dailyChallengeAnswersTable.$inferSelect;
