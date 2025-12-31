import React, { useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, TextField, Button, Container, Chip, Grid } from '@mui/material';
import QRCode from 'qrcode.react';

function RewardSearch() {
  const [phone, setPhone] = useState('');
  const [rewards, setRewards] = useState([]);
  const [visits, setVisits] = useState(0);
  const [visitsList, setVisitsList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState('');

  const handleSearch = async e => {
    e.preventDefault();
    setError('');
    setRewards([]);
    setVisits(0);
    setLoading(true);
    try {
      const res = await axios.get(`/api/rewards/search?phone=${encodeURIComponent(phone)}`);
      setRewards(res.data.coupons);
      setVisits(res.data.visits || 0);
      setVisitsList(res.data.visitsList || []);
      setLoading(false);
    } catch (err) {
      setError('No rewards found or invalid phone number.');
      setLoading(false);
    }
  };

  const handleClaim = async code => {
    setClaiming(code);
    try {
      await axios.post('/api/rewards/claim', { code });
      // Refresh rewards after claim
      await handleSearch({ preventDefault: () => {} });
    } catch (err) {
      alert('Failed to claim coupon: ' + (err.response?.data?.msg || 'Error'));
    }
    setClaiming('');
  };

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 6, borderRadius: 4, textAlign: 'center', p: 2 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
              Search Rewards by Phone
            </Typography>
            <form onSubmit={handleSearch}>
              <TextField label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} fullWidth margin="normal" required />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: 700, mt: 1 }} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {(rewards || []).length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Visits: {visits}</Typography>
                {visitsList && Array.isArray(visitsList) && visitsList.length > 0 && (
                  <Box sx={{ textAlign: 'left', mt: 2 }}>
                    <Typography variant="subtitle1">Recent visits</Typography>
                    {(Array.isArray(visitsList) ? visitsList : []).map(v => (
                      <Box key={v.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                        <Typography variant="body2">{v.station || 'Unknown station'}</Typography>
                        <Typography variant="body2">{new Date(v.createdAt).toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                <QRCode value={phone + '-' + visits} size={128} style={{ margin: '16px 0' }} />
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {(rewards || []).map(coupon => (
                    <Grid item xs={12} key={coupon._id}>
                      <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>Reward Coupon</Typography>
                          <Typography variant="h5" sx={{ my: 1 }}>{coupon.code}</Typography>
                          <Chip label={coupon.used ? 'Used' : 'Unused'} color={coupon.used ? 'success' : 'warning'} sx={{ mt: 1 }} />
                          {coupon.used ? (
                            <Typography color="error" sx={{ mt: 1 }}>Already claimed</Typography>
                          ) : (
                            <>
                              <Typography color="primary" sx={{ mt: 1 }}>Valid for free tea</Typography>
                              <Button
                                variant="contained"
                                color="success"
                                sx={{ mt: 2, fontWeight: 700 }}
                                onClick={() => handleClaim(coupon.code)}
                                disabled={claiming === coupon.code}
                              >
                                {claiming === coupon.code ? 'Claiming...' : 'Claim Reward'}
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {visits > 0 && visits % 5 === 0 && (rewards || []).some(c => !c.used) && (
                  <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                    Eligible for free tea! Show your QR code and coupon to claim.
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default RewardSearch;
