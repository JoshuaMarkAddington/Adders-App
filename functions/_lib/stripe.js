// Minimal Stripe client for Cloudflare Workers — uses fetch + the Stripe REST
// API (no SDK, which isn't Workers-friendly). Only what the checkout flow needs.

const API = "https://api.stripe.com/v1";
const enc = new TextEncoder();

export function stripeConfigured(env) {
  return !!env.STRIPE_SECRET_KEY;
}

// Flatten a nested object into Stripe's bracket form-encoding, e.g.
// { line_items: [{ quantity: 1 }] } -> line_items[0][quantity]=1
function toForm(obj, prefix = "", out = new URLSearchParams()) {
  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue;
    const field = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item != null && typeof item === "object") toForm(item, `${field}[${i}]`, out);
        else out.append(`${field}[${i}]`, String(item));
      });
    } else if (typeof value === "object") {
      toForm(value, field, out);
    } else {
      out.append(field, String(value));
    }
  }
  return out;
}

async function stripePost(env, path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toForm(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || `Stripe error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function stripeGet(env, path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || `Stripe error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// Create a one-time (mode=payment) Checkout Session for a membership term.
export function createCheckoutSession(env, {
  amount, currency = "gbp", productName, quantity = 1,
  successUrl, cancelUrl, customerEmail, metadata = {},
}) {
  return stripePost(env, "/checkout/sessions", {
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail || undefined,
    line_items: [
      {
        quantity,
        price_data: {
          currency,
          unit_amount: amount, // in the smallest currency unit (pence)
          product_data: { name: productName },
        },
      },
    ],
    metadata,
  });
}

export function retrieveCheckoutSession(env, id) {
  return stripeGet(env, `/checkout/sessions/${encodeURIComponent(id)}`);
}

// Verify a Stripe webhook signature (the "t=…,v1=…" Stripe-Signature header)
// and return the parsed event. Throws if the signature is missing/invalid.
export async function verifyWebhook(env, rawBody, sigHeader) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Webhook secret not configured");
  if (!sigHeader) throw new Error("Missing signature");

  let t = null;
  const v1 = [];
  for (const part of sigHeader.split(",")) {
    const [k, val] = part.split("=");
    if (k === "t") t = val;
    else if (k === "v1") v1.push(val);
  }
  if (!t || v1.length === 0) throw new Error("Malformed signature");

  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  const ok = v1.some((sig) => sig.length === expected.length && timingSafeEqual(sig, expected));
  if (!ok) throw new Error("Signature mismatch");

  return JSON.parse(rawBody);
}

function timingSafeEqual(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
