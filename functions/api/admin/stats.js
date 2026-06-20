import { json, error } from "../../_lib/http.js";
import { getSessionAdmin } from "../../_lib/session.js";

// GET /api/admin/stats  — real figures for the owner dashboard.
export async function onRequestGet({ request, env }) {
  const db = env.DB;
  const admin = await getSessionAdmin(db, request);
  if (!admin) return error("Not signed in", 401);

  const members = await db.prepare("SELECT COUNT(*) AS n FROM users WHERE member = 1").first();
  const accounts = await db.prepare("SELECT COUNT(*) AS n FROM users").first();
  const applications = await db.prepare("SELECT COUNT(*) AS n FROM applications").first();
  const children = await db.prepare("SELECT COUNT(*) AS n FROM children").first();

  return json({
    totals: {
      members: members?.n || 0,
      accounts: accounts?.n || 0,
      applications: applications?.n || 0,
      children: children?.n || 0,
    },
  });
}
