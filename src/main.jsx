import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import netlifyIdentity from 'netlify-identity-widget'
import axios from 'axios'

// Initialize Netlify Identity immediately — this handles invite/recovery tokens
netlifyIdentity.init({
  APIUrl: 'https://virtualteacher.netlify.app/.netlify/identity',
})

// Handle invite / recovery / access tokens in the URL
netlifyIdentity.on('init', user => {
  if (!user && window.location.hash.match(/(invite|confirmation|recovery|access)_token=/)) {
    // Automatically open the widget to complete the flow
    netlifyIdentity.open()
  }
})

// When the user logs in, set the Bearer token for axios
netlifyIdentity.on('login', async (user) => {
  const token = await user.jwt()
  axios.defaults.headers.common.Authorization = `Bearer ${token}`
  
  // If login came from invite or recovery link, redirect to dashboard
  if (window.location.hash.match(/(invite|confirmation|recovery|access)_token=/)) {
    window.location.replace('/')
  }

  try { netlifyIdentity.close() } catch {}
})

// When user logs out, clear Authorization header
netlifyIdentity.on('logout', () => {
  delete axios.defaults.headers.common.Authorization
})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
