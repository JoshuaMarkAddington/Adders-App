import { json } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(env.DB, request);
  return json({ user: publicUser(user) });
}
