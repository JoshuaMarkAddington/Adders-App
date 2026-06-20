import { json, error, parseCookies } from "../../_lib/http.js";
import { issueCode } from "../../_lib/otp.js";

const PENDING_COOKIE = "ae_pending";

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const userId = parseCookies(request)[PENDING_COOKIE];
  if (!userId) return error("Your session expired — please log in again", 440);

  const user = await db.prepare("SELECT id, email FROM users WHERE id = ?").bind(userId).first();
  if (!user) return error("Account not found", 404);

  const { devCode } = await issueCode(env, db, user.id, "login", user.email);
  return json({ resent: true, devCode });
}
