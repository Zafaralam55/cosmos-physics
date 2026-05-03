import { db } from "@workspace/db";
import { announcementsTable, pushTokensTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/register-token", requireAuth, async (req, res) => {
  const { token, platform } = req.body as { token?: string; platform?: string };
  if (!token) {
    res.status(400).json({ error: "token required" });
    return;
  }
  const userId = req.auth!.sub;
  const id = `pt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  const existing = await db.select().from(pushTokensTable).where(eq(pushTokensTable.token, token));
  if (existing.length > 0) {
    await db.update(pushTokensTable)
      .set({ userId, updatedAt: new Date() })
      .where(eq(pushTokensTable.token, token));
  } else {
    await db.insert(pushTokensTable).values({
      id,
      userId,
      token,
      platform: platform ?? "expo",
    });
  }
  res.json({ ok: true });
});

async function sendPushBatch(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {},
): Promise<number> {
  if (tokens.length === 0) return 0;
  const messages = tokens.map((to) => ({ to, title, body, data, sound: "default" }));
  const CHUNK = 100;
  let sent = 0;
  for (let i = 0; i < messages.length; i += CHUNK) {
    const chunk = messages.slice(i, i + CHUNK);
    try {
      const r = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });
      if (r.ok) sent += chunk.length;
      else logger.warn({ status: r.status }, "Expo push batch failed");
    } catch (err) {
      logger.error({ err }, "Expo push send error");
    }
  }
  return sent;
}

router.post("/announce", requireAuth, async (req, res) => {
  if (req.auth!.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const { title, body, type } = req.body as {
    title?: string;
    body?: string;
    type?: string;
  };
  if (!title || !body) {
    res.status(400).json({ error: "title and body required" });
    return;
  }

  const rows = await db.select().from(pushTokensTable);
  const tokens = rows.map((r) => r.token).filter((t) => t.startsWith("ExponentPushToken"));
  const sent = await sendPushBatch(tokens, title, body, { type: type ?? "info" });

  const id = `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const [announcement] = await db
    .insert(announcementsTable)
    .values({
      id,
      title,
      body,
      type: type ?? "info",
      sentBy: req.auth!.sub,
      pushSent: sent,
      pushTotal: tokens.length,
    })
    .returning();

  res.json({ ok: true, announcement, pushSent: sent, pushTotal: tokens.length });
});

router.get("/announcements", async (_req, res) => {
  const rows = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.sentAt))
    .limit(50);
  res.json(rows);
});

router.post("/broadcast", requireAuth, async (req, res) => {
  if (req.auth!.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const { title, body, data } = req.body as {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  };
  if (!title || !body) {
    res.status(400).json({ error: "title and body required" });
    return;
  }
  const rows = await db.select().from(pushTokensTable);
  const tokens = rows.map((r) => r.token).filter((t) => t.startsWith("ExponentPushToken"));
  const sent = await sendPushBatch(tokens, title, body, data ?? {});
  res.json({ ok: true, sent, total: tokens.length });
});

export default router;
