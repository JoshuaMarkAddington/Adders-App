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
(Actions tab → Run workflow) to push them into the Pages project. The same
workflow also syncs `DATA_ENCRYPTION_KEY` and `DATA_ENCRYPTION_KEY2` (see
below) if those GitHub secrets are set too.

## Data protection & GDPR

This app handles children's personal data, including special-category health
information, so it is protected on several levels:

1. **At rest by Cloudflare** — D1 databases are encrypted by the platform.
2. **App-level field encryption (AES-256-GCM)** — every personal/health field
   the app writes is encrypted before it touches the database: Film School
   applications (guardian details, address, phone, emergency contact,
   allergies/additional needs/health issues), children's dates of birth, and
   account phone numbers. See `functions/_lib/encryption.js` for the scheme —
   AES-256-GCM, keys derived per-purpose with HKDF-SHA256 (never used raw),
   each ciphertext bound to its own row via AAD, with an optional second
   independent layer (`DATA_ENCRYPTION_KEY2`) so reading requires both
   secrets. **Both keys are enabled in this deployment.**
3. **Owner-only access to personal data** — the application registry is
   decrypted and returned **only to the owner account** (see below).
4. **Hashed secrets** — passwords (PBKDF2-SHA256, 600,000 iterations — the
   current OWASP-recommended minimum), session tokens and verification codes
   (SHA-256) are only ever stored hashed, never in plain text.

> **Required secrets — the app will not work without these.** `DATA_ENCRYPTION_KEY`
> (and `DATA_ENCRYPTION_KEY2` for the second layer) must be set as Cloudflare
> Pages secrets before deploying, or signup / Film School applications / adding
> a child will fail. Generate with:
> ```bash
> node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))'
> ```
> then either:
> - **CLI/dashboard directly:**
>   ```bash
>   npx wrangler pages secret put DATA_ENCRYPTION_KEY --project-name adders-app
>   npx wrangler pages secret put DATA_ENCRYPTION_KEY2 --project-name adders-app
>   ```
> - **Or via GitHub** (same method as `RESEND_API_KEY` above): add
>   `DATA_ENCRYPTION_KEY` and `DATA_ENCRYPTION_KEY2` to this repo's
>   **Settings → Secrets and variables → Actions**, then run the **Sync
>   Cloudflare secrets** workflow.
>
> Store both generated values somewhere safe outside the repo (e.g. a password
> manager) — if they're lost, encrypted personal data cannot be recovered.
> For local development, put the same two variables in a `.dev.vars` file at
> the repo root (already `.gitignore`d, never committed).

> **Note on the `applications` table.** This table is shared with the Adders
> website, which writes sign-ups in plain text (that code lives outside this
> repo). Rows the app writes are encrypted; rows the website writes stay
> plaintext until the website is updated to encrypt them too — `decryptField`
> passes plaintext values through unchanged, so both kinds of row read back
> correctly in the admin dashboard. **`email` is deliberately left
> unencrypted** in this table, because the website-to-app account link works
> by an equality lookup on it (`WHERE lower(email) = lower(?)`), which
> encrypted ciphertext can't support.

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
