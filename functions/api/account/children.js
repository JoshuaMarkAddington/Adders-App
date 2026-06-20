import { json, error, readJson } from "../../_lib/http.js";
import { getSessionUser } from "../../_lib/session.js";
import { newId } from "../../_lib/crypto.js";

// POST /api/account/children  { name, dob }
export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const user = await getSessionUser(db, request);
  if (!user) return error("Not signed in", 401);

  const body = await readJson(request);
  const name = (body?.name || "").trim();
  if (name.length < 2) return error("Please enter the child's name");

  const id = newId("chd");
  await db
    .prepare("INSERT INTO children (id, user_id, name, dob) VALUES (?, ?, ?, ?)")
    .bind(id, user.id, name, body?.dob || null)
    .run();

  return json({ child: { id, name, dob: body?.dob || null } });
}
