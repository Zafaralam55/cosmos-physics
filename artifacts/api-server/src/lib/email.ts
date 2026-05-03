import nodemailer from "nodemailer";
import { logger } from "./logger.js";

function createTransport() {
  const host = process.env["SMTP_HOST"];
  const port = parseInt(process.env["SMTP_PORT"] ?? "587", 10);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  const from = process.env["SMTP_FROM"] ?? user ?? "noreply@cosmos.in";

  if (!host || !user || !pass) {
    return null;
  }
  return { transport: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

export async function sendOtpEmail(to: string, otp: string, appName = "Cosmos Physics Academy"): Promise<boolean> {
  const cfg = createTransport();
  if (!cfg) {
    logger.warn("SMTP not configured — OTP would be: " + otp + " for " + to);
    return false;
  }
  try {
    await cfg.transport.sendMail({
      from: `"${appName}" <${cfg.from}>`,
      to,
      subject: `Your ${appName} login code: ${otp}`,
      text: `Your one-time login code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0a0e1a;color:#e2e8f0;border-radius:16px">
  <h2 style="color:#5B8CFF;margin-bottom:8px">${appName}</h2>
  <p style="color:#94a3b8">Your one-time sign-in code:</p>
  <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#fff;background:#1e293b;padding:20px;border-radius:12px;text-align:center;margin:16px 0">${otp}</div>
  <p style="color:#94a3b8;font-size:13px">This code expires in <strong>10 minutes</strong>.<br>If you didn't request this, please ignore this email.</p>
</div>`,
    });
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send OTP email");
    return false;
  }
}
