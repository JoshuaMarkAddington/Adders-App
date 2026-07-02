import { json, error, readJson } from "../../_lib/http.js";
import { getSessionUser, publicUser } from "../../_lib/session.js";
import { newId } from "../../_lib/crypto.js";
import { encryptField } from "../../_lib/encryption.js";

// POST /api/filmschool/apply  — saves a Film School application.
//
// Writes into the same `applications` table the website uses, so in-app and
// website sign-ups live together and can be linked to an account by email.
// Payment is handled on the website, so an in-app application is stored as
// 'pending_payment' and membership access is granted in the meantime.
//
// Personal/health fields are encrypted (AES-256-GCM, AAD-bound to this row's
// id) before they're written — `email` stays plaintext because the website
// links sign-ups to accounts with an equality lookup on it, which encrypted
// ciphertext can't support. See functions/_lib/encryption.js.
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

  const enc = (value) => encryptField(env, value, id);
  const emergencyName = d.emergencySame ? d.guardianName || null : d.emergencyName || null;
  const emergencyPhone = d.emergencySame ? d.phone || null : d.emergencyPhone || null;
  const emergencyRelation = d.emergencySame ? "Guardian" : d.emergencyRelation || null;
  const allergiesDetail = d.allergies ? d.allergiesDetail || null : null;
  const additionalNeedsDetail = d.additionalNeeds ? d.additionalNeedsDetail || null : null;
  const healthIssuesDetail = d.healthIssues ? d.healthIssuesDetail || null : null;

  const [
    studentName, studentDob, guardianName, guardianDob,
    addressLine1, addressLine2, city, county, postcode, phone,
    encEmergencyName, encEmergencyPhone, encEmergencyRelation,
    encAllergiesDetail, encAdditionalNeedsDetail, encHealthIssuesDetail,
  ] = await Promise.all([
    enc(d.studentName), enc(d.studentDob || null), enc(d.guardianName || null), enc(d.guardianDob || null),
    enc(d.addressLine1 || null), enc(d.addressLine2 || null), enc(d.city || null), enc(d.county || null),
    enc(d.postcode || null), enc(d.phone || null),
    enc(emergencyName), enc(emergencyPhone), enc(emergencyRelation),
    enc(allergiesDetail), enc(additionalNeedsDetail), enc(healthIssuesDetail),
  ]);

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
      email || null,
      phone,
      d.emergencySame ? 1 : 0,
      encEmergencyName,
      encEmergencyPhone,
      encEmergencyRelation,
      d.allergies ? 1 : 0,
      encAllergiesDetail,
      d.additionalNeeds ? 1 : 0,
      encAdditionalNeedsDetail,
      d.healthIssues ? 1 : 0,
      encHealthIssuesDetail,
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

  return json({ applicationId: id, status: "pending_payment", user: await publicUser(updatedUser, env) });
}
