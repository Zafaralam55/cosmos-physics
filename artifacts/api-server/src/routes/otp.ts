import { db } from "@workspace/db";
import { otpTokensTable, usersTable } from "@workspace/db/schema";
import { and, eq, gt, or } from "drizzle-orm";
import { Router } from "express";
import { signToken } from "../lib/auth.js";
import { sendOtpEmail } from "../lib/email.js";
import { sendOtpSms } from "../lib/sms.js";
import { logger } from "../lib/logger.js";

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, "");
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
  if (cleaned.length > 10) return `+${cleaned}`;
  return cleaned;
}

router.post("/request", async (req, res) => {
  const { contact, type, role } = req.body as {
    contact?: string;
    type?: "email" | "sms";
    role?: string;
  };

  if (!contact || !type) {
    res.status(400).json({ error: "contact and type (email|sms) required" });
    return;
  }

  let storedContact: string;

  if (type === "email") {
    storedContact = contact.trim().toLowerCase();
    const rows = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, storedContact), eq(usersTable.role, role ?? "student")));
    if (rows.length === 0) {
      res.status(404).json({ error: "No account found with this email. Please sign up first or ask the founder to add you." });
      return;
    }
  } else if (type === "sms") {
    const normPhone = normalizePhone(contact);
    const shortPhone = normPhone.replace(/^\+91/, "");
    storedContact = normPhone;
    const rows = await db
      .select()
      .from(usersTable)
      .where(and(
        or(eq(usersTable.phone, normPhone), eq(usersTable.phone, shortPhone)),
        eq(usersTable.role, role ?? "student"),
      ));
    if (rows.length === 0) {
      res.status(404).json({ error: "No account found with this mobile number. Please sign up first or ask the founder to add you." });
      return;
    }
  } else {
    storedContact = contact.trim().toLowerCase();
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const id = `otp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  await db.insert(otpTokensTable).values({
    id,
    contact: storedContact,
    type,
    code: otp,
    role: role ?? "student",
    expiresAt,
  });

  let sent = false;
  if (type === "email") {
    sent = await sendOtpEmail(contact, otp);
  } else if (type === "sms") {
    sent = await sendOtpSms(contact, otp);
  }

  if (!sent) {
    logger.info({ otp, contact, type }, "OTP dev mode — not sent via service");
    res.json({ ok: true, dev: true, otp });
    return;
  }
  res.json({ ok: true });
});

router.post("/verify", async (req, res) => {
  const { contact, code, type, role } = req.body as {
    contact?: string;
    code?: string;
    type?: string;
    role?: string;
  };

  if (!contact || !code || !type) {
    res.status(400).json({ error: "contact, code, and type required" });
    return;
  }

  const storedContact = type === "sms" ? normalizePhone(contact) : contact.trim().toLowerCase();
  const now = new Date();

  const rows = await db
    .select()
    .from(otpTokensTable)
    .where(
      and(
        eq(otpTokensTable.contact, storedContact),
        eq(otpTokensTable.type, type),
        eq(otpTokensTable.code, code),
        eq(otpTokensTable.used, false),
        gt(otpTokensTable.expiresAt, now),
      ),
    );

  if (rows.length === 0) {
    res.status(401).json({ error: "Invalid or expired code. Please request a new one." });
    return;
  }

  await db
    .update(otpTokensTable)
    .set({ used: true })
    .where(eq(otpTokensTable.id, rows[0]!.id));

  const userRole = role ?? rows[0]!.role;
  let user;

  if (type === "email") {
    const userRows = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, storedContact), eq(usersTable.role, userRole)));
    user = userRows[0];
  } else if (type === "sms") {
    const shortPhone = storedContact.replace(/^\+91/, "");
    const userRows = await db
      .select()
      .from(usersTable)
      .where(and(
        or(eq(usersTable.phone, storedContact), eq(usersTable.phone, shortPhone)),
        eq(usersTable.role, userRole),
      ));
    user = userRows[0];
  }

  if (!user) {
    res.status(404).json({ error: "User not found" });
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
      level: user.level,
      subscriptionTier: user.subscriptionTier,
    },
  });
});

export default router;
