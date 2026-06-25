import { json, error, readJson } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";
import { saveApplication, grantMembership } from "../../_lib/applications.js";

// POST /api/filmschool/apply  — saves the application without taking payment.
// Sensitive personal data is encrypted at rest (see saveApplication). Used as
// the no-payment fallback when Stripe is not configured: the application is
// stored as 'awaiting_payment' and membership access is granted in the
// meantime. When Stripe is configured the app uses /checkout instead.
export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const d = await readJson(request);
  if (!d || !d.studentName) return error("Missing application details");

  const user = await getSessionUser(db, request);
  const { id } = await saveApplication(env, d, user, "awaiting_payment");

  let updatedUser = null;
  if (user) {
    const planType = d.selectedPlan && d.selectedPlan.type;
    updatedUser = await grantMembership(env, user.id, planType);
  }

  return json({ applicationId: id, status: "awaiting_payment", user: publicUser(updatedUser) });
}
