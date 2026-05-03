import { db } from "@workspace/db";
import { studyStreaksTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

router.post("/activity", requireAuth, async (req, res) => {
  const userId = req.auth!.sub;
  const today = todayUTC();
  const yesterday = yesterdayUTC();

  const rows = await db
    .select()
    .from(studyStreaksTable)
    .where(eq(studyStreaksTable.userId, userId));

  if (rows.length === 0) {
    const [row] = await db
      .insert(studyStreaksTable)
      .values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      })
      .returning();
    res.json(row);
    return;
  }

  const existing = rows[0]!;

  if (existing.lastActivityDate === today) {
    res.json(existing);
    return;
  }

  const isConsecutive = existing.lastActivityDate === yesterday;
  const newCurrent = isConsecutive ? existing.currentStreak + 1 : 1;
  const newLongest = Math.max(existing.longestStreak, newCurrent);

  const [updated] = await db
    .update(studyStreaksTable)
    .set({
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActivityDate: today,
      updatedAt: new Date(),
    })
    .where(eq(studyStreaksTable.userId, userId))
    .returning();

  res.json(updated);
});

router.get("/me", requireAuth, async (req, res) => {
  const userId = req.auth!.sub;
  const rows = await db
    .select()
    .from(studyStreaksTable)
    .where(eq(studyStreaksTable.userId, userId));

  if (rows.length === 0) {
    res.json({ userId, currentStreak: 0, longestStreak: 0, lastActivityDate: null });
    return;
  }

  const row = rows[0]!;
  const today = todayUTC();
  const yesterday = yesterdayUTC();
  const isActive =
    row.lastActivityDate === today || row.lastActivityDate === yesterday;

  res.json({
    ...row,
    currentStreak: isActive ? row.currentStreak : 0,
  });
});

export default router;
