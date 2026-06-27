-- =========================================================================
--  ADDERS ENTERTAINMENT — database schema (Cloudflare D1 / SQLite)
--  Apply with:  npx wrangler d1 execute filmschool --file=./schema.sql
--  (add --remote to apply to the deployed database)
-- =========================================================================

-- ---- User accounts -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  member        INTEGER NOT NULL DEFAULT 0,   -- 0 = non-member, 1 = member
  plan          TEXT,                          -- 'Standard' | 'Premium' | NULL
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ---- Login sessions (cookie token -> user) -------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,        -- sha-256 of the cookie token
  user_id     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ---- One-time verification codes (login / signup confirmation) -----------
CREATE TABLE IF NOT EXISTS otp_codes (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  code_hash   TEXT NOT NULL,           -- sha-256 of the 6-digit code
  purpose     TEXT NOT NULL DEFAULT 'login',
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_codes(user_id);

-- ---- Children added to an account ----------------------------------------
CREATE TABLE IF NOT EXISTS children (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  dob         TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_children_user ON children(user_id);

-- ---- Film School applications --------------------------------------------
--  Created by the Adders website (and the in-app form). Accounts are linked to
--  a sign-up by matching `email`, so there is no user_id column here.
CREATE TABLE IF NOT EXISTS applications (
  id              TEXT PRIMARY KEY,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  status          TEXT NOT NULL DEFAULT 'pending_payment',  -- pending_payment | active
  plan_type       TEXT,                -- 'standard' | 'premium'
  plan_months     INTEGER,
  student_name    TEXT,
  student_dob     TEXT,
  month1          TEXT,
  month2          TEXT,
  month3          TEXT,
  new_to_film     INTEGER,
  guardian_name   TEXT,
  guardian_dob    TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  county          TEXT,
  postcode        TEXT,
  email           TEXT,
  phone           TEXT,
  emergency_same  INTEGER,
  emergency_name  TEXT,
  emergency_phone TEXT,
  emergency_relation TEXT,
  allergies       INTEGER,
  allergies_detail TEXT,
  additional_needs INTEGER,
  additional_needs_detail TEXT,
  health_issues   INTEGER,
  health_issues_detail TEXT,
  consent_filming INTEGER,
  consent_policy  INTEGER,
  stripe_client_reference_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);

-- ---- Admin accounts (owner / staff) --------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id          TEXT PRIMARY KEY,        -- sha-256 of the cookie token
  admin_id    TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
