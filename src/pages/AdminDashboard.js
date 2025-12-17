
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import normalizeStations from '../utils/stationUtils';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Divider,
  Chip,
  Avatar,
  Paper,
  TextField,
  CircularProgress,
  IconButton,
  Button,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import ClearIcon from '@mui/icons-material/Clear';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import logo from '../assets/retail-logo.jpg';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [stationOptions, setStationOptions] = useState([]);
  const [stationLoading, setStationLoading] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load stats or stations');
        setStationLoading(false);
        setLoading(false);
      });
  }, []);

  if (loading && !stats) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading admin insights...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography color="error" sx={{ fontWeight: 600, mb: 1 }}>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please refresh the page to try again.
        </Typography>
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 6,
        background: 'radial-gradient(circle at top left, #e3f2fd 0, #f5f6fa 45%, #ffffff 100%)',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logo}
              alt="Aramco Logo"
              sx={{ display: 'block', height: 44, width: 'auto', borderRadius: 1 }}
            />
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: '#0d47a1', letterSpacing: 0.5 }}
              >
                <BarChartIcon sx={{ fontSize: 32, mb: -0.5, mr: 1 }} />
                Admin Insights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor station performance, customer sentiment, and coupon activity at a glance.
              </Typography>
            </Box>
          </Box>
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              localStorage.removeItem('isAdmin');
              localStorage.removeItem('token');
              window.location.href = '/admin-login';
            }}
            sx={{
              borderRadius: 999,
              px: 3,
            }}
          >
            Logout
          </Button>
        </Box>

        {/* High level metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: 'center',
                boxShadow: 3,
                borderRadius: 3,
                background: 'linear-gradient(145deg, #e3f2fd, #ffffff)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Reviews
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {stats.totalReviews}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: 'center',
                boxShadow: 3,
                borderRadius: 3,
                background: 'linear-gradient(145deg, #e8f5e9, #ffffff)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Stations
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {stats.totalStations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: 'center',
                boxShadow: 3,
                borderRadius: 3,
                background: 'linear-gradient(145deg, #fff3e0, #ffffff)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Coupons
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {stats.totalCoupons}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: 'center',
                boxShadow: 3,
                borderRadius: 3,
                background: 'linear-gradient(145deg, #fffde7, #ffffff)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Avg. Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <StarIcon sx={{ color: '#ffb300', mr: 0.5 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {(stats.avgRating ?? 0).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Station performance */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
                <EmojiEventsIcon sx={{ mb: -0.5, mr: 1, color: '#ffd600' }} /> Top Stations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {(stats.topStations || []).map((s, idx) => (
                  <Grid item xs={12} key={s._id}>
                    <Card
                      sx={{
                        p: 2,
                        borderLeft: '6px solid #1976d2',
                        borderRadius: 2,
                        boxShadow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          py: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#1976d2' }}>
                            <LocalGasStationIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {s.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Rank #{idx + 1}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <Chip
                            label={`Avg: ${s.avgRating?.toFixed(2) || 0}`}
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label={`Reviews: ${s.reviewCount}`}
                            color="secondary"
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {(!stats.topStations || stats.topStations.length === 0) && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No data yet.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
                <EmojiEventsIcon sx={{ mb: -0.5, mr: 1, color: '#d32f2f' }} /> Lowest Stations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {(stats.lowStations || []).map((s, idx) => (
                  <Grid item xs={12} key={s._id}>
                    <Card
                      sx={{
                        p: 2,
                        borderLeft: '6px solid #d32f2f',
                        borderRadius: 2,
                        boxShadow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          py: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#d32f2f' }}>
                            <LocalGasStationIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {s.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Needs attention
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <Chip
                            label={`Avg: ${s.avgRating?.toFixed(2) || 0}`}
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label={`Reviews: ${s.reviewCount}`}
                            color="secondary"
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {(!stats.lowStations || stats.lowStations.length === 0) && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No data yet.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Station Reviews Section */}
        <Paper sx={{ p: 3, mt: 2, borderRadius: 3, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                Reviews by Station
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dive into detailed feedback per station and filter quickly.
              </Typography>
            </Box>
            <Tooltip title="Filter and inspect reviews for specific stations">
              <Chip label="Review Analytics" color="primary" variant="outlined" />
            </Tooltip>
          </Box>
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
                  <Typography variant="subtitle1" sx={{ color: '#1976d2', mb: 1, fontWeight: 600 }}>
                    {station.name || stationId}
                  </Typography>
                  {(!reviews || reviews.length === 0) ? (
                    <Typography color="text.secondary">No reviews yet.</Typography>
                  ) : (
                    <TableContainer sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f0f4ff' }}>
                            <TableCell>User</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Comment</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reviews.map(r => (
                            <TableRow key={r._id} hover>
                              <TableCell>{r.user?.email || r.user?.phone || '-'}</TableCell>
                              <TableCell>{r.name || '-'}</TableCell>
                              <TableCell>{r.contact || '-'}</TableCell>
                              <TableCell>{r.rating}</TableCell>
                              <TableCell>{r.comment || '-'}</TableCell>
                              <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
