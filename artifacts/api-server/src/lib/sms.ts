import { logger } from "./logger.js";

function getTwilioConfig() {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const from = process.env["TWILIO_FROM"];
  if (!sid || !token || !from) return null;
  return { sid, token, from };
}

export async function sendOtpSms(to: string, otp: string, appName = "Cosmos Physics Academy"): Promise<boolean> {
  const cfg = getTwilioConfig();
  if (!cfg) {
    logger.warn({ to }, "Twilio not configured — SMS OTP not sent (dev mode)");
    return false;
  }
  const body = `${appName}: Your login code is ${otp}. Valid for 10 minutes. Do not share this code.`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.sid}/Messages.json`;
  const encoded = Buffer.from(`${cfg.sid}:${cfg.token}`).toString("base64");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: cfg.from, Body: body }).toString(),
    });
    if (!res.ok) {
      const txt = await res.text();
      logger.error({ status: res.status, body: txt }, "Twilio SMS failed");
      return false;
    }
    return true;
  } catch (err) {
    logger.error({ err }, "Twilio SMS error");
    return false;
  }
}
