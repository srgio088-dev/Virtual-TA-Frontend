export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Helper that adds the logged-in Netlify Identity user's email
 * to every request as X-User-Email (if available).
 */
function withAuth(init = {}) {
  const headers = { ...(init.headers || {}) };

  try {
    if (typeof window !== "undefined" && window.netlifyIdentity) {
      const user = window.netlifyIdentity.currentUser();
      if (user && user.email) {
        headers["X-User-Email"] = user.email;
      }
    }
  } catch {
    // if netlifyIdentity isn't ready, just skip the header
  }

  return { ...init, headers };
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, withAuth());
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPostJSON(path, data) {
  const init = withAuth({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPostForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, withAuth({
    method: "POST",
    body: formData,
  }));
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

/** NEW: generic fetch used as default export */
export async function apiFetch(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, withAuth(init));
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} failed: ${res.status}`);
  // handle 204
  return res.status === 204 ? null : res.json();
}

export default apiFetch; // now it exists
