import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const courseProgressTable = pgTable(
  "course_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    courseId: text("course_id").notNull(),
    chapterId: text("chapter_id").notNull(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.courseId, t.chapterId)],
);

export type CourseProgress = typeof courseProgressTable.$inferSelect;
