// Connects an app account to a website sign-up by email.
//
// People sign up (and pay) on the Adders website, which stores each sign-up in
// the shared `applications` table keyed by their email address. When that same
// person signs in to the app with the same email, we link the two together and
// grant them membership — so the website sign-up "follows" them into the app.
export async function linkMembershipByEmail(db, user) {
  if (!user || !user.email) return user;

  const application = await db
    .prepare(
      `SELECT plan_type, plan_months FROM applications
       WHERE lower(email) = lower(?)
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(user.email)
    .first();
  if (!application) return user;

  const planName = application.plan_type
    ? application.plan_type.charAt(0).toUpperCase() + application.plan_type.slice(1)
    : user.plan || null;

  // Nothing to do if the account is already linked with the same plan.
  if (user.member === 1 && (user.plan || null) === planName) return user;

  await db
    .prepare("UPDATE users SET member = 1, plan = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(planName, user.id)
    .run();

  return (await db.prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first()) || user;
}
