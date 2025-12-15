
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Container,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminReviews from './AdminReviews';
import AdminCoupons from './AdminCoupons';
import AdminCouponStats from './AdminCouponStats';
import AdminManualCoupon from './AdminManualCoupon';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

function Admin() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove admin flags and token from localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    navigate('/admin-login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon sx={{ mr: 1 }} /> },
    { label: 'Reviews', icon: <RateReviewIcon sx={{ mr: 1 }} /> },
    { label: 'Coupons', icon: <LocalOfferIcon sx={{ mr: 1 }} /> },
    { label: 'Coupon Stats', icon: <AnalyticsIcon sx={{ mr: 1 }} /> },
    { label: 'Generate Coupons', icon: <CardGiftcardIcon sx={{ mr: 1 }} /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa' }}>
      {/* Top Navigation Bar */}
      <AppBar position="sticky" sx={{ backgroundColor: '#1976d2', boxShadow: 3 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: 'white', fontSize: '1.3rem', letterSpacing: 0.5 }}
            >
              ARAMCO ADMIN
            </Typography>
          </Box>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Section Title */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {navItems[tab].icon}
            {navItems[tab].label}
          </Typography>
        </Box>

        {/* Tab Navigation */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 2,
            mb: 4,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                minHeight: 60,
                color: '#666',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  color: '#1976d2',
                },
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#1976d2',
                borderBottom: '3px solid #1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
              },
            }}
          >
            {navItems.map((item) => (
              <Tab
                key={item.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {item.icon}
                    {item.label}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ animation: 'fadeIn 0.3s ease-in' }}>
          {tab === 0 && <AdminDashboard />}
          {tab === 1 && <AdminReviews />}
          {tab === 2 && <AdminCoupons />}
          {tab === 3 && <AdminCouponStats />}
          {tab === 4 && <AdminManualCoupon />}
        </Box>
      </Container>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}

export default Admin;
