import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import netlifyIdentity from 'netlify-identity-widget';
import axios from 'axios';

// --- Init Identity early ---
netlifyIdentity.init({
  APIUrl: 'https://virtualteacher.netlify.app/.netlify/identity',
});

// If we already have a token (return visit), attach it to axios
const bootToken = localStorage.getItem('id_token');
if (bootToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
}

// --- Helper: handle magic-link flows on first load ---
async function handleIdentityMagicLinks() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const invite = params.get('invite_token');
  const recovery = params.get('recovery_token');
  const confirmation = params.get('confirmation_token');
  const access = params.get('access_token'); // sometimes present after email confirm

  // INVITE: actually accept the invite and log the user in
  if (invite) {
    try {
      const user = await netlifyIdentity.acceptInvite(invite, true);
      const token = await user.jwt(true);
      localStorage.setItem('id_token', token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      history.replaceState(null, '', window.location.pathname);
      window.location.replace('/dashboard');
      return;
    } catch (e) {
      // If acceptInvite fails, open widget so user can finish manually
      netlifyIdentity.open('signup');
      return;
    }
  }

  // RECOVERY / CONFIRMATION: open widget so user can complete flow
  if (recovery || confirmation || access) {
    netlifyIdentity.open(); // widget will guide the rest
  }
}

// Run on first paint
handleIdentityMagicLinks();

// Login/logout event wiring
netlifyIdentity.on('login', async (user) => {
  const token = await user.jwt(true);
  localStorage.setItem('id_token', token);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  try { netlifyIdentity.close(); } catch {}
  // If user just logged in normally, go to dashboard
  if (!window.location.pathname.startsWith('/dashboard')) {
    window.location.replace('/dashboard');
  }
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
