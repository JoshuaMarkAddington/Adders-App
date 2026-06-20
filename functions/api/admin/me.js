import { json } from "../../_lib/http.js";
import { getSessionAdmin } from "../../_lib/session.js";

export async function onRequestGet({ request, env }) {
  const admin = await getSessionAdmin(env.DB, request);
  return json({ admin: admin || null });
}
