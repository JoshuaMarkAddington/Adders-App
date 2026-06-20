import { json, error, readJson, cookieHeader } from "../../_lib/http.js";
import { verifyPassword } from "../../_lib/crypto.js";
import { issueCode } from "../../_lib/otp.js";

const PENDING_COOKIE = "ae_pending";

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const body = await readJson(request);
  if (!body) return error("Invalid request");

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) return error("Enter your email and password");

  const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  // Always run a verification to avoid leaking which emails exist (timing).
  const ok = user ? await verifyPassword(password, user.password_hash) : await verifyPassword(password, "");
  if (!user || !ok) return error("Incorrect email or password", 401);

  const { devCode } = await issueCode(env, db, user.id, "login", user.email);

  const headers = new Headers();
  headers.append("Set-Cookie", cookieHeader(PENDING_COOKIE, user.id, { maxAge: 600 }));
  return json({ pending: true, devCode }, { headers });
}
