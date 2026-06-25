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
- **Membership payments via Stripe** — the application form checks out through
  Stripe Checkout (`functions/api/filmschool/checkout.js`, `confirm.js`,
  `webhook.js`)
- **Children on an account** (`functions/api/account/*`)
- **Admin / owner area** — separate login + a dashboard fed by real figures
  (`functions/api/admin/*`)

> **Until you add a Stripe key, payments fall back gracefully.** If
> `STRIPE_SECRET_KEY` is not set, `/checkout` saves the application as
> `awaiting_payment` and grants access immediately so the app stays fully
> usable. The moment the key is set, the same button sends customers to Stripe
> Checkout instead.

## One-time setup

1. **Create the database**

   ```bash
   npx wrangler d1 create adders-db
   ```

   Copy the printed `database_id` into `wrangler.toml` (replace
   `REPLACE_WITH_YOUR_DATABASE_ID`).

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
   add a D1 binding named `DB` pointing at `adders-db` (so the live Functions
   can reach it).

## Owner admin login

- **Username:** `Joshua Addington`
- **Password:** `Adders-8thvjTgy70O`  *(change this after first sign-in)*

The password is only ever stored as a salted PBKDF2-SHA256 hash — never in plain
text. Reach the owner area from the left rail → **Admin dashboard**.

## Sending real verification codes (SMTP2GO)

Codes are emailed via the **SMTP2GO HTTP API**. Set two secrets in the Pages
project and `functions/_lib/otp.js` uses them automatically:

```bash
npx wrangler pages secret put SMTP2GO_API_KEY
npx wrangler pages secret put MAIL_FROM      # a verified sender, e.g. "Adders <hello@addersentertainment.org>"
```

Until those are set, the code is shown on screen so the flow stays testable.
(Resend is also supported as a fallback, and SMS via Twilio can be added in the
same `deliver()` function later.)

## Taking membership payments (Stripe)

Memberships check out through **Stripe Checkout** (the hosted, PCI-compliant
payment page — no card details ever touch this app).

The flow:

1. The application form posts to **`POST /api/filmschool/checkout`**. The server
   validates the plan against its own price table (the client's amount is never
   trusted), saves the application as `awaiting_payment`, and creates a Stripe
   Checkout session. The app redirects the customer to Stripe.
2. On success Stripe returns the customer to `/?paid=1&session_id=…`. The app
   calls **`POST /api/filmschool/confirm`**, which verifies the session is
   `paid` directly with Stripe, marks the application `active`, and grants
   membership.
3. **`POST /api/filmschool/webhook`** is a backup: on `checkout.session.completed`
   it does the same activation, so payment is recorded even if the customer
   never returns to the success page.

Set the secret key (and, once you add the webhook endpoint in the Stripe
dashboard, the webhook signing secret):

```bash
npx wrangler pages secret put STRIPE_SECRET_KEY       # sk_live_… (or sk_test_…)
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET    # whsec_… (from the webhook endpoint)
```

In the Stripe dashboard, add a webhook endpoint pointing at
`https://YOUR-SITE/api/filmschool/webhook` and subscribe it to
`checkout.session.completed`.

**Until `STRIPE_SECRET_KEY` is set**, `/checkout` falls back to saving the
application and granting access immediately, so the app keeps working end to end
while you finish Stripe setup. Prices live server-side in
`functions/api/filmschool/checkout.js` — keep them in step with the `PRICES`
table in `src/App.jsx`.

## Data protection & GDPR

This app handles children's personal data, including special-category health
information, so it is protected with defence in depth
(`functions/_lib/encryption.js`):

1. **At rest by Cloudflare** — D1 databases are encrypted by the platform.
2. **AES-256-GCM field encryption** — every sensitive field on a Film School
   application (child name & DOB, guardian, full address, email, phone,
   emergency contact, allergies, additional needs, health issues) is encrypted
   before it is written. In the database these fields are unreadable ciphertext.
3. **HKDF key derivation** — the stored secret is never the working key; an AES
   key is derived from it with HKDF-SHA256.
4. **Per-record binding (AAD)** — each ciphertext is tied to its own record id,
   so it cannot be tampered with or moved to another row.
5. **Two independent layers** — when `DATA_ENCRYPTION_KEY2` is set, data is
   encrypted a second time under a separate key. Reading it then requires
   **both** secrets, which should be stored separately.

Set both keys as secrets (generate fresh ones and keep them safe — if a key is
lost, the data it protects cannot be recovered):

```bash
node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))'
npx wrangler pages secret put DATA_ENCRYPTION_KEY
node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))'
npx wrangler pages secret put DATA_ENCRYPTION_KEY2
```

Other GDPR-supporting features:

- **Owner-only access** — the registry that lists every registered child with
  guardian and contact details is decrypted **server-side, only for the owner
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
