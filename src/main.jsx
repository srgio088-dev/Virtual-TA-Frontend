import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import netlifyIdentity from 'netlify-identity-widget';
import axios from 'axios';

/* ---------------------------
   Netlify Identity bootstrap
---------------------------- */

// Initialize the widget early
netlifyIdentity.init({
  APIUrl: 'https://virtualteacher.netlify.app/.netlify/identity',
});

// Attach any existing token for return visits
const bootToken = localStorage.getItem('id_token');
if (bootToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
}

// Pull the identity hash the moment we load (either live or stashed by index.html)
function getMagicHash() {
  const live = window.location.hash || '';
  const cached = sessionStorage.getItem('nf_magic_hash') || '';
  // Only return a hash that actually contains an identity token key
  const hasToken = /(?:^#|&)(invite_token|recovery_token|confirmation_token|access_token)=/.test(live);
  return hasToken ? live : cached;
}

// Handle invite / recovery / confirmation before the router mounts
async function handleIdentityMagicLinks() {
  const raw = getMagicHash();
  if (!raw) return;

  const hash = raw.replace(/^#/, '');
  const qs = new URLSearchParams(hash);
  const invite = qs.get('invite_token');
  const recovery = qs.get('recovery_token');
  const confirmation = qs.get('confirmation_token');
  const access = qs.get('access_token');

  try {
    if (invite) {
      // Accept invite and force password set
      const user = await netlifyIdentity.acceptInvite(invite, true);
      const token = await user.jwt(true);
      localStorage.setItem('id_token', token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Clean the URL (remove fragment) and go to assignments
      sessionStorage.removeItem('nf_magic_hash');
      window.history.replaceState(null, '', window.location.pathname);
      window.location.replace('/assignments');
      return;
    }

    if (recovery || confirmation || access) {
      // Open the widget to complete the flow
      netlifyIdentity.open('login');
    }
  } finally {
    // Always clear the cached hash and strip the fragment
    sessionStorage.removeItem('nf_magic_hash');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }
}

// Kick off magic-link processing ASAP
handleIdentityMagicLinks();

/* ---------------------------
   Widget event wiring
---------------------------- */

netlifyIdentity.on('login', async (user) => {
  try {
    const token = await user.jwt(true);
    localStorage.setItem('id_token', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.error('Failed to obtain JWT:', e);
  }
  try { netlifyIdentity.close(); } catch {}
  // Land professors on assignments after login
  if (!window.location.pathname.startsWith('/assignments')) {
    window.location.replace('/assignments');
  }
});

netlifyIdentity.on('logout', () => {
  localStorage.removeItem('id_token');
  delete axios.defaults.headers.common.Authorization;
  window.location.replace('/');
});

// Optional: surface errors to console for easier debugging
netlifyIdentity.on('error', (e) => {
  console.error('Netlify Identity error:', e);
});

/* ---------------------------
   Mount the app
---------------------------- */

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
