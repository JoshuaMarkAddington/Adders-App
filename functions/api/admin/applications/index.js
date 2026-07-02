import { json, error } from "../../../_lib/http.js";
import { getSessionAdmin, isOwner } from "../../../_lib/session.js";
import { decryptField } from "../../../_lib/encryption.js";

// GET /api/admin/applications  — full Film School registry.
//
// Sign-ups are created by the website and stored in the shared `applications`
// table. The registry is returned only to the owner account. Personal/health
// fields written by the app are encrypted at rest (see apply.js); this
// decrypts them for display. Rows written by the website (still plaintext)
// pass through decryptField unchanged.
export async function onRequestGet({ request, env }) {
  const db = env.DB;
  const admin = await getSessionAdmin(db, request);
  if (!admin) return error("Not signed in", 401);
  if (!isOwner(env, admin)) return error("Only the owner can view personal data", 403);

  const rows = (await db
    .prepare(
      `SELECT id, student_name, student_dob, month1, month2, month3, new_to_film,
              guardian_name, guardian_dob, address_line1, address_line2, city, county, postcode,
              email, phone, emergency_name, emergency_phone, emergency_relation,
              allergies, allergies_detail, additional_needs, additional_needs_detail,
              health_issues, health_issues_detail, plan_type, plan_months, status, created_at
       FROM applications ORDER BY created_at DESC`,
    )
    .all()).results || [];

  // Each "has X?" flag is paired with a free-text detail column.
  const detail = (flag, text) => (flag ? (text || "yes") : "none");

  const records = await Promise.all(rows.map(async (r) => {
    const dec = (value) => decryptField(env, value, r.id);
    const [
      studentName, studentDob, guardianName, guardianDob,
      addressLine1, addressLine2, city, county, postcode, phone,
      emergencyName, emergencyPhone, emergencyRelation,
      allergiesDetail, additionalNeedsDetail, healthIssuesDetail,
    ] = await Promise.all([
      dec(r.student_name), dec(r.student_dob), dec(r.guardian_name), dec(r.guardian_dob),
      dec(r.address_line1), dec(r.address_line2), dec(r.city), dec(r.county), dec(r.postcode), dec(r.phone),
      dec(r.emergency_name), dec(r.emergency_phone), dec(r.emergency_relation),
      dec(r.allergies_detail), dec(r.additional_needs_detail), dec(r.health_issues_detail),
    ]);

    return {
      id: r.id,
      studentName,
      studentDob,
      modules: [r.month1, r.month2, r.month3].filter(Boolean),
      newToFilm: !!r.new_to_film,
      guardianName,
      guardianDob,
      address: [addressLine1, addressLine2, city, county, postcode].filter(Boolean).join(", "),
      email: r.email,
      phone,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      allergies: detail(r.allergies, allergiesDetail),
      additionalNeeds: detail(r.additional_needs, additionalNeedsDetail),
      healthIssues: detail(r.health_issues, healthIssuesDetail),
      plan: r.plan_type ? `${r.plan_type} · ${r.plan_months}m` : null,
      status: r.status,
      createdAt: r.created_at,
    };
  }));

  return json({ applications: records });
}
