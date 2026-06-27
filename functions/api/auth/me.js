import { json } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";
import { linkMembershipByEmail } from "../../_lib/membership.js";

export async function onRequestGet({ request, env }) {
  let user = await getSessionUser(env.DB, request);
  // Catch website sign-ups made after this account already logged in.
  if (user && user.member !== 1) user = await linkMembershipByEmail(env.DB, user);
  return json({ user: publicUser(user) });
}
