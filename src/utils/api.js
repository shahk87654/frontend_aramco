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

export default api;