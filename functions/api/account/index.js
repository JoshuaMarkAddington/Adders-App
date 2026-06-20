import { json, error } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";

// GET /api/account  -> profile + children + current application
export async function onRequestGet({ request, env }) {
  const db = env.DB;
  const user = await getSessionUser(db, request);
  if (!user) return error("Not signed in", 401);

  const children = await db
    .prepare("SELECT id, name, dob FROM children WHERE user_id = ? ORDER BY created_at")
    .bind(user.id)
    .all();
  const application = await db
    .prepare("SELECT id, plan_type, plan_months, status, created_at FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1")
    .bind(user.id)
    .first();

  return json({
    user: publicUser(user),
    children: children.results || [],
    application: application || null,
  });
}
