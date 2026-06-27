import { json, error } from "../../../_lib/http.js";
import { getSessionAdmin, isOwner } from "../../../_lib/session.js";

// GET /api/admin/applications  — full Film School registry.
//
// Sign-ups are created by the website and stored in the shared `applications`
// table. The registry is returned only to the owner account.
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

  const records = rows.map((r) => ({
    id: r.id,
    studentName: r.student_name,
    studentDob: r.student_dob,
    modules: [r.month1, r.month2, r.month3].filter(Boolean),
    newToFilm: !!r.new_to_film,
    guardianName: r.guardian_name,
    guardianDob: r.guardian_dob,
    address: [r.address_line1, r.address_line2, r.city, r.county, r.postcode]
      .filter(Boolean)
      .join(", "),
    email: r.email,
    phone: r.phone,
    emergencyName: r.emergency_name,
    emergencyPhone: r.emergency_phone,
    emergencyRelation: r.emergency_relation,
    allergies: detail(r.allergies, r.allergies_detail),
    additionalNeeds: detail(r.additional_needs, r.additional_needs_detail),
    healthIssues: detail(r.health_issues, r.health_issues_detail),
    plan: r.plan_type ? `${r.plan_type} · ${r.plan_months}m` : null,
    status: r.status,
    createdAt: r.created_at,
  }));

  return json({ applications: records });
}
