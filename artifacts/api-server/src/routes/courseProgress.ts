import { db } from "@workspace/db";
import { courseProgressTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function getStudentId(authHeader: string | undefined): Promise<string | null> {
  const token = (authHeader ?? "").replace("Bearer ", "");
  if (!token) return null;
  const { verifyToken } = await import("../lib/auth.js");
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "student") return null;
  return payload.sub;
}

// GET /api/progress  — all completed chapters for the student
router.get("/", async (req, res) => {
  const userId = await getStudentId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Student auth required" });
  const rows = await db
    .select()
    .from(courseProgressTable)
    .where(eq(courseProgressTable.userId, userId));
  return res.json(rows);
});

// POST /api/progress/complete  — mark a chapter done
router.post("/complete", async (req, res) => {
  const userId = await getStudentId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Student auth required" });
  const { courseId, chapterId } = req.body as { courseId?: string; chapterId?: string };
  if (!courseId || !chapterId) {
    return res.status(400).json({ error: "courseId and chapterId required" });
  }
  await db
    .insert(courseProgressTable)
    .values({ id: newId(), userId, courseId, chapterId })
    .onConflictDoNothing();
  const rows = await db
    .select()
    .from(courseProgressTable)
    .where(eq(courseProgressTable.userId, userId));
  return res.json(rows);
});

// DELETE /api/progress/complete  — unmark a chapter (undo)
router.delete("/complete", async (req, res) => {
  const userId = await getStudentId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: "Student auth required" });
  const { courseId, chapterId } = req.body as { courseId?: string; chapterId?: string };
  if (!courseId || !chapterId) {
    return res.status(400).json({ error: "courseId and chapterId required" });
  }
  await db
    .delete(courseProgressTable)
    .where(
      and(
        eq(courseProgressTable.userId, userId),
        eq(courseProgressTable.courseId, courseId),
        eq(courseProgressTable.chapterId, chapterId),
      ),
    );
  const rows = await db
    .select()
    .from(courseProgressTable)
    .where(eq(courseProgressTable.userId, userId));
  return res.json(rows);
});

export default router;
