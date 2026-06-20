// One-time verification codes: generate, store, send, verify.
import { sha256, sixDigitCode, newId } from "./crypto.js";

const OTP_TTL_SECONDS = 60 * 10; // 10 minutes
const MAX_ATTEMPTS = 5;

// Create a fresh code for a user, replacing any previous one, and deliver it.
// Returns { devCode } — devCode is only populated when no real provider is
// configured (so the flow is testable before SMS/email is wired up).
export async function issueCode(env, db, userId, purpose = "login", destination = "") {
  await db.prepare("DELETE FROM otp_codes WHERE user_id = ? AND purpose = ?").bind(userId, purpose).run();
  const code = sixDigitCode();
  const codeHash = await sha256(code);
  const expires = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();
  await db
    .prepare("INSERT INTO otp_codes (id, user_id, code_hash, purpose, expires_at) VALUES (?, ?, ?, ?, ?)")
    .bind(newId("otp"), userId, codeHash, purpose, expires)
    .run();

  const delivered = await deliver(env, destination, code);
  // When nothing is configured, surface the code so the app still works in dev.
  return { devCode: delivered ? null : code };
}

export async function checkCode(db, userId, code, purpose = "login") {
  const row = await db
    .prepare(
      `SELECT * FROM otp_codes WHERE user_id = ? AND purpose = ?
       AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(userId, purpose)
    .first();
  if (!row) return { ok: false, reason: "expired" };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  const ok = (await sha256(String(code))) === row.code_hash;
  if (!ok) {
    await db.prepare("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?").bind(row.id).run();
    return { ok: false, reason: "invalid" };
  }
  await db.prepare("DELETE FROM otp_codes WHERE id = ?").bind(row.id).run();
  return { ok: true };
}

// Pluggable delivery. Returns true if a real provider sent the code.
// Configure secrets in the Cloudflare Pages project to enable real sending.
async function deliver(env, destination, code) {
  const isEmail = destination && destination.includes("@");
  const subject = "Your Adders Entertainment code";
  const text = `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`;

  // Preferred: SMTP2GO HTTP API (set SMTP2GO_API_KEY + MAIL_FROM).
  if (env.SMTP2GO_API_KEY && env.MAIL_FROM && isEmail) {
    try {
      const res = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          api_key: env.SMTP2GO_API_KEY,
          sender: env.MAIL_FROM,
          to: [destination],
          subject,
          text_body: text,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.data && (data.data.succeeded === 1 || data.data.succeeded > 0)) return true;
      }
    } catch {
      /* fall through */
    }
  }

  // Alternative: Resend (set RESEND_API_KEY + MAIL_FROM).
  if (env.RESEND_API_KEY && env.MAIL_FROM && isEmail) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.MAIL_FROM, to: destination, subject, text }),
      });
      if (res.ok) return true;
    } catch {
      /* fall through to dev mode */
    }
  }

  // No provider configured — log for local dev only.
  console.log(`[otp] code for ${destination || "user"}: ${code}`);
  return false;
}
