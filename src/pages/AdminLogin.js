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
  InputAdornment
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
      setError('Invalid username or password');
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
        background: 'linear-gradient(135deg, #f0f2f5 0%, #e8eaef 100%)',
        position: 'relative',
        padding: '20px'
      }}
    >
      {/* Decorative Aramco Red Accent - Top Right */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '400px',
          height: '400px',
          background: 'linear-gradient(135deg, rgba(227, 24, 55, 0.08) 0%, transparent 100%)',
          borderRadius: '0 0 0 400px',
          pointerEvents: 'none'
        }}
      />

      {/* Decorative Dark Accent - Bottom Left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '300px',
          height: '300px',
          background: 'linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, transparent 100%)',
          borderRadius: '0 300px 0 0',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card 
          sx={{ 
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          {/* Top Red Accent Bar */}
          <Box
            sx={{
              height: '5px',
              background: 'linear-gradient(90deg, #E31837 0%, #FF6B35 100%)'
            }}
          />

          <CardContent sx={{ pt: 5, pb: 4, px: 4 }}>
            {/* Logo Section */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                component="img"
                src={logo}
                alt="Aramco Logo"
                sx={{ 
                  maxWidth: '100px',
                  height: 'auto',
                  mb: 2.5,
                  display: 'block',
                  mx: 'auto'
                }}
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: '#003D7A',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}
              >
                Admin Portal
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  fontWeight: 500
                }}
              >
                Secure Access
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <Box sx={{ mb: 2.5 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#003D7A',
                    mb: 0.8,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Username
                </Typography>
                <TextField 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  fullWidth
                  placeholder="Enter username or email"
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: '#E31837', mr: 1, fontSize: '20px' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: '#E31837'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31837',
                        backgroundColor: '#fff'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.95rem'
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
                    color: '#003D7A',
                    mb: 0.8,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Password
                </Typography>
                <TextField 
                  type="password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  placeholder="Enter password"
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#E31837', mr: 1, fontSize: '20px' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: '#E31837'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E31837',
                        backgroundColor: '#fff'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2.5,
                    borderRadius: '8px',
                    backgroundColor: '#fff3e0',
                    color: '#E31837',
                    border: '1px solid #ffccb3',
                    '& .MuiAlert-icon': {
                      color: '#E31837'
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
                  background: 'linear-gradient(90deg, #E31837 0%, #FF6B35 100%)',
                  fontWeight: 700,
                  py: 1.3,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(227, 24, 55, 0.25)',
                  '&:hover:not(:disabled)': {
                    boxShadow: '0 8px 25px rgba(227, 24, 55, 0.35)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    boxShadow: 'none'
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Bottom Red Accent Bar */}
            <Box
              sx={{
                height: '3px',
                background: 'linear-gradient(90deg, #E31837 0%, #FF6B35 100%)',
                mt: 4,
                mb: -4,
                mx: -4
              }}
            />
          </CardContent>

          {/* Footer */}
          <Box
            sx={{
              backgroundColor: '#f9f9f9',
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                textAlign: 'center',
                color: '#999',
                fontSize: '0.8rem'
              }}
            >
              For support: <strong>aramcostations@gno.com.pk</strong>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default AdminLogin;
