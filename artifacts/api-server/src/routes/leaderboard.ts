import { db } from "@workspace/db";
import { quizScoresTable, usersTable } from "@workspace/db/schema";
import { and, desc, gte, sql } from "drizzle-orm";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// ── Submit a quiz score (student/teacher auth) ────────────────────────────────
router.post("/scores", requireAuth, async (req, res) => {
  const auth = req.auth!;
  if (auth.role === "admin") {
    res.status(400).json({ error: "Admin accounts cannot submit quiz scores" });
    return;
  }

  const { quizId, quizTitle, score, total } = req.body as {
    quizId?: string;
    quizTitle?: string;
    score?: number;
    total?: number;
  };

  if (!quizId || !quizTitle || score === undefined || total === undefined) {
    res.status(400).json({ error: "quizId, quizTitle, score, and total are required" });
    return;
  }
  if (score < 0 || total <= 0 || score > total) {
    res.status(400).json({ error: "Invalid score/total values" });
    return;
  }

  const userRows = await db
    .select({ name: usersTable.name, level: usersTable.level })
    .from(usersTable)
    .where(sql`${usersTable.id} = ${auth.sub}`);

  const user = userRows[0];
  const id = `qs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  await db.insert(quizScoresTable).values({
    id,
    studentId: auth.sub,
    studentName: user?.name ?? auth.name ?? "Unknown",
    level: user?.level ?? "",
    quizId,
    quizTitle,
    score,
    total,
  });

  res.status(201).json({ ok: true, id });
});

// ── Get leaderboard (public, no auth) ────────────────────────────────────────
router.get("/", async (req, res) => {
  const { period } = req.query as { period?: string };

  const since =
    period === "week"
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : period === "month"
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : null;

  const rows = await db
    .select({
      studentId: quizScoresTable.studentId,
      studentName: quizScoresTable.studentName,
      level: quizScoresTable.level,
      quizzesTaken: sql<number>`COUNT(*)::int`,
      totalScore: sql<number>`SUM(${quizScoresTable.score})::int`,
      totalPossible: sql<number>`SUM(${quizScoresTable.total})::int`,
    })
    .from(quizScoresTable)
    .where(since ? gte(quizScoresTable.takenAt, since) : sql`1=1`)
    .groupBy(quizScoresTable.studentId, quizScoresTable.studentName, quizScoresTable.level)
    .orderBy(desc(sql`SUM(${quizScoresTable.score})`))
    .limit(50);

  const entries = rows.map((r, i) => ({
    rank: i + 1,
    studentId: r.studentId,
    name: r.studentName,
    level: r.level || "Student",
    quizzesTaken: r.quizzesTaken,
    totalScore: r.totalScore,
    totalPossible: r.totalPossible,
    accuracy:
      r.totalPossible > 0
        ? Math.round((r.totalScore / r.totalPossible) * 100)
        : 0,
    avatar: r.studentName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));

  res.json(entries);
});

export default router;
