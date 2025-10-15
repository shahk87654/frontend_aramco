import React, { useEffect, useReducer } from 'react';
import QRCode from 'qrcode.react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StarRating from '../components/StarRating';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Alert, Container, Divider, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

function Review() {
  const { stationId } = useParams();
  const [station, setStation] = React.useState(null);
  const navigate = useNavigate();
  const initialState = {
    rating: 0,
    name: '',
    contact: '',
    cleanliness: 0,
    serviceSpeed: 0,
    staffFriendliness: 0,
    comment: '',
    error: '',
    success: null,
  showQR: null,
  qrDialogOpen: false
  };
  function reducer(state, action) {
    switch (action.type) {
      case 'set': return { ...state, [action.field]: action.value };
      case 'error': return { ...state, error: action.value };
      case 'success': return { ...state, success: action.value };
  case 'showQR': return { ...state, showQR: action.value, qrDialogOpen: true };
      case 'reset': return initialState;
      default: return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    axios.get(`/api/stations?stationId=${stationId}`)
      .then(res => {
        const found = res.data.find(s => s.stationId === stationId);
        setStation(found);
      })
      .catch(() => dispatch({ type: 'error', value: 'Station not found' }));
  }, [stationId]);

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch({ type: 'error', value: '' });
    if (!state.rating) return dispatch({ type: 'error', value: 'Please provide an overall rating' });
    if (!state.name.trim()) return dispatch({ type: 'error', value: 'Please enter your name' });
    if (!state.contact.trim()) return dispatch({ type: 'error', value: 'Please enter your contact info' });
    try {
      const gps = await new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null)
          );
        } else {
          resolve(null);
        }
      });
      const res = await axios.post('/api/reviews', {
        stationId,
        rating: state.rating,
        cleanliness: state.cleanliness,
        serviceSpeed: state.serviceSpeed,
        staffFriendliness: state.staffFriendliness,
        comment: state.comment,
        name: state.name,
        contact: state.contact,
        gps,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      dispatch({ type: 'success', value: res.data });
      // Show visits and visits left before QR
      if (res.data.coupon) {
        setTimeout(() => {
          dispatch({ type: 'showQR', value: { code: res.data.coupon.code, name: state.name, contact: state.contact } });
          setTimeout(() => navigate(`/reward/${res.data.coupon.code}`), 4000);
        }, 2500);
      }
    } catch (err) {
  // Remove 24h review restriction error message
  let msg = err.response?.data?.msg || 'Failed to submit review';
  if (msg.includes('once per 24h')) msg = 'Failed to submit review';
  dispatch({ type: 'error', value: msg });
    }
  };

  if (!station) return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h5">Loading station...</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 6, borderRadius: 4, p: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalGasStationIcon sx={{ fontSize: 36, color: '#1976d2', mr: 1 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>{station.name}</Typography>
                <Typography variant="body2" color="text.secondary">Station ID: {station.stationId}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit} autoComplete="off">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    value={state.name}
                    onChange={e => dispatch({ type: 'set', field: 'name', value: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact (Phone/Email)"
                    value={state.contact}
                    onChange={e => dispatch({ type: 'set', field: 'contact', value: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Overall Rating</Typography>
                  <StarRating value={state.rating} onChange={val => dispatch({ type: 'set', field: 'rating', value: val })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Cleanliness</Typography>
                  <StarRating value={state.cleanliness} onChange={val => dispatch({ type: 'set', field: 'cleanliness', value: val })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Service Speed</Typography>
                  <StarRating value={state.serviceSpeed} onChange={val => dispatch({ type: 'set', field: 'serviceSpeed', value: val })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Staff Friendliness</Typography>
                  <StarRating value={state.staffFriendliness} onChange={val => dispatch({ type: 'set', field: 'staffFriendliness', value: val })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Comments"
                    multiline
                    minRows={3}
                    fullWidth
                    value={state.comment}
                    onChange={e => dispatch({ type: 'set', field: 'comment', value: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
                {/* TODO: Add reCAPTCHA widget here */}
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: 700, borderRadius: 2, py: 1.2, mt: 1 }}>
                    Submit Review
                  </Button>
                </Grid>
              </Grid>
            </form>
            {state.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}
            {state.success && !state.showQR && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Review submitted!<br/>
                Visits: {state.success.visits} <br/>
                {state.success.visitsLeft === 0
                  ? 'You just earned a free coffee!'
                  : `Visits left for free coffee: ${state.success.visitsLeft}`}
              </Alert>
            )}
            <Dialog open={!!state.qrDialogOpen} onClose={() => dispatch({ type: 'showQR', value: null })} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>🎉 You won a free tea!</span>
                <IconButton onClick={() => dispatch({ type: 'showQR', value: null })} size="small"><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 2 }}>Show this QR code to the staff to claim your reward.</Typography>
                {state.showQR && (
                  <>
                    <QRCode value={state.showQR.code + '|' + state.showQR.name + '|' + state.showQR.contact} size={140} style={{ margin: '16px 0' }} />
                    <Typography variant="body2" sx={{ mt: 2 }}>Name: {state.showQR.name} <br />Contact: {state.showQR.contact}</Typography>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Review;
