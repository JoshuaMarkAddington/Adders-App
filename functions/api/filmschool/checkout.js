import { json, error, readJson } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";
import { saveApplication, grantMembership } from "../../_lib/applications.js";
import { stripeConfigured, createCheckoutSession } from "../../_lib/stripe.js";

// Server-side price table (authoritative — never trust the client's amount).
// Prices are the total for the term, in GBP pounds.
const PRICES = {
  standard: { 3: 150, 6: 270, 12: 480 },
  premium: { 3: 225, 6: 405, 12: 720 },
};

// POST /api/filmschool/checkout
// Saves the application, then either starts a Stripe Checkout session (when
// STRIPE_SECRET_KEY is configured) or — as a fallback until the key is set —
// grants membership directly so the app keeps working end to end.
export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const d = await readJson(request);
  if (!d || !d.studentName) return error("Missing application details");

  const plan = d.selectedPlan || {};
  const type = plan.type;
  const months = Number(plan.months);
  const pounds = PRICES[type] && PRICES[type][months];
  if (!pounds) return error("Please choose a valid membership plan");

  const user = await getSessionUser(db, request);

  // --- Fallback: no Stripe key yet -> behave like the direct apply flow. ---
  if (!stripeConfigured(env)) {
    const { id } = await saveApplication(env, d, user, "awaiting_payment");
    const updatedUser = user ? await grantMembership(env, user.id, type) : null;
    return json({ mode: "test", applicationId: id, status: "awaiting_payment", user: publicUser(updatedUser) });
  }

  // --- Real payment: save first (awaiting_payment), then start checkout. ---
  const { id } = await saveApplication(env, d, user, "awaiting_payment");
  const origin = new URL(request.url).origin;
  const label = `${type.charAt(0).toUpperCase() + type.slice(1)} membership (${months} months)`;

  try {
    const session = await createCheckoutSession(env, {
      amount: pounds * 100,
      currency: "gbp",
      productName: `Adders Film School — ${label}`,
      successUrl: `${origin}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/?canceled=1`,
      customerEmail: d.email || undefined,
      metadata: {
        application_id: id,
        user_id: user ? user.id : "",
        plan_type: type,
        plan_months: String(months),
      },
    });
    return json({ mode: "stripe", applicationId: id, url: session.url });
  } catch (e) {
    return error(`Could not start checkout: ${e.message}`, 502);
  }
}
