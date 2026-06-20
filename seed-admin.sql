-- =========================================================================
--  Seed the owner admin account.
--  Apply with: npx wrangler d1 execute adders-db --file=./seed-admin.sql
--  (add --remote for the deployed database)
--
--  Login username: Joshua Addington
--  Password:       Adders-8thvjTgy70O   <-- change this after first login
--
--  The password is stored only as a salted PBKDF2-SHA256 hash (never plain).
-- =========================================================================

INSERT INTO admins (id, username, password_hash)
VALUES (
  'adm_joshua',
  'Joshua Addington',
  'pbkdf2$sha256$210000$aaff4f6d6d023b6b65766be73bb3ea2e$9e1a811fec563482bb61c7f649c5cbbb1074c9a01de620b6627f3de759c56ba2'
)
ON CONFLICT(username) DO NOTHING;
