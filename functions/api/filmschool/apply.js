import { json, error, readJson } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";
import { newId } from "../../_lib/crypto.js";

// POST /api/filmschool/apply  — saves a Film School application.
//
// Writes into the same `applications` table the website uses, so in-app and
// website sign-ups live together and can be linked to an account by email.
// Payment is handled on the website, so an in-app application is stored as
// 'pending_payment' and membership access is granted in the meantime.
export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const d = await readJson(request);
  if (!d || !d.studentName) return error("Missing application details");

  const user = await getSessionUser(db, request);
  const plan = d.selectedPlan || {};
  const planType = plan.type || null;
  const planMonths = plan.months || null;
  const id = newId("app");
  const email = (d.email || (user && user.email) || "").trim().toLowerCase();

  await db
    .prepare(
      `INSERT INTO applications (
        id, status, plan_type, plan_months, student_name, student_dob,
        month1, month2, month3, new_to_film, guardian_name, guardian_dob,
        address_line1, address_line2, city, county, postcode, email, phone,
        emergency_same, emergency_name, emergency_phone, emergency_relation,
        allergies, allergies_detail, additional_needs, additional_needs_detail,
        health_issues, health_issues_detail, consent_filming, consent_policy
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      "pending_payment",
      planType,
      planMonths,
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
      email || null,
      d.phone || null,
      d.emergencySame ? 1 : 0,
      d.emergencySame ? d.guardianName || null : d.emergencyName || null,
      d.emergencySame ? d.phone || null : d.emergencyPhone || null,
      d.emergencySame ? "Guardian" : d.emergencyRelation || null,
      d.allergies ? 1 : 0,
      d.allergies ? d.allergiesDetail || null : null,
      d.additionalNeeds ? 1 : 0,
      d.additionalNeeds ? d.additionalNeedsDetail || null : null,
      d.healthIssues ? 1 : 0,
      d.healthIssues ? d.healthIssuesDetail || null : null,
      d.consentFilming ? 1 : 0,
      d.consentPolicy ? 1 : 0,
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

  return json({ applicationId: id, status: "pending_payment", user: publicUser(updatedUser) });
}
