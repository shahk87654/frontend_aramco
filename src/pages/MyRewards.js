import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Container, Grid, Chip, TextField, Button } from '@mui/material';
import CouponQRCode from '../components/CouponQRCode';

function MyRewards() {
  const [phone, setPhone] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [visits, setVisits] = useState(0);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async e => {
    e.preventDefault();
    setError('');
    setCoupons([]);
    setVisits(0);
    setProfile(null);
    setLoading(true);
    try {
      const res = await axios.get(`/api/rewards/search?phone=${encodeURIComponent(phone)}`);
      setCoupons(res.data.coupons);
      setVisits(res.data.visits);
      setProfile(res.data.profile);
      setLoading(false);
    } catch (err) {
      setError('No rewards found or invalid phone number.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mb: 4 }} align="center">
          Search My Rewards
        </Typography>
        <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
          <TextField label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} fullWidth required sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ fontWeight: 700 }}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        {error && <Typography color="error">{error}</Typography>}
        {profile && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f6fa', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>Customer Profile</Typography>
            <Typography variant="body2">Name: {profile.name || '-'}</Typography>
            <Typography variant="body2">Contact: {profile.contact || '-'}</Typography>
            <Typography variant="body2">Email: {profile.email || '-'}</Typography>
            <Typography variant="body2">Phone: {profile.phone || '-'}</Typography>
          </Box>
        )}
        {visits > 0 && (
          <Typography align="center" sx={{ mb: 2, color: '#1976d2' }}>Visits: {visits}</Typography>
        )}
        <Grid container spacing={3}>
          {coupons.length === 0 && !loading && <Typography align="center" sx={{ width: '100%' }}>No rewards yet.</Typography>}
          {coupons.map(coupon => (
            <Grid item xs={12} key={coupon._id}>
              <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>Reward Coupon</Typography>
                  {!coupon.used && <CouponQRCode code={coupon.code} />}
                  {coupon.used && <Typography variant="h5" sx={{ my: 1 }}>{coupon.code}</Typography>}
                  <Typography variant="body2" color="text.secondary">Station: {coupon.station?.name || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">Date: {new Date(coupon.createdAt).toLocaleString()}</Typography>
                  <Chip label={coupon.used ? 'Used' : 'Unused'} color={coupon.used ? 'success' : 'warning'} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default MyRewards;
