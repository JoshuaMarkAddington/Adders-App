// Session creation / lookup for both users and admins.
import { randomToken, sha256, newId } from "./crypto.js";
import { parseCookies, cookieHeader } from "./http.js";

const USER_COOKIE = "ae_session";
const ADMIN_COOKIE = "ae_admin";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

// --- User sessions -------------------------------------------------------
export async function createUserSession(db, userId) {
  const token = randomToken();
  const id = await sha256(token);
  const expires = new Date(Date.now() + THIRTY_DAYS * 1000).toISOString();
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(id, userId, expires)
    .run();
  return cookieHeader(USER_COOKIE, token, { maxAge: THIRTY_DAYS });
}

export async function getSessionUser(db, request) {
  const token = parseCookies(request)[USER_COOKIE];
  if (!token) return null;
  const id = await sha256(token);
  const row = await db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
    )
    .bind(id)
    .first();
  return row || null;
}

export async function destroyUserSession(db, request) {
  const token = parseCookies(request)[USER_COOKIE];
  if (token) {
    const id = await sha256(token);
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
  }
  return cookieHeader(USER_COOKIE, "", { expires: 0 });
}

// --- Admin sessions ------------------------------------------------------
export async function createAdminSession(db, adminId) {
  const token = randomToken();
  const id = await sha256(token);
  const expires = new Date(Date.now() + THIRTY_DAYS * 1000).toISOString();
  await db
    .prepare("INSERT INTO admin_sessions (id, admin_id, expires_at) VALUES (?, ?, ?)")
    .bind(id, adminId, expires)
    .run();
  return cookieHeader(ADMIN_COOKIE, token, { maxAge: THIRTY_DAYS });
}

export async function getSessionAdmin(db, request) {
  const token = parseCookies(request)[ADMIN_COOKIE];
  if (!token) return null;
  const id = await sha256(token);
  const row = await db
    .prepare(
      `SELECT a.id, a.username FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
    )
    .bind(id)
    .first();
  return row || null;
}

export async function destroyAdminSession(db, request) {
  const token = parseCookies(request)[ADMIN_COOKIE];
  if (token) {
    const id = await sha256(token);
    await db.prepare("DELETE FROM admin_sessions WHERE id = ?").bind(id).run();
  }
  return cookieHeader(ADMIN_COOKIE, "", { expires: 0 });
}

// The single owner account allowed to see decrypted personal data.
// Defaults to "Joshua Addington"; override with the OWNER_USERNAME secret.
export function isOwner(env, admin) {
  if (!admin) return false;
  const owner = (env.OWNER_USERNAME || "Joshua Addington").trim().toLowerCase();
  return (admin.username || "").trim().toLowerCase() === owner;
}

// Shape a user row for the client (never leak the password hash).
export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || null,
    member: !!row.member,
    plan: row.plan || null,
    emailVerified: !!row.email_verified,
  };
}

export { newId };
