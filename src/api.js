// Tiny client for the Adders backend (Cloudflare Pages Functions).
// All requests are same-origin and rely on the HttpOnly session cookie.

async function req(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // --- account auth ---
  me: () => req("/api/auth/me"),
  signup: (payload) => req("/api/auth/signup", { method: "POST", body: payload }),
  login: (payload) => req("/api/auth/login", { method: "POST", body: payload }),
  verify: (code) => req("/api/auth/verify", { method: "POST", body: { code } }),
  resend: () => req("/api/auth/resend", { method: "POST" }),
  logout: () => req("/api/auth/logout", { method: "POST" }),

  // --- account data ---
  account: () => req("/api/account"),
  addChild: (payload) => req("/api/account/children", { method: "POST", body: payload }),
  apply: (d) => req("/api/filmschool/apply", { method: "POST", body: d }),
  // Start payment: returns { mode:"stripe", url } to redirect to Stripe Checkout,
  // or { mode:"test", user } when Stripe isn't configured yet.
  checkout: (d) => req("/api/filmschool/checkout", { method: "POST", body: d }),
  // Confirm a Stripe Checkout session after returning from the hosted page.
  confirmCheckout: (sessionId) => req("/api/filmschool/confirm", { method: "POST", body: { sessionId } }),

  // --- admin ---
  adminMe: () => req("/api/admin/me"),
  adminLogin: (payload) => req("/api/admin/login", { method: "POST", body: payload }),
  adminLogout: () => req("/api/admin/logout", { method: "POST" }),
  adminStats: () => req("/api/admin/stats"),
  adminApplications: () => req("/api/admin/applications"),
  adminDeleteApplication: (id) => req(`/api/admin/applications/${id}`, { method: "DELETE" }),
};
