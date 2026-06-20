import { json, error, readJson } from "../../_lib/http.js";
import { verifyPassword } from "../../_lib/crypto.js";
import { createAdminSession } from "../../_lib/session.js";

// POST /api/admin/login  { username, password }
export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const body = await readJson(request);
  const username = (body?.username || "").trim();
  const password = body?.password || "";
  if (!username || !password) return error("Enter your username and password");

  const admin = await db.prepare("SELECT * FROM admins WHERE username = ?").bind(username).first();
  const ok = admin ? await verifyPassword(password, admin.password_hash) : await verifyPassword(password, "");
  if (!admin || !ok) return error("Incorrect username or password", 401);

  const cookie = await createAdminSession(db, admin.id);
  const headers = new Headers();
  headers.append("Set-Cookie", cookie);
  return json({ admin: { id: admin.id, username: admin.username } }, { headers });
}
