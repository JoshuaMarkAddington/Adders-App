import { json, error } from "../../../_lib/http.js";
import { getSessionAdmin, isOwner } from "../../../_lib/session.js";
import { decryptField } from "../../../_lib/encryption.js";

// GET /api/admin/applications  — full Film School registry.
// Every child + contact record is decrypted here, server-side, ONLY for the
// owner account. The data is never sent to anyone else.
export async function onRequestGet({ request, env }) {
  const db = env.DB;
  const admin = await getSessionAdmin(db, request);
  if (!admin) return error("Not signed in", 401);
  if (!isOwner(env, admin)) return error("Only the owner can view personal data", 403);

  const rows = (await db
    .prepare(
      `SELECT id, student_name, student_dob, module1, module2, module3, new_to_film,
              guardian_name, guardian_dob, address_line1, address_line2, city, county, postcode,
              email, phone, emergency_name, emergency_phone, emergency_relation,
              allergies, additional_needs, health_issues, plan_type, plan_months, status, created_at
       FROM applications ORDER BY created_at DESC`,
    )
    .all()).results || [];

  const records = await Promise.all(
    rows.map(async (r) => {
      const D = (v) => decryptField(env, v, r.id); // bound to this record (AAD)
      return {
        id: r.id,
        studentName: await D(r.student_name),
        studentDob: await D(r.student_dob),
        modules: [r.module1, r.module2, r.module3].filter(Boolean),
        newToFilm: !!r.new_to_film,
        guardianName: await D(r.guardian_name),
        guardianDob: await D(r.guardian_dob),
        address: [await D(r.address_line1), await D(r.address_line2), await D(r.city), await D(r.county), await D(r.postcode)]
          .filter(Boolean)
          .join(", "),
        email: await D(r.email),
        phone: await D(r.phone),
        emergencyName: await D(r.emergency_name),
        emergencyPhone: await D(r.emergency_phone),
        emergencyRelation: await D(r.emergency_relation),
        allergies: await D(r.allergies),
        additionalNeeds: await D(r.additional_needs),
        healthIssues: await D(r.health_issues),
        plan: r.plan_type ? `${r.plan_type} · ${r.plan_months}m` : null,
        status: r.status,
        createdAt: r.created_at,
      };
    }),
  );

  return json({ applications: records });
}
