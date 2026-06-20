// Field-level encryption for sensitive personal data (GDPR).
//
// Cloudflare D1 is already encrypted at rest; this adds a second, app-level
// layer so that special-category data (children's details, health info,
// contact details) is unreadable in the database without the secret key.
//
// Key: env.DATA_ENCRYPTION_KEY — a base64-encoded 32-byte (256-bit) value,
// stored as a Cloudflare secret (never in the repo). Generate one with:
//   node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))'

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

let keyPromise = null;
let keySource = null;

function getKey(env) {
  const raw = env.DATA_ENCRYPTION_KEY;
  if (!raw) throw new Error("DATA_ENCRYPTION_KEY is not configured");
  if (keyPromise && keySource === raw) return keyPromise;
  keySource = raw;
  keyPromise = crypto.subtle.importKey("raw", b64ToBytes(raw), "AES-GCM", false, ["encrypt", "decrypt"]);
  return keyPromise;
}

// Encrypt a string. Returns "v1:<base64(iv|ciphertext)>" or "" for empty input.
export async function encryptField(env, plaintext) {
  if (plaintext == null || plaintext === "") return "";
  const key = await getKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(String(plaintext)));
  const combined = new Uint8Array(iv.length + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.length);
  return "v1:" + bytesToB64(combined);
}

// Decrypt a value produced by encryptField. Passes through plaintext/empty
// values so older or unencrypted rows never throw.
export async function decryptField(env, value) {
  if (value == null || value === "") return "";
  if (typeof value !== "string" || !value.startsWith("v1:")) return value;
  try {
    const key = await getKey(env);
    const combined = b64ToBytes(value.slice(3));
    const iv = combined.slice(0, 12);
    const ct = combined.slice(12);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return dec.decode(pt);
  } catch {
    return "";
  }
}
