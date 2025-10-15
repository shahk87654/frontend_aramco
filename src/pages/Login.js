import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Container } from '@mui/material';


function Login() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, phone, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="xs">
        <Card sx={{ boxShadow: 6, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }} align="center">Login</Typography>
            <form onSubmit={handleSubmit}>
              <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth margin="normal" />
              <TextField label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} fullWidth margin="normal" />
              <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 700 }}>Login</Button>
            </form>
            <Typography align="center" sx={{ mt: 2 }}>
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;
