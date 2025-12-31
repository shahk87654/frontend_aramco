import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Container,
  InputAdornment,
  Divider
} from '@mui/material';
import { Lock, PersonOutline } from '@mui/icons-material';
import logo from '../assets/retail-logo.jpg';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
      setError('Invalid username or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 50%, #1565c0 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-50px',
          right: '-50px'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          bottom: '-100px',
          left: '-100px'
        }
      }}
    >
      <Container maxWidth="sm">
        <Card 
          sx={{ 
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Header Section with Gradient */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              padding: '40px 20px',
              textAlign: 'center',
              color: 'white'
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Aramco Logo"
              sx={{ 
                maxWidth: '120px',
                height: 'auto',
                mb: 2,
                filter: 'brightness(0) invert(1)',
                display: 'block',
                mx: 'auto'
              }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                mb: 0.5,
                letterSpacing: '0.5px'
              }}
            >
              Admin Portal
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                letterSpacing: '0.3px'
              }}
            >
              Secure Access Required
            </Typography>
          </Box>

          <CardContent sx={{ pt: 4, pb: 4, px: 4 }}>
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <Box sx={{ mb: 2.5 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    mb: 1
                  }}
                >
                  Username
                </Typography>
                <TextField 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  fullWidth
                  placeholder="Enter your username or email"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: '#1976d2', mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f5f5f5',
                      '&:hover fieldset': {
                        borderColor: '#1976d2'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                        backgroundColor: '#fff'
                      }
                    }
                  }}
                />
              </Box>

              {/* Password Field */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    mb: 1
                  }}
                >
                  Password
                </Typography>
                <TextField 
                  type="password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  placeholder="Enter your password"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#1976d2', mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f5f5f5',
                      '&:hover fieldset': {
                        borderColor: '#1976d2'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                        backgroundColor: '#fff'
                      }
                    }
                  }}
                />
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    '& .MuiAlert-icon': {
                      color: '#c62828'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Login Button */}
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={loading || !username || !password}
                sx={{ 
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                  '&:hover:not(:disabled)': {
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <Divider sx={{ my: 3, color: '#ddd' }} />

            {/* Footer Info */}
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                textAlign: 'center',
                color: '#999',
                lineHeight: 1.6
              }}
            >
              For support, contact<br />
              <strong>aramcostations@gno.com.pk</strong>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default AdminLogin;
