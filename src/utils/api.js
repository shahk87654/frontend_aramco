import axios from 'axios';

// In production, allow overriding the API base URL with REACT_APP_API_URL.
// This lets the client talk to a separately hosted API (set at build time)
// or default to a relative '/api' when served from the same origin as the backend.
// Default baseURL behavior:
// - In development, talk to local server
// - In production, allow REACT_APP_API_URL override; otherwise use a relative '/api'
// We also support a runtime fallback re-request if the API returns HTML (frontend index).
const baseURL = process.env.NODE_ENV === 'production'
  ? (process.env.REACT_APP_API_URL || '/api')
  : 'http://localhost:5000/api';

if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_API_URL is not set in production; client will use a relative \'/api\' path. If your frontend is served separately from the API, set REACT_APP_API_URL at build time.');
}

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
  res => {
    // Detect accidental HTML responses from API (e.g. frontend index served at /api)
    const ct = res?.headers?.['content-type'] || '';
    if (typeof ct === 'string' && ct.indexOf('text/html') !== -1) {
      // Provide a clearer error payload to the caller with the resolved baseURL for debugging
      const msg = `API returned HTML (likely the frontend index). Check REACT_APP_API_URL or server routing. (api.baseURL=${baseURL})`;
          // If the API returned HTML, it's likely the client build's index.html was served
          // at the API path (common when the frontend is built separately and the
          // API URL wasn't set at build time). Don't attempt an automatic external
          // re-request here (it can cause confusing CORS/auth issues). Instead return
          // a clear error that tells the integrator what to fix.
          // The caller can choose to retry against a known host if desired.
          // Provide a helpful console hint in development for faster debugging.
          if (process.env.NODE_ENV === 'production' && baseURL === '/api') {
            // eslint-disable-next-line no-console
            console.error('Detected HTML response from API while using relative \'/api\' baseURL. If your frontend is hosted separately from the API, set REACT_APP_API_URL at build time to the API origin (for example https://api.example.com).');
          }
          return Promise.reject({ message: msg, response: res });
    }
    return res;
  },
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
    // If backend returned HTML for an error response, wrap with clearer message
    const contentType = err?.response?.headers?.['content-type'] || '';
    if (typeof contentType === 'string' && contentType.indexOf('text/html') !== -1) {
      const msg = `API returned HTML (likely the frontend index). Check REACT_APP_API_URL or server routing. (api.baseURL=${baseURL})`;
      return Promise.reject({ message: msg, response: err.response });
    }
    return Promise.reject(err);
  }
);

export default api;