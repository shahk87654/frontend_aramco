import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import DebugBanner from './components/DebugBanner';

const theme = createTheme({
  palette: {
    primary: {
      main: '#006C35', // Aramco Green
    },
    secondary: {
      main: '#1F2933', // Deep Charcoal
    },
    // Supporting Colors
    info: {
      main: '#0F766E', // Muted Teal
    },
    text: {
      secondary: '#6B7280', // Corporate Gray
    },
    // Background Colors
    background: {
      default: '#F4F6F8', // Light Gray Background
      paper: '#FFFFFF', // Pure White
    },
    // Status Colors
    success: {
      main: '#16A34A', // Success Green
    },
    warning: {
      main: '#F59E0B', // Warning Amber
    },
    error: {
      main: '#DC2626', // Error Red
    },
    // Additional Info Blue
    info: {
      main: '#2563EB', // Info Blue
    },
  },
  // Custom colors for specific uses
  aramco: {
    green: '#006C35',
    charcoal: '#1F2933',
    teal: '#0F766E',
    gray: '#6B7280',
    lightGray: '#F4F6F8',
    white: '#FFFFFF',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#2563EB',
    starActive: '#FBBF24',
    starInactive: '#D1D5DB',
  },
});

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <App />
        <DebugBanner />
      </ErrorBoundary>
    </ThemeProvider>
  </BrowserRouter>
);
