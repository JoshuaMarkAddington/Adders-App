import { json, error, readJson } from "../../_lib/http.js";
import { publicUser } from "../../_lib/session.js";
import { grantMembership, markApplicationActive } from "../../_lib/applications.js";
import { stripeConfigured, retrieveCheckoutSession } from "../../_lib/stripe.js";

// POST /api/filmschool/confirm  { sessionId }
// Called when the customer returns from Stripe Checkout. Verifies the session
// is paid (server-side, against Stripe), then marks the application active and
// grants membership. Idempotent and safe to call more than once — it is the
// primary confirmation; the webhook is a backup.
export async function onRequestPost({ request, env }) {
  if (!stripeConfigured(env)) return error("Payments are not configured", 400);

  const body = await readJson(request);
  const sessionId = body && body.sessionId;
  if (!sessionId) return error("Missing session id");

  let session;
  try {
    session = await retrieveCheckoutSession(env, sessionId);
  } catch (e) {
    return error(`Could not verify payment: ${e.message}`, 502);
  }

  if (session.payment_status !== "paid") {
    return json({ paid: false, status: session.payment_status || "unpaid" });
  }

  const meta = session.metadata || {};
  await markApplicationActive(env, meta.application_id);
  const updatedUser = meta.user_id ? await grantMembership(env, meta.user_id, meta.plan_type) : null;

  return json({ paid: true, status: "active", user: publicUser(updatedUser) });
}
