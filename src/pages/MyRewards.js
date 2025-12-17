import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Grid,
  Chip,
  TextField,
  Button,
  Paper,
} from '@mui/material';
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

  // Listen for claim events so the UI can refresh automatically
  React.useEffect(() => {
    const onClaim = (e) => {
      // if phone is present, re-run last search to refresh coupons
      if (phone && phone.trim()) {
        // construct a fake event object for handleSearch
        handleSearch({ preventDefault: () => {} });
      }
    };
    window.addEventListener('couponClaimed', onClaim);
    return () => window.removeEventListener('couponClaimed', onClaim);
  }, [phone]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 6,
        background: 'radial-gradient(circle at top left, #e3f2fd 0, #f5f6fa 40%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#0d47a1', mb: 1, textAlign: 'center' }}
        >
          My Rewards
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}
        >
          Look up your visits and reward coupons using your registered phone number.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}
              >
                Find your rewards
              </Typography>
              <form onSubmit={handleSearch}>
                <TextField
                  label="Phone Number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </form>
              {error && (
                <Typography color="error" sx={{ mt: 2 }} variant="body2">
                  {error}
                </Typography>
              )}

              {profile && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: '#f5f6fa',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: '#1976d2', mb: 0.5 }}
                  >
                    Customer Profile
                  </Typography>
                  <Typography variant="body2">Name: {profile.name || '-'}</Typography>
                  <Typography variant="body2">Contact: {profile.contact || '-'}</Typography>
                  <Typography variant="body2">Email: {profile.email || '-'}</Typography>
                  <Typography variant="body2">Phone: {profile.phone || '-'}</Typography>
                  {visits > 0 && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontWeight: 600, color: '#1976d2' }}
                    >
                      Visits: {visits}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}
            >
              Your reward coupons
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Show the QR code at the station to redeem. Used rewards remain in your history.
            </Typography>
            <Grid container spacing={2}>
              {(coupons.length === 0 || !coupons) && !loading && (
                <Typography align="center" sx={{ width: '100%' }}>
                  No rewards yet.
                </Typography>
              )}
              {(coupons || []).map(coupon => (
                <Grid item xs={12} key={coupon._id}>
                  <Card
                    sx={{
                      boxShadow: 3,
                      borderRadius: 3,
                      border: '1px solid rgba(25,118,210,0.08)',
                    }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: '#1976d2', mb: 0.5 }}
                        >
                          Reward Coupon
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Station: {coupon.station?.name || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date:{' '}
                          {coupon.createdAt
                            ? new Date(coupon.createdAt).toLocaleString()
                            : '-'}
                        </Typography>
                        <Chip
                          label={coupon.used ? 'Used' : 'Unused'}
                          color={coupon.used ? 'success' : 'warning'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        {!coupon.used && <CouponQRCode code={coupon.code} />}
                        {coupon.used && (
                          <Typography variant="h6" sx={{ my: 1 }}>
                            {coupon.code}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MyRewards;
