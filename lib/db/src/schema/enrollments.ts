import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const enrollmentsTable = pgTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export type Enrollment = typeof enrollmentsTable.$inferSelect;
