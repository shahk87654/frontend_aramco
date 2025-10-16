import React from 'react';

export default function DebugBanner() {
  const api = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
  const show = process.env.NODE_ENV !== 'production' || process.env.REACT_APP_DEBUG === 'true';
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', bottom: 12, right: 12, background: '#fff', padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.12)', fontSize: 12 }}>
      API: {api}
    </div>
  );
}
