import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { styled, keyframes } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const buttonGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const cardGlow = keyframes`
  0% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.08),
                0 0 50px rgba(255, 255, 255, 0.1),
                0 4px 60px rgba(31, 38, 135, 0.1);
  }
  30% {
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.12),
                0 0 60px rgba(255, 255, 255, 0.15),
                0 6px 70px rgba(31, 38, 135, 0.15);
  }
  60% {
    box-shadow: 0 0 35px rgba(59, 130, 246, 0.1),
                0 0 55px rgba(255, 255, 255, 0.12),
                0 5px 65px rgba(31, 38, 135, 0.12);
  }
  100% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.08),
                0 0 50px rgba(255, 255, 255, 0.1),
                0 4px 60px rgba(31, 38, 135, 0.1);
  }
`;

const LoginButton = styled(Button)({
  background: 'linear-gradient(270deg, #3b82f6, #2563eb, #1d4ed8)',
  backgroundSize: '200% 200%',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  marginTop: '24px',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },

  '&:hover': {
    boxShadow: '0 6px 10px -1px rgba(59, 130, 246, 0.3)',
    animation: `${buttonGlow} 3s ease infinite`,

    '&::before': {
      left: '100%',
    }
  },

  '&:active': {
    boxShadow: '0 2px 4px -1px rgba(59, 130, 246, 0.2)',
  },

  '&:disabled': {
    background: '#94a3b8',
    transform: 'none',
    boxShadow: 'none',
    animation: 'none',
    
    '&::before': {
      display: 'none'
    }
  }
});

const LoginCard = styled(Card)(({ theme }) => ({
  padding: '2rem',
  maxWidth: '440px',
  width: '90%',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '24px',
  transition: 'all 0.3s ease',
  animation: `${cardGlow} 6s ease-in-out infinite`,
  '&:hover': {
    boxShadow: '0 0 50px rgba(59, 130, 246, 0.15)'
  },
  backgroundImage: `linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.05) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(147, 197, 253, 0.05) 100%
  )`
}));

const Title = styled(Typography)({
  background: 'linear-gradient(270deg, #3b82f6, #2563eb)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: '800 !important',
  letterSpacing: '-0.5px'
});

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      console.log('Attempting login with:', credentials.email);
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
      console.log('Login response:', response.data);
      login(response.data);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please check your credentials and try again.'
      );
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'transparent',
      position: 'relative',
      zIndex: 1
    }}>
      <LoginCard>
        <Title variant="h4" gutterBottom align="center">
          Login
        </Title>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Welcome back! Please sign in to continue
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />

          <LoginButton
            variant="contained"
            type="submit"
            fullWidth
            sx={{ 
              mt: 3,
              fontSize: '1rem',
              fontWeight: 600,
              py: 1.5
            }}
          >
            Log In
          </LoginButton>
        </form>
      </LoginCard>
    </Box>
  );
};

export default Login; 