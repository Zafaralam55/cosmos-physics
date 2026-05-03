import { db } from "@workspace/db";
import { courseAccessTable, enrollmentsTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { requireRole } from "../middlewares/requireAuth.js";

const router = Router();
const studentOnly = requireRole("student");

router.get("/", studentOnly, async (req, res) => {
  const rows = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.studentId, req.auth!.sub));
  res.json(rows.map((r) => ({ courseId: r.courseId, enrolledAt: r.enrolledAt })));
});

router.post("/", studentOnly, async (req, res) => {
  const { courseId } = req.body as { courseId?: string };
  if (!courseId) {
    res.status(400).json({ error: "courseId required" });
    return;
  }

  const studentId = req.auth!.sub;

  const blocked = await db
    .select()
    .from(courseAccessTable)
    .where(
      and(
        eq(courseAccessTable.studentId, studentId),
        eq(courseAccessTable.courseId, courseId),
        eq(courseAccessTable.status, "blocked"),
      ),
    );
  if (blocked.length > 0) {
    res.status(403).json({ error: "Your access to this course has been revoked by the admin." });
    return;
  }

  const locked = await db
    .select()
    .from(courseAccessTable)
    .where(
      and(
        eq(courseAccessTable.studentId, "__locked__"),
        eq(courseAccessTable.courseId, courseId),
      ),
    );
  if (locked.length > 0) {
    const grant = await db
      .select()
      .from(courseAccessTable)
      .where(
        and(
          eq(courseAccessTable.studentId, studentId),
          eq(courseAccessTable.courseId, courseId),
          eq(courseAccessTable.status, "granted"),
        ),
      );
    if (grant.length === 0) {
      res.status(403).json({ error: "This is a paid course. Please contact the admin to get access." });
      return;
    }
  }

  const id = `enr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await db
    .insert(enrollmentsTable)
    .values({ id, studentId, courseId })
    .onConflictDoNothing();
  res.status(201).json({ ok: true });
});

router.delete("/:courseId", studentOnly, async (req, res) => {
  await db
    .delete(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.studentId, req.auth!.sub),
        eq(enrollmentsTable.courseId, req.params["courseId"]!),
      ),
    );
  res.json({ ok: true });
});

export default router;
