import { json, error, readJson } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";
import { newId } from "../../_lib/crypto.js";
import { encryptField } from "../../_lib/encryption.js";

// POST /api/filmschool/apply  — saves the application.
// Sensitive personal data (child details, contact info, health) is encrypted
// at rest. Payments are not wired yet, so the application is stored as
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

  // Encrypt every personal/contact/health field before it touches the DB.
  // Each ciphertext is bound to this record's id (AAD).
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
      studentName,
      studentDob,
      d.month1 || null,
      d.month2 || null,
      d.month3 || null,
      d.newToFilm ? 1 : 0,
      guardianName,
      guardianDob,
      addressLine1,
      addressLine2,
      city,
      county,
      postcode,
      email,
      phone,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      allergies,
      additionalNeeds,
      healthIssues,
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
