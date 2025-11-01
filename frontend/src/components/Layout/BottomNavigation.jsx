import React from 'react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Bottom navigation component (similar to TaskPlanet)
 */
const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Don't show on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const getValue = () => {
    if (location.pathname === '/feed') return 0;
    if (location.pathname === '/profile') return 1;
    return -1;
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <MuiBottomNavigation
        value={getValue()}
        onChange={(event, newValue) => {
          if (newValue === 0) navigate('/feed');
          if (newValue === 1) {
            if (isAuthenticated) {
              navigate('/profile');
            } else {
              navigate('/login');
            }
          }
        }}
        showLabels
      >
        <BottomNavigationAction label="Feed" icon={<HomeIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;

