
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../utils/api';
import normalizeStations from '../utils/stationUtils';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  Container,
  Chip,
} from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import logo from '../assets/retail-logo.jpg';
function Home() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawStationsResp, setRawStationsResp] = useState(null);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    // Use centralized api instance so baseURL/headers are consistent
    api.get('/stations')
      .then(res => {
        // keep raw response (full) for debugging when stations missing
        setRawStationsResp(res);
        const norm = normalizeStations(res.data);
        console.debug('Stations API raw:', res.data, 'normalized ->', norm);
        setStations(norm);
      })
      .catch((err) => {
        console.error('Station fetch error:', err.response?.data || err.message);
        setError(`Failed to fetch stations: ${err.response?.data?.message || err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: 'radial-gradient(circle at top left, #e3f2fd 0, #f5f6fa 40%, #ffffff 100%)',
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Retail logo"
          sx={{ width: 80, height: 'auto', borderRadius: 1, mb: 1 }}
        />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
          Loading stations...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Preparing nearby Aramco locations for your review.
        </Typography>
      </Box>
    );
  }

  // Always show homepage, even if error

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #e3f2fd 0, #f5f6fa 40%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logo}
              alt="Retail logo"
              sx={{ height: 36, width: 'auto', borderRadius: 1 }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0d47a1' }}>
                Aramco Retail
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer Experience Portal
              </Typography>
            </Box>
          </Box>
          {isAdmin ? (
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => {
                localStorage.removeItem('isAdmin');
                window.location.reload();
              }}
              sx={{ textTransform: 'none', borderRadius: 999 }}
            >
              Sign out (Admin)
            </Button>
          ) : (
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => navigate('/admin-login')}
              sx={{ textTransform: 'none', borderRadius: 999 }}
            >
              Admin Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Banner */}
      <Box
        sx={{
          width: '100%',
          py: 6,
          background: 'linear-gradient(120deg, #1976d2 0%, #42a5f5 60%, #90caf9 100%)',
          color: 'white',
          mb: 4,
          boxShadow: 2,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, letterSpacing: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <DirectionsCarFilledIcon sx={{ fontSize: 42 }} />
                Aramco Reviews
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 2 }}>
                Share your station experience and help us elevate service across the network.
              </Typography>
              <Chip
                label="Takes less than 1 minute"
                color="default"
                sx={{ backgroundColor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 500 }}
              />
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  px: 3,
                  py: 2,
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  How it works
                </Typography>
                <Typography variant="body2">
                  Pick your station, rate your visit, and submit your feedback. Your insights directly shape future
                  improvements.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ flex: 1, pb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>
          Select a Station
        </Typography>
        <Typography align="center" sx={{ mb: 4, color: '#555' }}>
          Choose your Aramco station below or scan a QR code at the station to review directly.
        </Typography>
        {error && (
          <Typography align="center" color="error" sx={{ mb: 2 }}>
            {error} (Please check your connection or contact admin.)
          </Typography>
        )}
        <Grid container spacing={3}>
          {stations.length === 0 && !error && (
            <>
              <Typography align="center" sx={{ width: '100%' }}>No stations available.</Typography>
              {/* Debug output to help identify why stations are missing */}
              <Box sx={{ width: '100%', mt: 2, px: 2 }}>
                <Typography variant="caption" color="text.secondary">Raw /api/stations response (for debugging)</Typography>
                <Box sx={{ mt: 1, maxHeight: 240, overflow: 'auto', bgcolor: '#fff', border: '1px solid #eee', p: 1, borderRadius: 1 }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{rawStationsResp ? JSON.stringify(rawStationsResp, null, 2) : 'No response captured'}</pre>
                </Box>
              </Box>
              {process.env.NODE_ENV !== 'production' && (
                <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
                  <Button variant="outlined" onClick={async () => {
                    try {
                      setLoading(true);
                      const resp = await axios.post('/api/dev/seed');
                      setStations(normalizeStations(resp.data.stations || resp.data || []));
                    } catch (e) {
                      console.error('Seed error:', e);
                      setError('Failed to seed demo stations');
                    } finally {
                      setLoading(false);
                    }
                  }}>
                    Seed demo stations
                  </Button>
                </Box>
              )}
            </>
          )}
          {Array.isArray(stations) ? stations.map(station => (
            <Grid item xs={12} sm={6} md={4} key={station._id}>
              <Card
                sx={{
                  minHeight: 190,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 4,
                  borderRadius: 3,
                  border: '1px solid rgba(25,118,210,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 10,
                    borderColor: 'rgba(25,118,210,0.4)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Station
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 0.5 }}>
                    {station.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {station.stationId}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 999, fontWeight: 600, textTransform: 'none' }}
                    onClick={() => navigate(`/review/${station.stationId}`)}
                  >
                    Review this station
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )) : null}
        </Grid>
      </Container>
      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#0d47a1',
          color: 'white',
          py: 2,
          textAlign: 'center',
          mt: 'auto',
          boxShadow: 2,
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Aramco Retail Reviews. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default Home;
