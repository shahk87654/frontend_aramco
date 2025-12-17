
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../utils/api';
import normalizeStations from '../utils/stationUtils';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Container, Divider, Chip, Avatar, Paper, TextField, MenuItem, CircularProgress, IconButton, Button } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import ClearIcon from '@mui/icons-material/Clear';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [stationOptions, setStationOptions] = useState([]);
  const [stationLoading, setStationLoading] = useState(false);

  useEffect(() => {
    // Redirect to admin login if not marked as admin locally
    if (localStorage.getItem('isAdmin') !== 'true') return navigate('/admin-login');
    const token = localStorage.getItem('token');
    setStationLoading(true);
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/stations')
    ])
      .then(([statsRes, stationsRes]) => {
        setStats(statsRes.data);
        setStationOptions(normalizeStations(stationsRes.data));
        setStationLoading(false);
      })
      .catch(() => {
        setError('Failed to load stats or stations');
        setStationLoading(false);
      });
  }, []);

  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
  if (!stats) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography>Loading dashboard...</Typography></Box>;

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo.jpg"
              alt="Aramco Logo"
              sx={{ height: 52, objectFit: 'contain' }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2' }}>
              <BarChartIcon sx={{ fontSize: 36, mb: -1, mr: 1 }} /> Admin Dashboard
            </Typography>
          </Box>
          <Button color="error" variant="outlined" onClick={() => { localStorage.removeItem('isAdmin'); localStorage.removeItem('token'); window.location.href = '/admin-login'; }}>Logout</Button>
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary">Total Reviews</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{stats.totalReviews}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary">Total Stations</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{stats.totalStations}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary">Total Coupons</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{stats.totalCoupons}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary">Avg. Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <StarIcon sx={{ color: '#ffb300', mr: 0.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{(stats.avgRating ?? 0).toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
            <EmojiEventsIcon sx={{ mb: -0.5, mr: 1, color: '#ffd600' }} /> Top Stations
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {(stats.topStations || []).map(s => (
              <Grid item xs={12} sm={6} key={s._id}>
                <Card sx={{ p: 2, borderLeft: '6px solid #1976d2', borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}><LocalGasStationIcon /></Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                    </Box>
                    <Chip label={`Avg: ${s.avgRating?.toFixed(2) || 0}`} color="primary" sx={{ mr: 1 }} />
                    <Chip label={`Reviews: ${s.reviewCount}`} color="secondary" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
            <EmojiEventsIcon sx={{ mb: -0.5, mr: 1, color: '#d32f2f' }} /> Lowest Stations
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {(stats.lowStations || []).map(s => (
              <Grid item xs={12} sm={6} key={s._id}>
                <Card sx={{ p: 2, borderLeft: '6px solid #d32f2f', borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#d32f2f', mr: 1 }}><LocalGasStationIcon /></Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                    </Box>
                    <Chip label={`Avg: ${s.avgRating?.toFixed(2) || 0}`} color="primary" sx={{ mr: 1 }} />
                    <Chip label={`Reviews: ${s.reviewCount}`} color="secondary" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        {/* Station Reviews Section */}
        <Paper sx={{ p: 3, mt: 4, borderRadius: 3, boxShadow: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
            Reviews by Station
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, minWidth: 320 }}>
            <Autocomplete
              options={[{ _id: 'all', name: 'All Stations' }, ...stationOptions]}
              getOptionLabel={option => option.name || option._id}
              value={stationOptions.find(s => s._id === stationFilter) || (stationFilter === 'all' ? { _id: 'all', name: 'All Stations' } : null)}
              onChange={(_, newValue) => setStationFilter(newValue ? newValue._id : 'all')}
              loading={stationLoading}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Filter by Station"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {stationLoading ? <CircularProgress color="inherit" size={18} /> : null}
                        {stationFilter !== 'all' && (
                          <IconButton size="small" onClick={() => setStationFilter('all')}><ClearIcon fontSize="small" /></IconButton>
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
          </Box>
          {Object.entries(stats.stationReviews || {})
            .filter(([stationId]) => stationFilter === 'all' || stationId === stationFilter)
            .map(([stationId, reviews = []]) => {
              const station = stationOptions.find(s => s._id === stationId) || {};
              return (
                <Box key={stationId} sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>{station.name || stationId}</Typography>
                  {(!reviews || reviews.length === 0) ? (
                    <Typography color="text.secondary">No reviews yet.</Typography>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                        <thead>
                          <tr style={{ background: '#f0f4ff' }}>
                            <th style={{ padding: 6, border: '1px solid #e0e0e0' }}>User</th>
                            <th style={{ padding: 6, border: '1px solid #e0e0e0' }}>Name</th>
                            <th style={{ padding: 6, border: '1px solid #e0e0e0' }}>Contact</th>
                            <th style={{ padding: 6, border: '1px solid #e0e0e0' }}>Rating</th>
                            <th style={{ padding: 6, border: '1px solid #e0e0e0' }}>Comment</th>
                            <th style={{ padding: 6, border: '1px solid #e0e0e0' }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map(r => (
                            <tr key={r._id}>
                              <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>{r.user?.email || r.user?.phone || '-'}</td>
                              <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>{r.name || '-'}</td>
                              <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>{r.contact || '-'}</td>
                              <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>{r.rating}</td>
                              <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>{r.comment || '-'}</td>
                              <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>{new Date(r.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  )}
                </Box>
              );
            })}
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
