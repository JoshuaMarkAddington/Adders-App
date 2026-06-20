import { json } from "../../_lib/http.js";
import { destroyAdminSession } from "../../_lib/session.js";

export async function onRequestPost({ request, env }) {
  const clearCookie = await destroyAdminSession(env.DB, request);
  const headers = new Headers();
  headers.append("Set-Cookie", clearCookie);
  return json({ ok: true }, { headers });
}
