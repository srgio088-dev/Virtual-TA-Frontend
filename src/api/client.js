// src/api/client.js

export const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// --- identity helpers -------------------------------------------------

function getUserEmail() {
  try {
    const ni = window.netlifyIdentity;
    if (ni) {
      const u = ni.currentUser();
      if (u) {
        // Netlify user object always has `email`
        return u.email;
      }
    }
  } catch (e) {
    // ignore, fall back to localStorage
  }
  const stored = localStorage.getItem("virtualta_user_email");
  return stored || null;
}

function authHeaders() {
  const email = getUserEmail();
  return email ? { "X-User-Email": email } : {};
}

// --- generic fetch helpers --------------------------------------------

async function doFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include", // send cookies as well
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.headers || {}),
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `${options.method || "GET"} ${path} failed: ${res.status} ${text}`
    );
  }

  // Some endpoints may return 204
  if (res.status === 204) return null;
  return res.json();
}

export async function apiGet(path) {
  return doFetch(path, { method: "GET" });
}

export async function apiPostJSON(path, data) {
  return doFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  });
}

export async function apiPostForm(path, formData) {
  // Let the browser set Content-Type (multipart/form-data boundary)
  return doFetch(path, {
    method: "POST",
    body: formData,
  });
}
