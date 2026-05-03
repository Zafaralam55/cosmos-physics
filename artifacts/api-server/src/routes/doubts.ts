import { db } from "@workspace/db";
import { doubtRepliesTable, doubtsTable, usersTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

function newId() {
  return `dbt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
function repId() {
  return `rep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// POST /api/doubts — student posts a doubt
router.post("/", requireAuth, async (req, res) => {
  const { text, photoUrl } = req.body as { text?: string; photoUrl?: string };
  if (!text || text.trim().length < 3) {
    res.status(400).json({ error: "text is required (min 3 chars)" });
    return;
  }
  const userRows = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, req.auth!.sub));
  const studentName = userRows[0]?.name ?? "Student";
  const id = newId();
  await db.insert(doubtsTable).values({
    id,
    studentId: req.auth!.sub,
    studentName,
    text: text.trim(),
    photoUrl: photoUrl ?? null,
    status: "open",
  });
  logger.info({ doubtId: id, studentId: req.auth!.sub }, "Doubt posted");
  res.status(201).json({ id });
});

// GET /api/doubts — list doubts (student = own, teacher/admin = all)
router.get("/", requireAuth, async (req, res) => {
  const role = req.auth!.role;
  let rows;
  if (role === "student") {
    rows = await db.select().from(doubtsTable)
      .where(eq(doubtsTable.studentId, req.auth!.sub))
      .orderBy(desc(doubtsTable.createdAt))
      .limit(50);
  } else {
    rows = await db.select().from(doubtsTable)
      .orderBy(desc(doubtsTable.createdAt))
      .limit(100);
  }
  // For each doubt, attach reply count
  const withCounts = await Promise.all(rows.map(async (d) => {
    const replies = await db.select().from(doubtRepliesTable).where(eq(doubtRepliesTable.doubtId, d.id)).orderBy(desc(doubtRepliesTable.createdAt));
    return { ...d, replies };
  }));
  res.json(withCounts);
});

// GET /api/doubts/:id — get one doubt with all replies
router.get("/:id", requireAuth, async (req, res) => {
  const id = String(req.params["id"] ?? "");
  const rows = await db.select().from(doubtsTable).where(eq(doubtsTable.id, id));
  const doubt = rows[0];
  if (!doubt) { res.status(404).json({ error: "Not found" }); return; }
  if (req.auth!.role === "student" && doubt.studentId !== req.auth!.sub) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const replies = await db.select().from(doubtRepliesTable)
    .where(eq(doubtRepliesTable.doubtId, id))
    .orderBy(desc(doubtRepliesTable.createdAt));
  res.json({ ...doubt, replies });
});

// POST /api/doubts/:id/replies — add a reply
router.post("/:id/replies", requireAuth, async (req, res) => {
  const doubtId = String(req.params["id"] ?? "");
  const { text } = req.body as { text?: string };
  if (!text || text.trim().length < 1) {
    res.status(400).json({ error: "text is required" }); return;
  }
  const dRows = await db.select().from(doubtsTable).where(eq(doubtsTable.id, doubtId));
  const doubt = dRows[0];
  if (!doubt) { res.status(404).json({ error: "Doubt not found" }); return; }

  const userRows = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, req.auth!.sub));
  const userName = userRows[0]?.name ?? req.auth!.role;
  const id = repId();
  await db.insert(doubtRepliesTable).values({
    id,
    doubtId,
    userId: req.auth!.sub,
    userName,
    role: req.auth!.role,
    text: text.trim(),
  });

  // Auto-mark as answered when teacher/admin replies
  if (req.auth!.role !== "student" && doubt.status === "open") {
    await db.update(doubtsTable).set({ status: "answered" }).where(eq(doubtsTable.id, doubtId));
  }

  res.status(201).json({ id });
});

// PUT /api/doubts/:id/solve — teacher/admin marks as answered
router.put("/:id/solve", requireRole("teacher", "admin"), async (req, res) => {
  const id = String(req.params["id"] ?? "");
  await db.update(doubtsTable).set({ status: "answered" }).where(eq(doubtsTable.id, id));
  res.json({ ok: true });
});

// PUT /api/doubts/:id/reopen — teacher/admin reopens
router.put("/:id/reopen", requireRole("teacher", "admin"), async (req, res) => {
  const id = String(req.params["id"] ?? "");
  await db.update(doubtsTable).set({ status: "open" }).where(eq(doubtsTable.id, id));
  res.json({ ok: true });
});

export default router;
