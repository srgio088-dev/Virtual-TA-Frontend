import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import netlifyIdentity from "netlify-identity-widget";
import axios from "axios";

/* ---------------------------
   Netlify Identity bootstrap
---------------------------- */

// Init widget with your site Identity endpoint
netlifyIdentity.init({
  APIUrl: "https://virtualteacher.netlify.app/.netlify/identity",
});

// If we already have a token from a previous login, attach it
const bootToken = localStorage.getItem("id_token");
if (bootToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
}

// Read hash from either the live URL or the head script cache
function getMagicHash() {
  const live = window.location.hash || "";
  const cached = sessionStorage.getItem("nf_magic_hash") || "";
  const hasToken = /(?:^#|&)(invite_token|recovery_token|confirmation_token|access_token)=/.test(
    live
  );
  return hasToken ? live : cached;
}

// Process invite / recovery / confirmation BEFORE React mounts
async function handleIdentityMagicLinks() {
  const raw = getMagicHash();
  if (!raw) return;

  const hash = raw.replace(/^#/, "");
  const qs = new URLSearchParams(hash);
  const invite = qs.get("invite_token");
  const recovery = qs.get("recovery_token");
  const confirmation = qs.get("confirmation_token");
  const access = qs.get("access_token");

  try {
    if (invite) {
      // Accept invite and force password set
      const user = await netlifyIdentity.acceptInvite(invite, true);
      const token = await user.jwt(true);
      localStorage.setItem("id_token", token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      sessionStorage.removeItem("nf_magic_hash");
      window.history.replaceState(null, "", window.location.pathname);
      window.location.replace("/assignments");
      return;
    }

    // For recovery / confirmation / generic access, just open widget
    if (recovery || confirmation || access) {
      netlifyIdentity.open("login");
    }
  } finally {
    sessionStorage.removeItem("nf_magic_hash");
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }
}

// Kick this off ASAP
handleIdentityMagicLinks();

/* ---------------------------
   Identity events
---------------------------- */

netlifyIdentity.on("login", async (user) => {
  try {
    const token = await user.jwt(true);
    localStorage.setItem("id_token", token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.error("Failed to get JWT", e);
  }

  try {
    netlifyIdentity.close();
  } catch {}

  if (!window.location.pathname.startsWith("/assignments")) {
    window.location.replace("/assignments");
  }
});

netlifyIdentity.on("logout", () => {
  localStorage.removeItem("id_token");
  delete axios.defaults.headers.common.Authorization;
  window.location.replace("/");
});

netlifyIdentity.on("error", (e) => {
  console.error("Netlify Identity error:", e);
});

/* ---------------------------
   Mount React App
---------------------------- */

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
