// Password hashing & token helpers — Web Crypto only (Cloudflare Workers safe).

// OWASP-recommended minimum for PBKDF2-HMAC-SHA256 (2023 guidance).
const PBKDF2_ITERATIONS = 600000;
const enc = new TextEncoder();

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256,
  );
  return new Uint8Array(bits);
}

// Returns: pbkdf2$sha256$<iterations>$<saltHex>$<hashHex>
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return ["pbkdf2", "sha256", PBKDF2_ITERATIONS, toHex(salt), toHex(hash)].join("$");
}

// Constant-time-ish comparison against a stored hash string.
export async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[2], 10);
  const salt = fromHex(parts[3]);
  const expected = parts[4];
  const actual = toHex(await pbkdf2(password, salt, iterations));
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// Random URL-safe token for cookies.
export function randomToken(bytes = 32) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

// SHA-256 hex — used to store session tokens / OTP codes without keeping the raw value.
export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return toHex(digest);
}

// Short unique id with an optional prefix.
export function newId(prefix = "id") {
  return `${prefix}_${randomToken(12)}`;
}

// 6-digit numeric code, zero-padded.
export function sixDigitCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return n.toString().padStart(6, "0");
}
