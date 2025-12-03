// src/api/client.js
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// Get the current Netlify Identity user's email (if logged in)
function getAuthHeaders() {
  let email = "";

  try {
    const ni = window.netlifyIdentity;
    const user = ni && ni.currentUser();
    if (user && user.email) {
      email = user.email;
    }
  } catch (e) {
    // ignore – safest to just not send the header
  }

  return email ? { "X-User-Email": email } : {};
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPostJSON(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data || {}),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPostForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      // don’t set Content-Type here; the browser will add the multipart boundary
      ...getAuthHeaders(),
    },
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`POST form ${path} failed: ${res.status}`);
  }
  return res.json();
}
