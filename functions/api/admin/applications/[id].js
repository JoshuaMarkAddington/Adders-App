import { json, error } from "../../../_lib/http.js";
import { getSessionAdmin, isOwner } from "../../../_lib/session.js";

// DELETE /api/admin/applications/:id  — GDPR right-to-erasure.
// Permanently removes a Film School application record (owner only).
export async function onRequestDelete({ request, env, params }) {
  const db = env.DB;
  const admin = await getSessionAdmin(db, request);
  if (!admin) return error("Not signed in", 401);
  if (!isOwner(env, admin)) return error("Only the owner can delete records", 403);

  const id = params.id;
  const res = await db.prepare("DELETE FROM applications WHERE id = ?").bind(id).run();
  return json({ deleted: res.meta?.changes || 0 });
}
