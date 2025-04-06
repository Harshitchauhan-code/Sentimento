import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Divider,
  ListItemIcon
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PsychologyIcon from '@mui/icons-material/Psychology';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  // Get initials from user name for Avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid #e2e8f0',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'  // Semi-transparent white
      }}
    >
      <Toolbar>
        <AnalyticsIcon sx={{ color: 'primary.main', mr: 2 }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, color: 'text.primary', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Sentiment Analyzer
        </Typography>

        {user ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user.agent?.role === 'admin' && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin')}
                  startIcon={<AdminPanelSettingsIcon />}
                >
                  Admin
                </Button>
              )}
              <Button 
                color="inherit" 
                onClick={() => navigate('/')}
                startIcon={<SentimentSatisfiedAltIcon />}
              >
                Analysis
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/history')}
                startIcon={<HistoryIcon />}
              >
                History
              </Button>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 'medium'
                  }}
                >
                  {user.agent ? getInitials(user.agent.name) : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    }
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem sx={{ pointerEvents: 'none' }}>
                  <Typography variant="body2" color="textSecondary">
                    Signed in as
                  </Typography>
                </MenuItem>
                <MenuItem sx={{ pointerEvents: 'none' }}>
                  <Typography variant="body1" fontWeight="bold">
                    {user.agent?.name}
                  </Typography>
                </MenuItem>
                <MenuItem sx={{ pointerEvents: 'none' }}>
                  <Typography variant="body2" color="textSecondary">
                    {user.agent?.department}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate('/')}>
                  <ListItemIcon>
                    <SentimentSatisfiedAltIcon fontSize="small" />
                  </ListItemIcon>
                  Sentiment Analysis
                </MenuItem>
                <MenuItem onClick={() => navigate('/history')}>
                  <ListItemIcon>
                    <HistoryIcon fontSize="small" />
                  </ListItemIcon>
                  Analysis History
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          null
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
