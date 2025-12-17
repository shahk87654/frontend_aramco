
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
  Paper,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleLogout = () => {
    // Remove admin flags and token from localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    navigate('/admin-login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Reviews', icon: <RateReviewIcon fontSize="small" /> },
    { label: 'Coupons', icon: <LocalOfferIcon fontSize="small" /> },
    { label: 'Coupon Stats', icon: <AnalyticsIcon fontSize="small" /> },
    { label: 'Generate Coupons', icon: <CardGiftcardIcon fontSize="small" /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #e3f2fd 0, #f5f6fa 40%, #ffffff 100%)',
      }}
    >
      {/* Top Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976d2', letterSpacing: 0.5 }}>
              Admin Console
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage reviews, stations, and coupons
            </Typography>
          </Box>
          <Button
            size="small"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none', borderRadius: 999 }}
            variant="outlined"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
          }}
        >
          {/* Modern side navigation */}
          <Box
            sx={{
              minWidth: { xs: '100%', md: 230 },
              borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
              borderBottom: { xs: '1px solid #e0e0e0', md: 'none' },
              pr: { md: 2 },
              pb: { xs: 2, md: 0 },
            }}
          >
            <Typography variant="overline" sx={{ mb: 1.5, color: 'text.secondary', letterSpacing: 1 }}>
              Sections
            </Typography>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              orientation={isDesktop ? 'vertical' : 'horizontal'}
              variant="scrollable"
              sx={{
                '& .MuiTabs-indicator': {
                  left: isDesktop ? 0 : 'auto',
                  right: isDesktop ? 'auto' : 0,
                  width: isDesktop ? 3 : '100%',
                  borderRadius: isDesktop ? '0 999px 999px 0' : '999px 999px 0 0',
                },
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textTransform: 'none',
                  fontSize: 14,
                  justifyContent: 'flex-start',
                  minHeight: 40,
                  borderRadius: isDesktop ? 2 : 999,
                  px: 1.5,
                  mr: isDesktop ? 0 : 1,
                  mb: isDesktop ? 0.5 : 0,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25,118,210,0.08)',
                    color: '#1976d2',
                  },
                },
              }}
            >
              {navItems.map((item, index) => (
                <Tab
                  key={item.label}
                  value={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.icon}
                      <Typography variant="body2">{item.label}</Typography>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Content Area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {tab === 0 && <AdminDashboard />}
            {tab === 1 && <AdminReviews />}
            {tab === 2 && <AdminCoupons />}
            {tab === 3 && <AdminCouponStats />}
            {tab === 4 && <AdminManualCoupon />}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Admin;
