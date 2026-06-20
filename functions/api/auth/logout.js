import { json } from "../../_lib/http.js";
import { destroyUserSession } from "../../_lib/session.js";

export async function onRequestPost({ request, env }) {
  const clearCookie = await destroyUserSession(env.DB, request);
  const headers = new Headers();
  headers.append("Set-Cookie", clearCookie);
  return json({ ok: true }, { headers });
}
