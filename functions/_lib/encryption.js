// Field-level encryption for sensitive personal data (GDPR).
//
// Defence in depth — sensitive fields are protected by several layers:
//   1. Cloudflare D1 is encrypted at rest by the platform.
//   2. App-level AES-256-GCM encryption before anything is written.
//   3. Keys are not used raw — an AES key is derived from each secret with
//      HKDF-SHA256, so the stored secret is never the working key.
//   4. Each ciphertext is bound to its own record with AES-GCM additional
//      authenticated data (AAD), so it cannot be tampered with or moved to
//      another row.
//   5. Optional SECOND independent layer: if DATA_ENCRYPTION_KEY2 is set, the
//      data is encrypted again under a separate key. Reading it then requires
//      BOTH secrets, which can be stored separately.
//
// Keys are base64-encoded 32-byte values, kept as Cloudflare secrets (never in
// the repo). Generate one with:
//   node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))'

const enc = new TextEncoder();
const dec = new TextDecoder();
const HKDF_SALT = enc.encode("adders-entertainment::pii::v1");

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

// Derive (and cache) an AES-GCM key from a base secret via HKDF-SHA256.
const keyCache = new Map();
async function aesKeyFor(env, varName, info) {
  const raw = env[varName];
  if (!raw) throw new Error(`${varName} is not configured`);
  const cacheKey = `${varName}|${info}|${raw}`;
  if (keyCache.has(cacheKey)) return keyCache.get(cacheKey);
  const base = await crypto.subtle.importKey("raw", b64ToBytes(raw), "HKDF", false, ["deriveKey"]);
  const aesKey = await crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: HKDF_SALT, info: enc.encode(info) },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  keyCache.set(cacheKey, aesKey);
  return aesKey;
}

async function encOnce(key, dataBytes, aadBytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aadBytes }, key, dataBytes);
  const out = new Uint8Array(iv.length + ct.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ct), iv.length);
  return out;
}

async function decOnce(key, blob, aadBytes) {
  const iv = blob.slice(0, 12);
  const ct = blob.slice(12);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv, additionalData: aadBytes }, key, ct);
  return new Uint8Array(pt);
}

// Encrypt a string, bound to `aad` (e.g. the record id). Returns
// "v1:<base64>" (single layer) or "v2:<base64>" (two independent layers),
// or "" for empty input.
export async function encryptField(env, plaintext, aad = "") {
  if (plaintext == null || plaintext === "") return "";
  const aadBytes = enc.encode(String(aad));
  const k1 = await aesKeyFor(env, "DATA_ENCRYPTION_KEY", "adders-pii-layer1");
  let blob = await encOnce(k1, enc.encode(String(plaintext)), aadBytes);
  if (env.DATA_ENCRYPTION_KEY2) {
    const k2 = await aesKeyFor(env, "DATA_ENCRYPTION_KEY2", "adders-pii-layer2");
    blob = await encOnce(k2, blob, aadBytes);
    return "v2:" + bytesToB64(blob);
  }
  return "v1:" + bytesToB64(blob);
}

// Decrypt a value produced by encryptField using the same `aad`. Passes through
// plaintext/empty values so unencrypted rows never throw.
export async function decryptField(env, value, aad = "") {
  if (value == null || value === "") return "";
  if (typeof value !== "string" || !(value.startsWith("v1:") || value.startsWith("v2:"))) return value;
  const aadBytes = enc.encode(String(aad));
  try {
    const twoLayer = value.startsWith("v2:");
    let blob = b64ToBytes(value.slice(3));
    if (twoLayer) {
      const k2 = await aesKeyFor(env, "DATA_ENCRYPTION_KEY2", "adders-pii-layer2");
      blob = await decOnce(k2, blob, aadBytes);
    }
    const k1 = await aesKeyFor(env, "DATA_ENCRYPTION_KEY", "adders-pii-layer1");
    const pt = await decOnce(k1, blob, aadBytes);
    return dec.decode(pt);
  } catch {
    return "";
  }
}
