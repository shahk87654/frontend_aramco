import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import DebugBanner from './components/DebugBanner';

// Enforce admin session cooldown on app startup (18 hours)
try {
  const adminLoginAt = Number(localStorage.getItem('adminLoginAt')) || 0;
  const now = Date.now();
  const EIGHTEEN_HOURS = 18 * 60 * 60 * 1000;
  if (adminLoginAt && (now - adminLoginAt) > EIGHTEEN_HOURS) {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    localStorage.removeItem('adminLoginAt');
  }
} catch (err) {
  // If localStorage access fails for any reason, do not block app startup
  // (keep existing values untouched)
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ErrorBoundary>
      <App />
      <DebugBanner />
    </ErrorBoundary>
  </BrowserRouter>
);
