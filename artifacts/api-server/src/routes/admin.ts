import { db } from "@workspace/db";
import { appConfigTable, contentHistoryTable, contentOverridesTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { hashPassword, verifyPassword } from "../lib/auth.js";
import { requireRole } from "../middlewares/requireAuth.js";

const router = Router();

const adminOnly = requireRole("admin");

// ── App config ──────────────────────────────────────────────────────────────

router.get("/config", adminOnly, async (_req, res) => {
  const rows = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
  const cfg = rows[0];
  if (!cfg) {
    res.status(404).json({ error: "Config not found" });
    return;
  }
  res.json({ adminEmail: cfg.adminEmail, settings: cfg.settings });
});

router.put("/config", adminOnly, async (req, res) => {
  const { adminEmail, adminPassword, currentPassword, settings } = req.body as {
    adminEmail?: string;
    adminPassword?: string;
    currentPassword?: string;
    settings?: Record<string, unknown>;
  };

  const rows = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
  const cfg = rows[0];
  if (!cfg) {
    res.status(404).json({ error: "Config not found" });
    return;
  }

  const update: Partial<typeof appConfigTable.$inferInsert> = {};

  if (settings !== undefined) {
    update.settings = settings;
  }

  if (adminEmail || adminPassword) {
    if (!currentPassword || !(await verifyPassword(currentPassword, cfg.adminPasswordHash))) {
      res.status(401).json({ error: "Current admin password required to change credentials" });
      return;
    }
    if (adminEmail) update.adminEmail = adminEmail.trim().toLowerCase();
    if (adminPassword) {
      if (adminPassword.length < 6) {
        res.status(400).json({ error: "New password must be at least 6 characters" });
        return;
      }
      update.adminPasswordHash = await hashPassword(adminPassword);
    }
  }

  await db.update(appConfigTable).set(update).where(eq(appConfigTable.id, 1));
  res.json({ ok: true });
});

router.post("/config/reset-admin", adminOnly, async (_req, res) => {
  const hash = await hashPassword("Cosmos@2026");
  await db
    .update(appConfigTable)
    .set({ adminEmail: "zafar@cosmos.in", adminPasswordHash: hash })
    .where(eq(appConfigTable.id, 1));
  res.json({ ok: true });
});

// ── Users (teachers + students) ─────────────────────────────────────────────

router.get("/users", adminOnly, async (_req, res) => {
  const users = await db.select().from(usersTable);
  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      phone: u.phone,
      subject: u.subject,
      bio: u.bio,
      qualification: u.qualification,
      level: u.level,
      subscriptionTier: u.subscriptionTier,
      createdAt: u.createdAt,
    })),
  );
});

router.post("/users", adminOnly, async (req, res) => {
  const { email, password, role, name, phone, subject, bio, qualification, level, subscriptionTier } =
    req.body as Record<string, string>;

  if (!email || !password || !role || !name) {
    res.status(400).json({ error: "email, password, role, and name are required" });
    return;
  }
  if (role !== "teacher" && role !== "student") {
    res.status(400).json({ error: "role must be teacher or student" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase()));
  if (existing.length > 0) {
    res.status(409).json({ error: "A user with this email already exists" });
    return;
  }

  const id = `${role}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const hash = await hashPassword(password);

  await db.insert(usersTable).values({
    id,
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    role,
    name: name.trim(),
    phone: phone?.trim() ?? "",
    subject: subject?.trim() ?? null,
    bio: bio?.trim() ?? null,
    qualification: qualification?.trim() ?? null,
    level: level?.trim() ?? null,
    subscriptionTier: subscriptionTier ?? "Free",
  });

  res.status(201).json({ id });
});

router.get("/users/:id", adminOnly, async (req, res) => {
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, req.params["id"]!));
  const user = rows[0];
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.put("/users/:id", adminOnly, async (req, res) => {
  const { name, email, phone, subject, bio, qualification, level, subscriptionTier, password } =
    req.body as Record<string, string>;

  const update: Partial<typeof usersTable.$inferInsert> = {};
  if (name) update.name = name.trim();
  if (email) {
    const normalized = email.trim().toLowerCase();
    const conflict = await db.select().from(usersTable).where(eq(usersTable.email, normalized));
    if (conflict.length > 0 && conflict[0]!.id !== req.params["id"]) {
      res.status(409).json({ error: "Email already taken by another user" });
      return;
    }
    update.email = normalized;
  }
  if (phone !== undefined) update.phone = phone.trim();
  if (subject !== undefined) update.subject = subject.trim() || null;
  if (bio !== undefined) update.bio = bio.trim() || null;
  if (qualification !== undefined) update.qualification = qualification.trim() || null;
  if (level !== undefined) update.level = level.trim() || null;
  if (subscriptionTier) update.subscriptionTier = subscriptionTier;
  if (password) {
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    update.passwordHash = await hashPassword(password);
  }

  await db.update(usersTable).set(update).where(eq(usersTable.id, req.params["id"]!));
  res.json({ ok: true });
});

router.delete("/users/:id", adminOnly, async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, req.params["id"]!));
  res.json({ ok: true });
});

// ── Bulk export / import ──────────────────────────────────────────────────────

router.get("/export", adminOnly, async (_req, res) => {
  const overrides = await db.select().from(contentOverridesTable);
  const cfg = (await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1)))[0];
  const appName = (cfg?.settings as Record<string, unknown> | null)?.["appName"] as string | undefined ?? "Cosmos Physics Academy";
  const exportedAt = new Date().toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const items = overrides.map(({ type, action, sourceId, data }) => ({ type, action, sourceId, data }));
  res.json({ version: 1, exportedAt, appName, itemCount: items.length, items });
});

router.post("/import", adminOnly, async (req, res) => {
  const { items } = req.body as {
    items?: Array<{ type?: string; action?: string; sourceId?: string; data?: unknown }>;
  };
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "items array is required and must not be empty" });
    return;
  }

  let imported = 0;
  let skipped = 0;
  for (const item of items) {
    if (!item.type || !item.action) { skipped++; continue; }
    const id = `ovr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    await db.insert(contentOverridesTable).values({
      id,
      type: item.type,
      action: item.action,
      sourceId: item.sourceId ?? null,
      data: item.data ?? null,
    });
    imported++;
  }
  res.json({ ok: true, imported, skipped });
});

// ── Content overrides ────────────────────────────────────────────────────────

const adminOrTeacher = requireRole("admin", "teacher");

router.get("/overrides", adminOnly, async (_req, res) => {
  const overrides = await db.select().from(contentOverridesTable);
  res.json(overrides);
});

router.post("/overrides", adminOrTeacher, async (req, res) => {
  const { type, action, sourceId, data } = req.body as {
    type?: string;
    action?: string;
    sourceId?: string;
    data?: unknown;
  };

  if (!type || !action) {
    res.status(400).json({ error: "type and action are required" });
    return;
  }

  // Teachers may only add custom content, not hide/delete seeds
  if (req.auth!.role === "teacher" && action !== "custom") {
    res.status(403).json({ error: "Teachers may only add custom content" });
    return;
  }

  // Auto-stamp createdBy for teacher content so ownership is tracked
  let finalData = data ?? null;
  if (req.auth!.role === "teacher") {
    finalData = { ...(typeof data === "object" && data !== null ? data : {}), createdBy: req.auth!.sub };
  }

  const id = `ovr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(contentOverridesTable).values({
    id,
    type,
    action,
    sourceId: sourceId ?? null,
    data: finalData,
  });
  res.status(201).json({ id });
});

router.put("/overrides/:id", adminOrTeacher, async (req, res) => {
  const { data, sourceId } = req.body as { data?: unknown; sourceId?: string };
  const overrideId = String(req.params["id"] ?? "");

  const rows = await db.select().from(contentOverridesTable).where(eq(contentOverridesTable.id, overrideId));
  const ovr = rows[0];

  if (req.auth!.role === "teacher") {
    if (!ovr || (ovr.data as Record<string, unknown>)?.["createdBy"] !== req.auth!.sub) {
      res.status(403).json({ error: "Forbidden: you can only edit your own content" });
      return;
    }
  }

  // Snapshot current state into version history before overwriting
  if (ovr?.data && data !== undefined) {
    const prevData = ovr.data as Record<string, unknown>;
    const title = prevData["title"] as string | undefined;
    const typeLabel: Record<string, string> = {
      liveClass: "Live", resource: "Note", course: "Course", quiz: "Quiz", notification: "Notif",
    };
    const tl = typeLabel[ovr.type] ?? ovr.type;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const label = title ? `${tl}: ${title} · ${dateStr}, ${timeStr}` : `${tl} · ${dateStr}, ${timeStr}`;
    const itemId = (prevData["id"] as string | undefined) ?? overrideId;
    const vhId = `vh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    await db.insert(contentHistoryTable).values({
      id: vhId,
      type: ovr.type,
      itemId,
      overrideId,
      data: prevData,
      label,
    });
  }

  const update: Partial<typeof contentOverridesTable.$inferInsert> = {};
  if (data !== undefined) update.data = data;
  if (sourceId !== undefined) update.sourceId = sourceId;
  await db.update(contentOverridesTable).set(update).where(eq(contentOverridesTable.id, overrideId));
  res.json({ ok: true });
});

router.delete("/overrides/:id", adminOrTeacher, async (req, res) => {
  const deleteId = String(req.params["id"] ?? "");
  if (req.auth!.role === "teacher") {
    const rows = await db.select().from(contentOverridesTable).where(eq(contentOverridesTable.id, deleteId));
    const ovr = rows[0];
    if (!ovr || (ovr.data as Record<string, unknown>)?.["createdBy"] !== req.auth!.sub) {
      res.status(403).json({ error: "Forbidden: you can only delete your own content" });
      return;
    }
  }
  await db.delete(contentOverridesTable).where(eq(contentOverridesTable.id, deleteId));
  res.json({ ok: true });
});

export default router;
