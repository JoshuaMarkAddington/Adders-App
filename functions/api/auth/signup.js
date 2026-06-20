import { json, error, readJson, cookieHeader } from "../../_lib/http.js";
import { hashPassword, newId } from "../../_lib/crypto.js";
import { issueCode } from "../../_lib/otp.js";

const PENDING_COOKIE = "ae_pending";

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const body = await readJson(request);
  if (!body) return error("Invalid request");

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const phone = (body.phone || "").trim();
  const password = body.password || "";

  if (name.length < 2) return error("Please enter your full name");
  if (!/\S+@\S+\.\S+/.test(email)) return error("Please enter a valid email");
  if (password.length < 8) return error("Password must be at least 8 characters");

  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return error("An account with that email already exists", 409);

  const id = newId("usr");
  const passwordHash = await hashPassword(password);
  await db
    .prepare("INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)")
    .bind(id, name, email, phone || null, passwordHash)
    .run();

  const { devCode } = await issueCode(env, db, id, "login", email);

  const headers = new Headers();
  headers.append("Set-Cookie", cookieHeader(PENDING_COOKIE, id, { maxAge: 600 }));
  return json({ pending: true, devCode }, { headers });
}
