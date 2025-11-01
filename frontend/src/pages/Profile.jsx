import React from 'react';
import { Container, Paper, Typography, Box, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * User profile page
 */
const Profile = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'primary.main',
            mx: 'auto',
            mb: 2,
            fontSize: '3rem'
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" gutterBottom>
          {user?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;

