
import React, { useState } from 'react';
import { Box, Tabs, Tab, Container, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminReviews from './AdminReviews';
import AdminCoupons from './AdminCoupons';

function Admin() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove admin flags and token from localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    navigate('/admin-login');
  };
  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>Admin Panel</Typography>
          <Button color="error" variant="outlined" onClick={handleLogout}>Logout</Button>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 4 }}>
          <Tab label="Dashboard" />
          <Tab label="Reviews" />
          <Tab label="Coupons" />
        </Tabs>
        {tab === 0 && <AdminDashboard />}
        {tab === 1 && <AdminReviews />}
        {tab === 2 && <AdminCoupons />}
      </Container>
    </Box>
  );
}

export default Admin;
