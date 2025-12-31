import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Container, Chip, CircularProgress } from '@mui/material';
import QRCode from 'qrcode.react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import axios from 'axios';

function Reward() {
  const { code } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/rewards/profile?code=${encodeURIComponent(code)}`)
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load customer profile');
        setLoading(false);
      });
  }, [code]);

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 6, borderRadius: 4, textAlign: 'center', p: 2 }}>
          <CardContent>
            <EmojiEventsIcon sx={{ fontSize: 60, color: '#ffd600', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mb: 2 }}>
              Congratulations!
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              You've earned a free tea!
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Show this code to the station staff to redeem your reward:
            </Typography>
            <Chip label={code} color="primary" sx={{ fontSize: 22, p: 2, my: 2, fontWeight: 700, letterSpacing: 2 }} />
            <Box sx={{ my: 3 }}>
              <QRCode value={code + (profile ? `|${profile.name || ''}|${profile.contact || ''}` : '')} size={140} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>Scan this QR code at the station to redeem.</Typography>
            </Box>
            {loading && <CircularProgress sx={{ mt: 2 }} />}
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {profile && (
              <Box sx={{ mt: 3, mb: 2, textAlign: 'left' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>Customer Profile</Typography>
                <Typography variant="body2">Name: {profile.name || '-'}</Typography>
                <Typography variant="body2">Contact: {profile.contact || '-'}</Typography>
                <Typography variant="body2">Email: {profile.email || '-'}</Typography>
                <Typography variant="body2">Phone: {profile.phone || '-'}</Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ mt: 2, mb: 3 }}>
              Thank you for being a loyal customer and sharing your feedback every 5th review!
            </Typography>
            <Button component={Link} to="/my-rewards" variant="outlined" color="primary" sx={{ fontWeight: 700 }}>
              View My Rewards
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Reward;
