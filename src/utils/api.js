import axios from 'axios';

// In production, allow overriding the API base URL with REACT_APP_API_URL.
// This lets the client talk to a separately hosted API (set at build time)
// or default to a relative '/api' when served from the same origin as the backend.
// Default baseURL behavior:
// - In development, talk to local server
// - In production, allow REACT_APP_API_URL override; otherwise use a relative '/api'
// We also support a runtime fallback re-request if the API returns HTML (frontend index).
// In production prefer REACT_APP_API_URL; if absent we use a relative '/api'.
// For deployments where the frontend is hosted separately (Vercel) and the
// env var wasn't set at build time, allow a one-time runtime fallback to a
// configured external API host. This avoids the confusing "API returned HTML"
// errors when the frontend index was served at /api.
const baseURL = process.env.NODE_ENV === 'production'
  ? (process.env.REACT_APP_API_URL || '/api')
  : 'http://localhost:5000/api';

// Optional runtime fallback host to try when the client detects the API
// returned HTML while using the relative '/api' baseURL. This can be set at
// build time via REACT_APP_API_FALLBACK or injected at runtime via a global
// `window.__API_HOST__` (recommended for Vercel static deployments where the
// build env may not include the API host). Example value: https://api.example.com
const runtimeFallbackHost = (typeof window !== 'undefined' && window.__API_HOST__) || process.env.REACT_APP_API_FALLBACK || null;

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
  let token = null;
  try {
    const raw = localStorage.getItem('token');
    if (typeof raw === 'string') {
      const t = raw.trim();
      if (t && t.toLowerCase() !== 'null' && t.toLowerCase() !== 'undefined') token = t;
    }
  } catch (e) {
    // ignore localStorage errors (e.g., SSR environments)
  }
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
      // If the API returned HTML, it's likely the client build's index.html was
      // served at the API path (common when the frontend is built separately
      // and the API URL wasn't set at build time). Try a one-time runtime
      // fallback request to a configured external host (if provided) to make
      // the app resilient on hosts like Vercel where the env var may be
      // missing at build time.
      if (process.env.NODE_ENV === 'production' && baseURL === '/api' && runtimeFallbackHost) {
        // eslint-disable-next-line no-console
        console.warn(`Detected HTML response from /api; attempting one-time retry against fallback host ${runtimeFallbackHost}`);
        // Perform a single retry to the same path against the fallback host.
        // If the provided host is an origin without '/api', also try origin + '/api' + path
        // because many backends mount their API under '/api'. Try both in sequence.
        const host = runtimeFallbackHost.replace(/\/$/, '');
        const requestPath = res.config?.url || '';
        const tryUrls = [];
        // host + requestPath (covers when runtimeFallbackHost already contains '/api' or the client used '/stations')
        tryUrls.push(host + requestPath);
        // If neither host nor path seems to include '/api', try host + '/api' + requestPath
        if (!host.includes('/api') && requestPath && !requestPath.startsWith('/api')) {
          tryUrls.push(host + '/api' + requestPath);
        }

        // Helper to attempt the list of fallback URLs sequentially
        const attemptSequential = (urls, i = 0) => {
          if (i >= urls.length) {
            const msg2 = `API returned HTML (likely the frontend index). Check REACT_APP_API_URL, REACT_APP_API_FALLBACK or window.__API_HOST__ configuration. (api.baseURL=${baseURL})`;
            return Promise.reject({ message: msg2, response: res });
          }
          const u = urls[i];
          return axios({ method: res.config?.method || 'get', url: u, headers: res.config?.headers || {} })
            .then(fallbackRes => fallbackRes)
            .catch(() => attemptSequential(urls, i + 1));
        };

        return attemptSequential(tryUrls);
      }
      // No fallback configured, return the clear error that tells integrator what to fix.
      if (process.env.NODE_ENV === 'production' && baseURL === '/api') {
        // eslint-disable-next-line no-console
        console.error('Detected HTML response from API while using relative \'/api\' baseURL. If your frontend is hosted separately from the API, set REACT_APP_API_URL at build time to the API origin (for example https://api.example.com) or provide a runtime host via window.__API_HOST__ or REACT_APP_API_FALLBACK.');
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