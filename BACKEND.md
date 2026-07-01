# Adders Entertainment — Backend

The backend runs as **Cloudflare Pages Functions** (the `functions/` folder)
with a **Cloudflare D1** database. It deploys automatically alongside the app —
no separate server to host.

## What's included

- **Accounts & login** — create account, log in, log out, "keep me logged in"
  sessions (`functions/api/auth/*`)
- **Verification codes** — real 6-digit one-time codes, stored hashed with a
  10-minute expiry (`functions/_lib/otp.js`)
- **Film School applications** — the whole form is saved to the database
  (`functions/api/filmschool/apply.js`)
- **Website ⇄ app account linking** — the app shares one database with the
  Adders website. People sign up (and pay) on the website, which stores each
  sign-up in the `applications` table keyed by **email**. When that person signs
  in to the app with the same email, their sign-up is linked to their account
  and membership is granted (`functions/_lib/membership.js`).
- **Children on an account** (`functions/api/account/*`)
- **Admin / owner area** — separate login + a dashboard fed by real figures
  (`functions/api/admin/*`)

> **Payments live on the website.** In-app applications are saved with the
> status `pending_payment` and access is granted in the meantime; the website's
> Stripe flow records the payment reference on the same row.

## One-time setup

1. **Database** — the live D1 database is **`filmschool`**
   (id `0add03d2-c595-4565-872b-c1522cb75efa`), already created and wired into
   `wrangler.toml`. To start fresh on a new account instead, run
   `npx wrangler d1 create <name>` and paste the printed `database_id` into
   `wrangler.toml`.

2. **Create the tables** (add `:remote` versions for the live database)

   ```bash
   npm run db:init        # local
   npm run db:seed        # local — creates the owner admin account
   ```

   For the deployed site:

   ```bash
   npm run db:init:remote
   npm run db:seed:remote
   ```

3. **Bind the database in Cloudflare Pages** — in the Pages project settings,
   add a D1 binding named `DB` pointing at `filmschool` (so the live Functions
   can reach it).

## Owner admin login

- **Username:** `Joshua Addington`
- **Password:** `Adders-8thvjTgy70O`  *(change this after first sign-in)*

The password is only ever stored as a salted PBKDF2-SHA256 hash — never in plain
text. Reach the owner area from the left rail → **Admin dashboard**.

## Sending real verification codes (Resend)

Codes are emailed via the **Resend API** (SMTP2GO is also supported as an
alternative — `functions/_lib/otp.js` tries SMTP2GO first, then Resend). Set two
secrets on the `adders-app` Cloudflare Pages project and they're picked up
automatically:

- `RESEND_API_KEY` — from Resend → API Keys
- `MAIL_FROM` — a verified sender, e.g. `"Adders <hello@addersentertainment.org>"`

Until those are set, the code is shown on screen so the flow stays testable.

**Option A — CLI / dashboard directly:**

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name adders-app
npx wrangler pages secret put MAIL_FROM --project-name adders-app
```

(or Cloudflare dashboard → Workers & Pages → adders-app → Settings → Variables and Secrets)

**Option B — via GitHub (matches how the website's secrets are managed):**
Add these to this repo's **Settings → Secrets and variables → Actions**:
`CLOUDFLARE_API_TOKEN` (a token with Pages edit access), `CLOUDFLARE_ACCOUNT_ID`,
`RESEND_API_KEY`, `MAIL_FROM`. Then run the **Sync Cloudflare secrets** workflow
(Actions tab → Run workflow) to push them into the Pages project.

## Data protection & GDPR

This app handles children's personal data, including special-category health
information, so it is protected on several levels:

1. **At rest by Cloudflare** — D1 databases are encrypted by the platform.
2. **Owner-only access to personal data** — the application registry is returned
   **only to the owner account** (see below).
3. **Hashed secrets** — passwords (PBKDF2-SHA256), session tokens and
   verification codes (SHA-256) are only ever stored hashed, never in plain
   text.

> **Note on the `applications` table.** This table is shared with the Adders
> website, which writes sign-ups in plain text. To keep one consistent table,
> the in-app form also writes plain text — so personal/health fields are **not**
> field-level encrypted, only protected by Cloudflare's at-rest encryption and
> owner-only access. If you want application fields encrypted at the field level,
> the website code (outside this repo) has to encrypt them too, since it writes
> to the same table. A field-encryption helper is still available in
> `functions/_lib/encryption.js` for any new, app-only data.

Other GDPR-supporting features:

- **Owner-only access** — the registry that lists every registered child with
  guardian and contact details is returned **server-side, only for the owner
  account** (`Joshua Addington`, or whoever `OWNER_USERNAME` names). No other
  admin can ever see the personal data (`GET /api/admin/applications`).
- **Right to erasure** — each record has a "Delete record (GDPR erasure)"
  action; owner only (`DELETE /api/admin/applications/:id`).
- **Data minimisation** — login responses are constant-time and never reveal
  whether an email exists; passwords and tokens are only ever stored hashed.

## Running it all locally

```bash
npm run dev:server
```

This builds the app and serves it together with the Functions and a local copy
of the database.
