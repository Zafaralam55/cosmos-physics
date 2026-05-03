import { db } from "@workspace/db";
import { courseAccessTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { requireRole } from "../middlewares/requireAuth.js";

const router = Router();

const adminOnly = requireRole("admin");
const studentOnly = requireRole("student");

function newId() {
  return `ca-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

router.get("/", adminOnly, async (_req, res) => {
  const rows = await db.select().from(courseAccessTable);
  res.json(rows);
});

router.get("/locked-courses", async (_req, res) => {
  const rows = await db
    .select()
    .from(courseAccessTable)
    .where(and(eq(courseAccessTable.studentId, "__locked__"), eq(courseAccessTable.status, "locked")));
  res.json({ lockedCourseIds: rows.map((r) => r.courseId) });
});

router.get("/student/:studentId", adminOnly, async (req, res) => {
  const rows = await db
    .select()
    .from(courseAccessTable)
    .where(eq(courseAccessTable.studentId, req.params["studentId"]!));
  res.json(rows);
});

router.get("/my-grants", studentOnly, async (req, res) => {
  const rows = await db
    .select()
    .from(courseAccessTable)
    .where(and(eq(courseAccessTable.studentId, req.auth!.sub), eq(courseAccessTable.status, "granted")));
  res.json({ grantedCourseIds: rows.map((r) => r.courseId) });
});

router.post("/", adminOnly, async (req, res) => {
  const { studentId, courseId, status } = req.body as {
    studentId?: string;
    courseId?: string;
    status?: string;
  };

  if (!studentId || !courseId || !status) {
    res.status(400).json({ error: "studentId, courseId, and status required" });
    return;
  }
  if (!["granted", "blocked", "locked"].includes(status)) {
    res.status(400).json({ error: "status must be granted, blocked, or locked" });
    return;
  }

  const existing = await db
    .select()
    .from(courseAccessTable)
    .where(and(eq(courseAccessTable.studentId, studentId), eq(courseAccessTable.courseId, courseId)));

  if (existing.length > 0) {
    await db
      .update(courseAccessTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(courseAccessTable.id, existing[0]!.id));
  } else {
    await db.insert(courseAccessTable).values({
      id: newId(),
      studentId,
      courseId,
      status,
    });
  }

  res.json({ ok: true });
});

router.delete("/:studentId/:courseId", adminOnly, async (req, res) => {
  await db
    .delete(courseAccessTable)
    .where(
      and(
        eq(courseAccessTable.studentId, req.params["studentId"]!),
        eq(courseAccessTable.courseId, req.params["courseId"]!),
      ),
    );
  res.json({ ok: true });
});

router.get("/check/:courseId", studentOnly, async (req, res) => {
  const studentId = req.auth!.sub;
  const courseId = req.params["courseId"]!;

  const locked = await db
    .select()
    .from(courseAccessTable)
    .where(and(eq(courseAccessTable.studentId, "__locked__"), eq(courseAccessTable.courseId, courseId)));
  const isLocked = locked.length > 0;

  const blocked = await db
    .select()
    .from(courseAccessTable)
    .where(and(eq(courseAccessTable.studentId, studentId), eq(courseAccessTable.courseId, courseId), eq(courseAccessTable.status, "blocked")));
  const isBlocked = blocked.length > 0;

  let hasGrant = false;
  if (isLocked) {
    const grant = await db
      .select()
      .from(courseAccessTable)
      .where(and(eq(courseAccessTable.studentId, studentId), eq(courseAccessTable.courseId, courseId), eq(courseAccessTable.status, "granted")));
    hasGrant = grant.length > 0;
  }

  res.json({ isLocked, isBlocked, hasGrant, canEnroll: !isBlocked && (!isLocked || hasGrant) });
});

export default router;
