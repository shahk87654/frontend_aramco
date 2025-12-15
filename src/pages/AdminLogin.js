import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Container } from '@mui/material';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    const validCredentials = [
      { username: 'GO', password: '12345' },
      { username: 'jawad.arshad@gno.com.pk', password: 'Jawad@123' },
      { username: 'awais.javed@gno.com.pk', password: 'Awais@123' }
    ];
    
    const isValid = validCredentials.some(cred => cred.username === username && cred.password === password);
    
    if (isValid) {
      // Mark admin in localStorage and set a short-lived dev token so admin API calls include Authorization header
      // record login time so we can enforce a cooldown/expiry (18 hours)
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('token', 'dev-admin-token');
      localStorage.setItem('adminLoginAt', String(Date.now()));
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="xs">
        <Card sx={{ boxShadow: 6, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }} align="center">Admin Login</Typography>
            <form onSubmit={handleSubmit}>
              <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth margin="normal" />
              <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 700 }}>Login as Admin</Button>
            </form>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default AdminLogin;
