import React, { useEffect, useState } from 'react';
import axios from 'axios';
import normalizeStations from '../utils/stationUtils';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Button, TextField, MenuItem, Snackbar, Alert } from '@mui/material';

function AdminCoupons() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedReview, setSelectedReview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') return navigate('/admin-login');
    const token = localStorage.getItem('token');
    axios.get('/api/admin/coupons', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCoupons(res.data))
      .catch(() => setError('Failed to load coupons'));
    axios.get('/api/stations', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStations(normalizeStations(res.data)))
      .catch(() => {});
    axios.get('/api/admin/reviews', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const users = res.data.map(r => r.user).filter((u, i, arr) => u && arr.findIndex(x => x?._id === u?._id) === i);
        setUsers(users);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = () => {
    const token = localStorage.getItem('token');
    if (!selectedUser || !selectedStation) {
      setError('User and Station required');
      return;
    }
    axios.post('/api/admin/coupons', { userId: selectedUser, reviewId: selectedReview, stationId: selectedStation }, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSuccess('Coupon generated!');
        setCoupons(coupons => [...coupons, res.data.coupon]);
      })
      .catch(() => setError('Failed to generate coupon'));
  };

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mb: 4 }} align="center">
          Coupon Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField select label="User" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} sx={{ minWidth: 200 }}>
            {users.map(u => <MenuItem key={u?._id} value={u?._id}>{u?.email || u?.phone}</MenuItem>)}
          </TextField>
          <TextField select label="Station" value={selectedStation} onChange={e => setSelectedStation(e.target.value)} sx={{ minWidth: 200 }}>
            {stations.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </TextField>
          <Button variant="contained" color="primary" onClick={handleGenerate}>Generate Coupon</Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Station</TableCell>
                <TableCell>Used</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map(c => (
                <TableRow key={c._id}>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.user?.email || c.user?.phone || '-'}</TableCell>
                  <TableCell>{c.station?.name || '-'}</TableCell>
                  <TableCell>{c.used ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}><Alert severity="success">{success}</Alert></Snackbar>
        <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}><Alert severity="error">{error}</Alert></Snackbar>
      </Container>
    </Box>
  );
}

export default AdminCoupons;
