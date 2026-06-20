import { json, error, readJson } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";
import { newId } from "../../_lib/crypto.js";

// POST /api/filmschool/apply  — saves the application.
// Payments are not wired yet, so the application is stored as
// 'awaiting_payment' and membership access is granted in the meantime.
export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const d = await readJson(request);
  if (!d || !d.studentName) return error("Missing application details");

  const user = await getSessionUser(db, request);

  const detail = (flag, text) => (flag ? (text || "").trim() || "yes" : "none");
  const plan = d.selectedPlan || {};
  const planType = plan.type || null;
  const planMonths = plan.months || null;
  const id = newId("app");

  await db
    .prepare(
      `INSERT INTO applications (
        id, user_id, student_name, student_dob, module1, module2, module3, new_to_film,
        guardian_name, guardian_dob, address_line1, address_line2, city, county, postcode,
        email, phone, emergency_name, emergency_phone, emergency_relation,
        allergies, additional_needs, health_issues, consent_filming, consent_policy,
        plan_type, plan_months, status
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      user ? user.id : null,
      d.studentName,
      d.studentDob || null,
      d.month1 || null,
      d.month2 || null,
      d.month3 || null,
      d.newToFilm ? 1 : 0,
      d.guardianName || null,
      d.guardianDob || null,
      d.addressLine1 || null,
      d.addressLine2 || null,
      d.city || null,
      d.county || null,
      d.postcode || null,
      d.email || null,
      d.phone || null,
      d.emergencySame ? d.guardianName || null : d.emergencyName || null,
      d.emergencySame ? d.phone || null : d.emergencyPhone || null,
      d.emergencySame ? "Guardian" : d.emergencyRelation || null,
      detail(d.allergies, d.allergiesDetail),
      detail(d.additionalNeeds, d.additionalNeedsDetail),
      detail(d.healthIssues, d.healthIssuesDetail),
      d.consentFilming ? 1 : 0,
      d.consentPolicy ? 1 : 0,
      planType,
      planMonths,
      "awaiting_payment",
    )
    .run();

  let updatedUser = null;
  if (user) {
    const planName = planType ? planType.charAt(0).toUpperCase() + planType.slice(1) : user.plan;
    await db
      .prepare("UPDATE users SET member = 1, plan = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(planName, user.id)
      .run();
    updatedUser = await db.prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first();
  }

  return json({ applicationId: id, status: "awaiting_payment", user: publicUser(updatedUser) });
}
