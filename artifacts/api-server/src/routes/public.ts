import { db } from "@workspace/db";
import { appConfigTable, contentOverridesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";

const router = Router();

router.get("/config", async (_req, res) => {
  const rows = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
  const cfg = rows[0];
  if (!cfg) {
    res.status(404).json({ error: "Config not found" });
    return;
  }
  res.json({ settings: cfg.settings });
});

router.get("/overrides", async (_req, res) => {
  const overrides = await db.select().from(contentOverridesTable);
  res.json(overrides);
});

export default router;
