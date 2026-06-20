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
- **Children on an account** (`functions/api/account/*`)
- **Admin / owner area** — separate login + a dashboard fed by real figures
  (`functions/api/admin/*`)

> **Payments are intentionally not wired yet.** Applications are saved with the
> status `awaiting_payment` and access is granted in the meantime. Stripe slots
> in next.

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

## Sending real verification codes

Until an email/SMS provider is connected, codes are shown on screen so you can
test the flow. To send real codes by **email**, set two secrets in the Pages
project and the code in `functions/_lib/otp.js` will use them automatically:

```bash
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put MAIL_FROM      # e.g. "Adders <hello@yourdomain>"
```

(SMS via Twilio can be added in the same `deliver()` function later.)

## Running it all locally

```bash
npm run dev:server
```

This builds the app and serves it together with the Functions and a local copy
of the database.
