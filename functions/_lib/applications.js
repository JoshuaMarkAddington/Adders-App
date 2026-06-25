import { newId } from "./crypto.js";
import { encryptField } from "./encryption.js";

// Persist a Film School application. Every personal/contact/health field is
// encrypted at rest and bound to this record's id (AAD). Shared by the direct
// apply endpoint and the Stripe checkout endpoint so the storage format and
// encryption stay identical.
//
// Returns { id } — the new application id.
export async function saveApplication(env, d, user, status = "awaiting_payment") {
  const db = env.DB;
  const detail = (flag, text) => (flag ? (text || "").trim() || "yes" : "none");
  const plan = d.selectedPlan || {};
  const planType = plan.type || null;
  const planMonths = plan.months || null;
  const id = newId("app");

  const E = (v) => encryptField(env, v, id);
  const [
    studentName, studentDob, guardianName, guardianDob,
    addressLine1, addressLine2, city, county, postcode, email, phone,
    emergencyName, emergencyPhone, emergencyRelation,
    allergies, additionalNeeds, healthIssues,
  ] = await Promise.all([
    E(d.studentName), E(d.studentDob), E(d.guardianName), E(d.guardianDob),
    E(d.addressLine1), E(d.addressLine2), E(d.city), E(d.county), E(d.postcode), E(d.email), E(d.phone),
    E(d.emergencySame ? d.guardianName : d.emergencyName),
    E(d.emergencySame ? d.phone : d.emergencyPhone),
    E(d.emergencySame ? "Guardian" : d.emergencyRelation),
    E(detail(d.allergies, d.allergiesDetail)),
    E(detail(d.additionalNeeds, d.additionalNeedsDetail)),
    E(detail(d.healthIssues, d.healthIssuesDetail)),
  ]);

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
      studentName, studentDob,
      d.month1 || null, d.month2 || null, d.month3 || null,
      d.newToFilm ? 1 : 0,
      guardianName, guardianDob,
      addressLine1, addressLine2, city, county, postcode,
      email, phone,
      emergencyName, emergencyPhone, emergencyRelation,
      allergies, additionalNeeds, healthIssues,
      d.consentFilming ? 1 : 0, d.consentPolicy ? 1 : 0,
      planType, planMonths,
      status,
    )
    .run();

  return { id };
}

// Grant (or refresh) a user's membership after a successful payment, or in the
// no-payment fallback. Idempotent. Returns the updated user row, or null.
export async function grantMembership(env, userId, planType) {
  if (!userId) return null;
  const db = env.DB;
  const current = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
  if (!current) return null;
  const planName = planType
    ? planType.charAt(0).toUpperCase() + planType.slice(1)
    : current.plan;
  await db
    .prepare("UPDATE users SET member = 1, plan = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(planName, userId)
    .run();
  return await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
}

// Mark an application as paid/active. Idempotent.
export async function markApplicationActive(env, applicationId) {
  if (!applicationId) return;
  await env.DB
    .prepare("UPDATE applications SET status = 'active' WHERE id = ?")
    .bind(applicationId)
    .run();
}
