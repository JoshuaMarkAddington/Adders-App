import { json, error } from "../../_lib/http.js";
import { grantMembership, markApplicationActive } from "../../_lib/applications.js";
import { verifyWebhook } from "../../_lib/stripe.js";

// POST /api/filmschool/webhook  — Stripe webhook endpoint (backup to /confirm).
// On checkout.session.completed it marks the application active and grants
// membership, so payment is recorded even if the customer never returns to the
// success page. Configure the endpoint in the Stripe dashboard and set
// STRIPE_WEBHOOK_SECRET. Must read the raw body for signature verification.
export async function onRequestPost({ request, env }) {
  const rawBody = await request.text();
  const sig = request.headers.get("Stripe-Signature");

  let event;
  try {
    event = await verifyWebhook(env, rawBody, sig);
  } catch (e) {
    return error(`Webhook signature verification failed: ${e.message}`, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data && event.data.object;
    const meta = (session && session.metadata) || {};
    if (session && session.payment_status === "paid") {
      await markApplicationActive(env, meta.application_id);
      if (meta.user_id) await grantMembership(env, meta.user_id, meta.plan_type);
    }
  }

  return json({ received: true });
}
