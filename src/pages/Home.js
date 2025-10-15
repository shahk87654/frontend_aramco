
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, AppBar, Toolbar, Container } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
function Home() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? '/api/stations'
      : '/api/stations';
      
    axios.get(apiUrl)
      .then(res => {
        const data = res.data;
        // Normalize common response shapes to an array so the UI can safely map
        // over stations. Accept:
        // - an array (most common)
        // - { stations: [...] } or { data: [...] }
        // - a single station object (wrap it)
        if (Array.isArray(data)) {
          setStations(data);
        } else if (data && Array.isArray(data.stations)) {
          setStations(data.stations);
        } else if (data && Array.isArray(data.data)) {
          setStations(data.data);
        } else if (data && (data._id || data.stationId)) {
          // single station object
          setStations([data]);
        } else if (data && typeof data === 'object') {
          // unknown object shape — try to pull any array-valued props
          const arr = Object.values(data).find(v => Array.isArray(v));
          if (arr) setStations(arr);
          else {
            console.warn('Unexpected stations response shape, normalizing to empty array:', data);
            setStations([]);
          }
        } else {
          setStations([]);
        }
      })
      .catch((err) => {
        console.error('Station fetch error:', err.response?.data || err.message);
        setError(`Failed to fetch stations: ${err.response?.data?.message || err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography variant="h5">Loading stations...</Typography></Box>;

  // Always show homepage, even if error

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar position="static" sx={{ bgcolor: 'rgba(25, 118, 210, 0.95)', boxShadow: 3 }}>
        <Toolbar>
          <LocalGasStationIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Aramco Station Review
          </Typography>
          {isAdmin ? (
            <Button color="inherit" sx={{ fontWeight: 700, ml: 2 }} onClick={() => { localStorage.removeItem('isAdmin'); window.location.reload(); }}>
              Sign Out (Admin)
            </Button>
          ) : (
            <Button color="inherit" sx={{ fontWeight: 700, ml: 2 }} onClick={() => navigate('/admin-login')}>
              Admin Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {/* Hero Banner */}
      <Box sx={{
        width: '100%',
        py: 6,
        background: 'linear-gradient(120deg, #1976d2 60%, #42a5f5 100%)',
        color: 'white',
        textAlign: 'center',
        mb: 4,
        boxShadow: 2
      }}>
        <DirectionsCarFilledIcon sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: 1, mb: 1 }}>
          Welcome to Aramco Reviews
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95 }}>
          Share your experience and help us improve our service!
        </Typography>
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
            <Typography align="center" sx={{ width: '100%' }}>No stations available.</Typography>
          )}
          {Array.isArray(stations) ? stations.map(station => (
            <Grid item xs={12} sm={6} md={4} key={station._id}>
              <Card sx={{
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 6,
                borderRadius: 4,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.03)',
                  boxShadow: 12,
                  background: 'linear-gradient(120deg, #e3f2fd 60%, #bbdefb 100%)',
                }
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>{station.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Station ID: {station.stationId}</Typography>
                </CardContent>
                <CardActions>
                  <Button fullWidth variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => navigate(`/review/${station.stationId}`)}>
                    Review This Station
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )) : null}
        </Grid>
      </Container>
      {/* Footer */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', py: 2, textAlign: 'center', mt: 'auto', boxShadow: 2 }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Aramco Review Platform. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default Home;
