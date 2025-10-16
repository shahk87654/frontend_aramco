import axios from 'axios';

// In production, allow overriding the API base URL with REACT_APP_API_URL.
// This lets the client talk to a separately hosted API (set at build time)
// or default to a relative '/api' when served from the same origin as the backend.
const baseURL = process.env.NODE_ENV === 'production'
  ? (process.env.REACT_APP_API_URL || '/api')
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token from localStorage automatically for convenience
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  return cfg;
});

// If any admin API responds with 401, clear admin session state and redirect to admin login
api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
      } catch (e) {
        // ignore
      }
      // If we are in a browser context, redirect to admin-login (only for admin routes)
      if (typeof window !== 'undefined' && window.location.pathname.indexOf('/admin') === 0) {
        window.location.href = '/admin-login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;