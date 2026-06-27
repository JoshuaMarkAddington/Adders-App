import { json, error, readJson, parseCookies, cookieHeader } from "../../_lib/http.js";
import { checkCode } from "../../_lib/otp.js";
import { createUserSession, publicUser } from "../../_lib/session.js";
import { linkMembershipByEmail } from "../../_lib/membership.js";

const PENDING_COOKIE = "ae_pending";

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const body = await readJson(request);
  if (!body) return error("Invalid request");

  const userId = parseCookies(request)[PENDING_COOKIE];
  if (!userId) return error("Your session expired — please log in again", 440);

  const code = (body.code || "").toString().trim();
  if (!/^\d{6}$/.test(code)) return error("Enter the 6-digit code");

  const result = await checkCode(db, userId, code, "login");
  if (!result.ok) {
    const msg =
      result.reason === "expired" ? "That code has expired — request a new one"
      : result.reason === "too_many_attempts" ? "Too many attempts — request a new code"
      : "That code isn't right";
    return error(msg, 401, { reason: result.reason });
  }

  await db.prepare("UPDATE users SET email_verified = 1, updated_at = datetime('now') WHERE id = ?").bind(userId).run();
  let user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();

  // Connect this account to any website sign-up made with the same email.
  user = await linkMembershipByEmail(db, user);

  const sessionCookie = await createUserSession(db, userId);
  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookie);
  headers.append("Set-Cookie", cookieHeader(PENDING_COOKIE, "", { expires: 0 }));
  return json({ user: publicUser(user) }, { headers });
}
