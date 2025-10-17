import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Review from './pages/Review';
import Login from './pages/Login';
import Reward from './pages/Reward';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminReviews from './pages/AdminReviews';
import MyRewards from './pages/MyRewards';
import AdminLogin from './pages/AdminLogin';

function RequireAdmin({ children }) {
  if (localStorage.getItem('isAdmin') === 'true') return children;
  window.location.href = '/admin-login';
  return null;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/review/:stationId" element={<Review />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      {/* <Route path="/register" element={<Register />} /> */}
      <Route path="/reward/:code" element={<Reward />} />
      <Route path="/my-rewards" element={<MyRewards />} />
  {/* Reward search/scan removed - functionality disabled */}
      <Route path="/admin/*" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/reviews" element={<RequireAdmin><AdminReviews /></RequireAdmin>} />
    </Routes>
  );
}

export default App;
