import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import netlifyIdentity from 'netlify-identity-widget';
import axios from 'axios';

netlifyIdentity.init({
  APIUrl: 'https://virtualteacher.netlify.app/.netlify/identity',
});

netlifyIdentity.on('login', async (user) => {
  const token = await user.jwt();
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
});

netlifyIdentity.on('logout', () => {
  delete axios.defaults.headers.common.Authorization;
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
