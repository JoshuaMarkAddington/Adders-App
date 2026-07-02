# Getting Adders Entertainment onto Google Play

This app ships as a **Trusted Web Activity (TWA)** — a thin Android wrapper
around the live site (`https://app.addersentertainment.org`) with no browser
chrome. That means there's no separate app codebase to maintain; the wrapper
just points at the production site, which is now a proper installable PWA
(`public/manifest.json`, `public/sw.js`, `public/icons/`).

I couldn't run the final Android build myself — this environment has no
Android SDK and no outbound network access to your production domain — so
the steps below are what's left, in order.

## 1. Build the Android app (on a machine with Android SDK + internet)

```bash
npm i -g @bubblewrap/cli
cd android-twa
bubblewrap build
```

`android-twa/twa-manifest.json` is already filled in (package id, colours,
icons, start URL — all pulled from the deployed manifest). First run will:

- Download the Android SDK components it needs
- **Generate an upload keystore** — when prompted, set a strong keystore
  password and key password and **store them in a password manager**. If you
  lose this keystore, you cannot publish updates to the app under the same
  package id.
- Produce a signed `.aab` (Android App Bundle) — this is what you upload to
  Play Console.

**Do not commit the keystore file to git.** Keep it outside the repo (or add
it to `.gitignore` if it lands inside `android-twa/`).

## 2. Verify domain ownership (Digital Asset Links)

`public/.well-known/assetlinks.json` is already in place and will deploy with
the site, but it has a placeholder fingerprint. Once you've uploaded the
`.aab` to Play Console for the first time:

1. Play Console → your app → **Setup → App integrity** → copy the **SHA-256
   certificate fingerprint** under "App signing key certificate" (this is the
   key Google re-signs your app with — not your local upload keystore).
2. Replace `REPLACE_WITH_YOUR_APP_SIGNING_KEY_SHA256_FINGERPRINT` in
   `public/.well-known/assetlinks.json` with that value, then deploy.
3. Confirm it's live: `https://app.addersentertainment.org/.well-known/assetlinks.json`
   should return the JSON with the real fingerprint.

Without this step, the Android app opens with browser address-bar chrome
instead of full-screen — it still works, just looks like a browser tab.

## 3. Google Play Console account

- Create one at [play.google.com/console](https://play.google.com/console) —
  $25 one-time fee. Individual or organisation account (org needs a D-U-N-S
  number, takes longer to verify — individual is faster if this is your own
  business).

## 4. Store listing — what you'll need to fill in

| Item | Status |
|---|---|
| App icon (512×512) | ✅ `play-store-assets/hi-res-icon-512.png` (placeholder brand mark — swap for real branding if you have a logo) |
| Feature graphic (1024×500) | ✅ `play-store-assets/feature-graphic-1024x500.png` (placeholder) |
| Phone screenshots (min. 2) | ⬜ Take these from the running app once deployed |
| Short description (≤80 chars) | ⬜ e.g. "Adders Entertainment Film School — memberships & applications" |
| Full description (≤4000 chars) | ⬜ Needs your input |
| Privacy Policy URL | ⬜ **Blocked — see below** |
| Category, contact email | ⬜ Needs your input |

## 5. Privacy Policy (blocking)

Google Play **will reject the app without a live Privacy Policy URL**, and
this app collects children's guardian/health data, so the content matters.
I wasn't able to pull the existing policy from the Film School sign-up form —
this environment's network policy blocks outbound requests to
`fs.addersentertainment.org` and `app.addersentertainment.org`. Please paste
the policy text directly here and I'll turn it into a page the app and Play
Store listing can both link to.

## 6. Data Safety form (Play Console)

Based on what this app actually collects (see `BACKEND.md`), the honest
answers are roughly:

- **Collects:** name, email, phone, physical address, date of birth (student
  and guardian), health information (allergies/medical/additional needs),
  emergency contact details
- **Purpose:** app functionality (membership management), account
  management — not for advertising
- **Shared with third parties:** no (Resend/SMTP2GO only relay verification
  emails; Stripe payments happen on the website, not in this app)
- **Encrypted in transit:** yes (HTTPS)
- **Encrypted at rest:** yes (AES-256-GCM field-level encryption, see
  `BACKEND.md`)
- **Users can request deletion:** yes (GDPR erasure endpoint exists;
  Data Safety form asks for a way for users to request this — an email
  address you monitor is enough)

## 7. Content rating & target audience

The Film School programme is for **ages 13–17**. In Play Console's target
audience section, declare the actual age range honestly — this affects which
Play policies apply (e.g. ads policies, if you ever add any) and is required
for kids-adjacent apps. Given the health/guardian data collected, it's worth
a quick read of Play's **Families Policy** and the UK ICO's **Age Appropriate
Design Code** before submitting — both are about how you present consent and
handle under-18 data, not about the code itself.

## 8. Reviewer test access

Google's app reviewers need to actually log in to test core functionality
(the OTP email flow). Either:
- Give them a test account's email in the Play Console review notes and
  reply to the code by email quickly during review, or
- Add a fixed test OTP bypass for a designated test account (not currently
  implemented — ask if you want this added; it would need to be tightly
  scoped so it can't be abused in production).
