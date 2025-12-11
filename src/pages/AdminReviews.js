import React, { useEffect, useState, memo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Container, Button } from '@mui/material';

function AdminReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') return navigate('/admin-login');
    const token = localStorage.getItem('token');
    axios.get('/api/admin/reviews', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const raw = res.data;
        const arr = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.reviews) ? raw.reviews : (raw && Array.isArray(raw.data) ? raw.data : []));
        // Sort reviews by station name (A-Z)
        const sorted = [...arr].sort((a, b) => {
          const nameA = (a.station?.name || '').toLowerCase();
          const nameB = (b.station?.name || '').toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        setReviews(sorted);
      })
      .catch(() => setError('Failed to load reviews'));
  }, []);

  const ReviewRow = memo(({ r }) => (
    <TableRow key={r._id}>
      <TableCell>{r.station?.name || '-'}</TableCell>
      <TableCell>{r.user?.email || r.user?.phone || '-'}</TableCell>
      <TableCell>{r.name || '-'}</TableCell>
      <TableCell>{r.contact || '-'}</TableCell>
      <TableCell>
        <Chip label={r.rating} color={r.rating >= 4 ? 'success' : r.rating === 3 ? 'warning' : 'error'} />
      </TableCell>
      <TableCell>{r.comment || '-'}</TableCell>
      <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
      <TableCell>
        {r.flagged ? <Chip label="Flagged" color="error" /> : <Chip label="OK" color="success" />}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mb: 4 }} align="center">
          All Reviews
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Flagged</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(reviews || []).map(r => <ReviewRow r={r} key={r._id} />)}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}

export default AdminReviews;
