import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const courseAccessTable = pgTable("course_access", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  status: text("status").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CourseAccess = typeof courseAccessTable.$inferSelect;
