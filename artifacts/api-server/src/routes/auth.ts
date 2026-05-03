import { db } from "@workspace/db";
import { appConfigTable, otpTokensTable, usersTable } from "@workspace/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { Router } from "express";
import { hashPassword, signToken, verifyPassword, verifyToken } from "../lib/auth.js";
import { sendOtpEmail } from "../lib/email.js";
import { logger } from "../lib/logger.js";
import { requireAuth } from "../middlewares/requireAuth.js";

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
  if (cleaned.length > 10) return `+${cleaned}`;
  return cleaned;
}

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: string;
  };

  if (!email || !password || !role) {
    res.status(400).json({ error: "email, password, and role are required" });
    return;
  }

  const normalEmail = email.trim().toLowerCase();

  if (role === "admin") {
    const rows = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
    const cfg = rows[0];
    if (
      !cfg ||
      normalEmail !== cfg.adminEmail.toLowerCase() ||
      !(await verifyPassword(password, cfg.adminPasswordHash))
    ) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
    const token = await signToken({ sub: "admin", role: "admin", email: cfg.adminEmail, name: "Founder" });
    res.json({ token, user: { id: "admin", role: "admin", email: cfg.adminEmail, name: "Founder" } });
    return;
  }

  if (role === "teacher" || role === "student") {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalEmail));
    const user = rows[0];
    if (!user || user.role !== role || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = await signToken({
      sub: user.id,
      role: user.role as "teacher" | "student",
      email: user.email,
      name: user.name,
    });
    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        phone: user.phone,
        subject: user.subject,
        bio: user.bio,
        qualification: user.qualification,
        level: user.level,
        subscriptionTier: user.subscriptionTier,
      },
    });
    return;
  }

  res.status(400).json({ error: "role must be admin, teacher, or student" });
});

router.get("/me", requireAuth, async (req, res) => {
  const auth = req.auth!;
  if (auth.role === "admin") {
    const rows = await db.select().from(appConfigTable).where(eq(appConfigTable.id, 1));
    const cfg = rows[0];
    res.json({ id: "admin", role: "admin", email: cfg?.adminEmail ?? auth.email, name: "Founder" });
    return;
  }
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, auth.sub));
  const user = rows[0];
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    phone: user.phone,
    subject: user.subject,
    bio: user.bio,
    qualification: user.qualification,
    level: user.level,
    subscriptionTier: user.subscriptionTier,
  });
});

router.put("/profile", requireAuth, async (req, res) => {
  const { name, phone } = req.body as { name?: string; phone?: string };
  const auth = req.auth!;
  if (auth.role === "admin") {
    res.status(400).json({ error: "Use Founder Dashboard to update admin details" });
    return;
  }
  if (!name?.trim() && !phone?.trim()) {
    res.status(400).json({ error: "Provide at least name or phone to update" });
    return;
  }
  const updates: Record<string, string> = {};
  if (name?.trim()) updates.name = name.trim();
  if (phone?.trim()) {
    const cleaned = phone.replace(/\D/g, "");
    updates.phone = cleaned.length === 10 ? `+91${cleaned}` : cleaned.startsWith("91") && cleaned.length === 12 ? `+${cleaned}` : phone.trim();
  }
  await db.update(usersTable).set(updates).where(eq(usersTable.id, auth.sub));
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, auth.sub));
  const user = rows[0];
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({
    id: user.id, role: user.role, email: user.email, name: user.name,
    phone: user.phone, level: user.level, subscriptionTier: user.subscriptionTier,
  });
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: "currentPassword and newPassword (min 6 chars) required" });
    return;
  }
  const auth = req.auth!;
  if (auth.role === "admin") {
    res.status(400).json({ error: "Use PUT /admin/config to change admin credentials" });
    return;
  }
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, auth.sub));
  const user = rows[0];
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    res.status(401).json({ error: "Current password incorrect" });
    return;
  }
  const hash = await hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash: hash }).where(eq(usersTable.id, auth.sub));

  const token = await signToken({ sub: user.id, role: user.role as "teacher" | "student", email: user.email, name: user.name });
  res.json({ token });
});

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  };

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  if (!email.includes("@")) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const normalEmail = email.trim().toLowerCase();
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, normalEmail));
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists. Please sign in." });
    return;
  }

  const normalPhone = phone?.trim() ? normalizePhone(phone.trim()) : "";
  const hash = await hashPassword(password);
  const id = `student-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  await db.insert(usersTable).values({
    id,
    email: normalEmail,
    passwordHash: hash,
    role: "student",
    name: name.trim(),
    phone: normalPhone,
    subscriptionTier: "Free",
  });

  const token = await signToken({ sub: id, role: "student", email: normalEmail, name: name.trim() });
  res.status(201).json({
    token,
    user: {
      id,
      role: "student",
      email: normalEmail,
      name: name.trim(),
      phone: normalPhone,
      level: null,
      subscriptionTier: "Free",
    },
  });
});

// ── Forgot password ──────────────────────────────────────────────────────────

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email?.includes("@")) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }
  const normalEmail = email.trim().toLowerCase();

  const rows = await db.select().from(usersTable).where(eq(usersTable.email, normalEmail));
  if (rows.length === 0) {
    res.status(404).json({ error: "No account found with this email address." });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const id = `otp-reset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  await db.insert(otpTokensTable).values({
    id,
    contact: normalEmail,
    type: "email",
    code: otp,
    role: "password-reset",
    expiresAt,
  });

  const sent = await sendOtpEmail(normalEmail, otp);
  if (!sent) {
    logger.info({ otp, email: normalEmail }, "Forgot-password OTP dev mode");
    res.json({ ok: true, dev: true, otp });
    return;
  }
  res.json({ ok: true });
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body as {
    email?: string;
    otp?: string;
    newPassword?: string;
  };
  if (!email?.includes("@") || !otp || !newPassword) {
    res.status(400).json({ error: "email, otp, and newPassword are required" });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }

  const normalEmail = email.trim().toLowerCase();
  const now = new Date();

  const otpRows = await db
    .select()
    .from(otpTokensTable)
    .where(
      and(
        eq(otpTokensTable.contact, normalEmail),
        eq(otpTokensTable.type, "email"),
        eq(otpTokensTable.code, otp.trim()),
        eq(otpTokensTable.role, "password-reset"),
        eq(otpTokensTable.used, false),
        gt(otpTokensTable.expiresAt, now),
      ),
    );

  if (otpRows.length === 0) {
    res.status(401).json({ error: "Invalid or expired code. Please request a new one." });
    return;
  }

  await db.update(otpTokensTable).set({ used: true }).where(eq(otpTokensTable.id, otpRows[0]!.id));

  const userRows = await db.select().from(usersTable).where(eq(usersTable.email, normalEmail));
  if (!userRows[0]) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const hash = await hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash: hash }).where(eq(usersTable.id, userRows[0].id));

  res.json({ ok: true });
});

router.post("/verify-token", async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    res.status(400).json({ error: "token required" });
    return;
  }
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ valid: false });
    return;
  }
  res.json({ valid: true, payload });
});

export default router;
