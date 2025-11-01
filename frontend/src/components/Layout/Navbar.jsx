import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

/**
 * Modern Navigation bar component with logo
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        color: '#1a1a1a',
        boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar sx={{ py: 1, px: { xs: 2, sm: 3 } }}>
        {/* Logo Section */}
        <Box
          onClick={() => navigate('/feed')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            flexGrow: { xs: 1, sm: 0 },
            '&:hover': {
              opacity: 0.8,
            },
            transition: 'opacity 0.2s',
          }}
        >
          {/* Logo Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <ChatBubbleOutlineIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>

          {/* Logo Text */}
          <Typography
            variant="h5"
            component="div"
            className="logo-gradient"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Social Posts
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* User Actions */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              {user?.username}
            </Typography>

            {/* Avatar Menu */}
            <IconButton
              onClick={handleMenuClick}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'transparent',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.08)',
                },
              }}
            >
              <MenuItem onClick={handleProfileClick}>
                <AccountCircleIcon sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              onClick={() => navigate('/login')}
              variant="outlined"
              startIcon={<LoginIcon />}
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                borderColor: 'rgba(99, 102, 241, 0.3)',
                color: 'primary.main',
                fontWeight: 500,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              variant="contained"
              startIcon={<PersonAddIcon />}
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                fontWeight: 500,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

