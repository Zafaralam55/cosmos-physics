import { db } from "@workspace/db";
import { contentHistoryTable, contentOverridesTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { Router } from "express";
import { requireRole } from "../middlewares/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();
const adminOnly = requireRole("admin");

function newId() {
  return `vh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function formatLabel(type: string, data: unknown, suffix?: string): string {
  const title = (data as Record<string, unknown>)?.["title"] as string | undefined;
  const typeLabel = { liveClass: "Live", resource: "Note", course: "Course", quiz: "Quiz", notification: "Notif" }[type] ?? type;
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const base = title ? `${typeLabel}: ${title}` : typeLabel;
  return suffix ? `${base} · ${suffix}` : `${base} · ${dateStr}, ${timeStr}`;
}

// GET /api/history — all recent entries (or filtered by overrideId)
router.get("/", adminOnly, async (req, res) => {
  const { overrideId } = req.query as { overrideId?: string };
  let query = db.select().from(contentHistoryTable).orderBy(desc(contentHistoryTable.createdAt)).$dynamic();
  if (overrideId) {
    query = query.where(eq(contentHistoryTable.overrideId, overrideId));
  }
  const rows = await query.limit(100);
  res.json(rows);
});

// POST /api/history/:historyId/restore — restore a previous version
router.post("/:historyId/restore", adminOnly, async (req, res) => {
  const historyId = String(req.params["historyId"] ?? "");

  const histRows = await db.select().from(contentHistoryTable).where(eq(contentHistoryTable.id, historyId));
  const hist = histRows[0];
  if (!hist) {
    res.status(404).json({ error: "Version not found" });
    return;
  }

  // Before restoring, snapshot current state so it can be undone
  const ovrRows = await db.select().from(contentOverridesTable).where(eq(contentOverridesTable.id, hist.overrideId));
  const ovr = ovrRows[0];
  if (ovr?.data) {
    await db.insert(contentHistoryTable).values({
      id: newId(),
      type: hist.type,
      itemId: hist.itemId,
      overrideId: hist.overrideId,
      data: ovr.data as Record<string, unknown>,
      label: formatLabel(hist.type, ovr.data, "Before restore"),
    });
  }

  // Apply the restored data
  await db.update(contentOverridesTable)
    .set({ data: hist.data as Record<string, unknown> })
    .where(eq(contentOverridesTable.id, hist.overrideId));

  logger.info({ historyId, overrideId: hist.overrideId }, "Version restored");
  res.json({ ok: true, data: hist.data });
});

export default router;
