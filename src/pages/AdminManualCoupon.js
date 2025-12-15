import React, { useEffect, useState } from 'react';
import axios from 'axios';
import normalizeStations from '../utils/stationUtils';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Container,
  Snackbar,
  Alert,
  Grid,
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FileCopy,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function AdminManualCoupon() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [generatedCoupons, setGeneratedCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') return navigate('/admin-login');
    const token = localStorage.getItem('token');
    axios
      .get('/api/stations', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStations(normalizeStations(res.data)))
      .catch(() => setError('Failed to load stations'));
  }, []);

  const handleGenerateCoupons = () => {
    const token = localStorage.getItem('token');

    // Validation
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!selectedStation) {
      setError('Station is required');
      return;
    }
    if (quantity < 1 || quantity > 100) {
      setError('Quantity must be between 1 and 100');
      return;
    }

    // Basic phone number validation (adjust regex as needed)
    const phoneRegex = /^[\d\-\+\s\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Invalid phone number format');
      return;
    }

    setLoading(true);
    axios
      .post(
        '/api/admin/coupons-by-phone',
        {
          phoneNumber: phoneNumber.trim(),
          stationId: selectedStation,
          count: parseInt(quantity, 10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const coupons = res.data.coupons || (res.data.coupon ? [res.data.coupon] : []);
        setGeneratedCoupons(coupons);
        setSuccess(`Successfully generated ${coupons.length} coupon(s)!`);
        setPhoneNumber('');
        setQuantity(1);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to generate coupons');
      })
      .finally(() => setLoading(false));
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const stationName =
    stations.find((s) => s._id === selectedStation)?.name || 'Selected Station';

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#1976d2', mb: 4 }}
          align="center"
        >
          Manual Coupon Generation
        </Typography>

        {/* Input Form */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>
            Generate Coupons by Phone Number
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="e.g., +966 50 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                variant="outlined"
                size="small"
                disabled={loading}
                helperText="Enter customer phone number"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Station"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                variant="outlined"
                size="small"
                disabled={loading}
              >
                <MenuItem value="">-- Select Station --</MenuItem>
                {(Array.isArray(stations) ? stations : []).map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value || '1', 10);
                  if (val >= 1 && val <= 100) {
                    setQuantity(val);
                  }
                }}
                variant="outlined"
                size="small"
                disabled={loading}
                inputProps={{ min: 1, max: 100 }}
                helperText="Between 1 and 100"
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleGenerateCoupons}
                disabled={loading || !phoneNumber || !selectedStation}
                size="large"
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Generating...
                  </>
                ) : (
                  'Generate Coupons'
                )}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary */}
        {generatedCoupons.length > 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Phone Number
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {phoneNumber}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Station
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {stationName}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Total Generated
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {generatedCoupons.length}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Generated Date
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Generated Coupons Table */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
              Generated Coupon Codes
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1976d2' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Coupon Code</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                      Status
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generatedCoupons.map((coupon, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.95rem' }}>
                        {coupon.code}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            backgroundColor: coupon.used ? '#ffebee' : '#e8f5e9',
                            color: coupon.used ? '#c62828' : '#2e7d32',
                            borderRadius: 1,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          {coupon.used ? 'Used' : 'Unused'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color={copiedCode === coupon.code ? 'success' : 'primary'}
                          startIcon={<ContentCopyIcon />}
                          onClick={() => copyToClipboard(coupon.code)}
                        >
                          {copiedCode === coupon.code ? 'Copied!' : 'Copy'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setGeneratedCoupons([]);
                  setPhoneNumber('');
                  setQuantity(1);
                }}
              >
                Clear & Generate More
              </Button>
            </Box>
          </>
        )}

        {/* Empty State */}
        {!loading && generatedCoupons.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Fill in the form and click "Generate Coupons" to create new coupons for a customer.
            </Typography>
          </Paper>
        )}

        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default AdminManualCoupon;
