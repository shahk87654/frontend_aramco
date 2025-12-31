import React, { useEffect, useReducer } from 'react';
import logo from '../assets/retail-logo.jpg';
import QRCode from 'qrcode.react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import normalizeStations from '../utils/stationUtils';
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
  qrDialogOpen: false,
  disclaimerDialogOpen: false,
  submitting: false,
  cooldownDialogOpen: false,
  successDialogOpen: false
  };
  function reducer(state, action) {
    switch (action.type) {
      case 'set': return { ...state, [action.field]: action.value };
      case 'error': return { ...state, error: action.value };
      case 'success': return { ...state, success: action.value, successDialogOpen: true };
  case 'showQR': return { ...state, showQR: action.value, qrDialogOpen: true };
      case 'openDisclaimer': return { ...state, disclaimerDialogOpen: true };
      case 'closeDisclaimer': return { ...state, disclaimerDialogOpen: false };
      case 'submitting': return { ...state, submitting: action.value };
      case 'openCooldown': return { ...state, cooldownDialogOpen: true };
      case 'closeCooldown': return { ...state, cooldownDialogOpen: false };
      case 'closeSuccess': return { ...state, successDialogOpen: false };
      case 'reset': return initialState;
      default: return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  // Local UI state for claim in QR dialog
  const [claiming, setClaiming] = React.useState(false);

  useEffect(() => {
    axios.get(`/api/stations?stationId=${stationId}`)
      .then(res => {
        const arr = normalizeStations(res.data);
        const found = arr.find(s => s.stationId === stationId);
        setStation(found || null);
      })
      .catch(() => dispatch({ type: 'error', value: 'Station not found' }));
  }, [stationId]);

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (state.submitting) return;
    
    dispatch({ type: 'error', value: '' });
    if (!state.rating) return dispatch({ type: 'error', value: 'Please provide an overall rating' });
    if (!state.name.trim()) return dispatch({ type: 'error', value: 'Please enter your name' });
  if (!state.contact.trim()) return dispatch({ type: 'error', value: 'Please enter your phone number' });
    
    // Set submitting state
    dispatch({ type: 'submitting', value: true });
    
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
  const res = await api.post('/api/reviews', {
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
        // Show QR dialog with claim button. Do not auto-navigate to reward page.
        setTimeout(() => {
          dispatch({ type: 'showQR', value: { code: res.data.coupon.code, name: state.name, contact: state.contact } });
        }, 2500);
      }
    } catch (err) {
      // Handle 18h review cooldown error with popup
      let msg = err.response?.data?.msg || 'Failed to submit review';
      if (msg.includes('once per 18h') || msg.includes('18 hours')) {
        dispatch({ type: 'openCooldown' });
      } else {
        dispatch({ type: 'error', value: msg });
      }
    } finally {
      // Reset submitting state
      dispatch({ type: 'submitting', value: false });
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
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            component="img"
            src={logo}
            alt="Aramco Logo"
            sx={{ display: 'block', mx: 'auto', maxWidth: '100%', height: 'auto' }}
          />
        </Box>
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
                    label="Contact (Phone)"
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
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    disabled={state.submitting}
                    sx={{ fontWeight: 700, borderRadius: 2, py: 1.2, mt: 1 }}
                  >
                    {state.submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mt: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 2, color: '#1976d2', fontSize: 18 }}>Disclaimer</Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                The Aramco Reviews App is designed to collect customer feedback for service improvement purposes only. All reviews submitted through this platform are recorded to help enhance customer experience at Aramco fuel stations.
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Rewards against completion and submission of reviews must be claimed on Aramco A-Stop only on specific nominated products</strong>
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                Rewards, offers, or complimentary items (if applicable) are subject to availability, station participation, and internal policies. Submission of a review does not guarantee fulfillment of any reward or claim.
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                Aramco Pakistan reserves the right to verify, approve, modify, or decline any review, reward, or claim in case of misuse, duplication, technical issues, or violation of platform guidelines.
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                For any queries, concerns, or unfulfilled claims, please contact us at <strong>aramcostations@gno.com.pk</strong>
              </Typography>

              <Typography variant="body2">
                By using this application, you acknowledge and agree to this disclaimer.
              </Typography>
            </Box>
            {state.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}
           
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
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={async () => {
                          if (!state.showQR || !state.showQR.code) return;
                          setClaiming(true);
                          try {
                            await api.post('/api/rewards/claim', { code: state.showQR.code });
                            // mark as claimed in UI and close dialog
                            dispatch({ type: 'showQR', value: null });
                            // update success payload so visits/coupons reflect claimed state if needed
                            dispatch({ type: 'success', value: { ...state.success, couponClaimed: state.showQR.code } });
                            // notify other pages (MyRewards) to refresh their data
                            try { window.dispatchEvent(new CustomEvent('couponClaimed', { detail: { code: state.showQR.code } })); } catch (e) {}
                          } catch (err) {
                            // show a simple alert on failure
                            alert('Failed to claim coupon: ' + (err.response?.data?.msg || err.message || 'Error'));
                          }
                          setClaiming(false);
                        }}
                        disabled={claiming}
                        sx={{ mt: 1, fontWeight: 700 }}
                      >
                        {claiming ? 'Claiming...' : 'Claimed'}
                      </Button>
                    </Box>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={state.disclaimerDialogOpen} onClose={() => dispatch({ type: 'closeDisclaimer' })} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Disclaimer</span>
                <IconButton onClick={() => dispatch({ type: 'closeDisclaimer' })} size="small"><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  The Aramco Reviews App is designed to collect customer feedback for service improvement purposes only. All reviews submitted through this platform are recorded to help enhance customer experience at Aramco fuel stations.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Rewards, offers, or complimentary items (if applicable) are subject to availability, station participation, and internal policies. Submission of a review does not guarantee fulfillment of any reward or claim.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Aramco Pakistan reserves the right to verify, approve, modify, or decline any review, reward, or claim in case of misuse, duplication, technical issues, or violation of platform guidelines.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  For any queries, concerns, or unfulfilled claims, please contact us at aramcostations@gno.com.pk
                </Typography>
                <Typography variant="body2">
                  By using this application, you acknowledge and agree to this disclaimer.
                </Typography>
              </DialogContent>
            </Dialog>

            <Dialog open={state.cooldownDialogOpen} onClose={() => dispatch({ type: 'closeCooldown' })} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d32f2f' }}>
                <span>⏱️ Please Wait</span>
                <IconButton onClick={() => dispatch({ type: 'closeCooldown' })} size="small"><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', fontWeight: 600 }}>
                  Please wait 18 hours before submitting another review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You can submit your next review after 18 hours have passed since your last submission.
                </Typography>
              </DialogContent>
            </Dialog>

            <Dialog open={state.successDialogOpen} onClose={() => dispatch({ type: 'closeSuccess' })} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1976d2' }}>
                <span>✅ Review Submitted</span>
                <IconButton onClick={() => dispatch({ type: 'closeSuccess' })} size="small"><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
                  Review submitted!
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Visits: <strong>{state.success?.visits}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {state.success?.visitsLeft === 0
                    ? '🎉 You just earned a free tea!'
                    : `Visits left for free tea: ${state.success?.visitsLeft}`}
                </Typography>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Review;
