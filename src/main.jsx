// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import netlifyIdentity from 'netlify-identity-widget';
import axios from 'axios';

netlifyIdentity.init({ APIUrl: 'https://virtualteacher.netlify.app/.netlify/identity' });

// attach existing token (page refresh, return visits)
const bootToken = localStorage.getItem('id_token');
if (bootToken) axios.defaults.headers.common.Authorization = `Bearer ${bootToken}`;

// --- read hash captured in index.html (or live hash if present) ---
function getIdentityHash() {
  const live = window.location.hash;
  const cached = sessionStorage.getItem('nf_magic_hash');
  return (live && live.length > 1) ? live : (cached || '');
}

async function handleIdentityMagicLinks() {
  const raw = getIdentityHash();
  const hash = raw.replace(/^#/, '');
  if (!hash) return;

  const qs = new URLSearchParams(hash);
  const invite = qs.get('invite_token');
  const recovery = qs.get('recovery_token');
  const confirmation = qs.get('confirmation_token');
  const access = qs.get('access_token');

  if (invite) {
    try {
      const user = await netlifyIdentity.acceptInvite(invite, true);
      const token = await user.jwt(true);
      localStorage.setItem('id_token', token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      sessionStorage.removeItem('nf_magic_hash');
      history.replaceState(null, '', window.location.pathname);
      window.location.replace('/dashboard');
      return;
    } catch {
      netlifyIdentity.open('signup'); // fallback
      return;
    }
  }

  if (recovery || confirmation || access) {
    netlifyIdentity.open();
  }
}

// run BEFORE router mounts
handleIdentityMagicLinks();

netlifyIdentity.on('login', async (user) => {
  const token = await user.jwt(true);
  localStorage.setItem('id_token', token);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  try { netlifyIdentity.close(); } catch {}
  if (!location.pathname.startsWith('/dashboard')) window.location.replace('/dashboard');
});

netlifyIdentity.on('logout', () => {
  localStorage.removeItem('id_token');
  delete axios.defaults.headers.common.Authorization;
  window.location.replace('/');
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
