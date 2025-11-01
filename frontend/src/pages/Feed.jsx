import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Paper
} from '@mui/material';
import { postAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import CreatePost from '../components/Post/CreatePost.jsx';
import PostCard from '../components/Post/PostCard.jsx';
import { POSTS_PER_PAGE } from '../utils/constants.js';

/**
 * Feed page component displaying all posts
 */
const Feed = () => {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'my'

  // Fetch posts
  const fetchPosts = async (pageNum = 1, append = false, filterType = filter) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      // Get userId if filtering by my posts
      const userId = filterType === 'my' && user?.id ? user.id : null;
      const response = await postAPI.getAllPosts(pageNum, POSTS_PER_PAGE, userId);
      const { posts: newPosts, pagination } = response.data;

      if (append) {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(pagination.hasNextPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    if (isAuthenticated) {
      setPage(1);
      fetchPosts(1, false, filter);
    }
  }, [filter]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true, filter);
  };

  const handlePostCreated = () => {
    setPage(1);
    fetchPosts(1, false, filter);
  };

  const handlePostUpdate = (postId, updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => 
        post._id === postId ? { ...updatedPost } : post
      )
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
      pb: 12
    }}>
      <Container maxWidth="md">
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filter Toggle - Only show if authenticated */}
        {isAuthenticated && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 1.5, 
              mb: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              aria-label="post filter"
              size="small"
            >
              <ToggleButton value="all" aria-label="all posts">
                All Posts
              </ToggleButton>
              <ToggleButton value="my" aria-label="my posts">
                My Posts
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        )}

        {/* Create post section */}
        {isAuthenticated && (
          <Box sx={{ mb: 3 }}>
            <CreatePost onPostCreated={handlePostCreated} />
          </Box>
        )}

        {/* Posts list */}
        {posts.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {filter === 'my' ? 'You haven\'t posted anything yet' : 'No posts yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filter === 'my' ? 'Create your first post!' : 'Be the first to share something!'}
            </Typography>
          </Box>
        ) : (
          <>
            {posts.map((post, index) => (
              <Box 
                key={post._id} 
                className="post-card"
                sx={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeIn 0.3s ease-in'
                }}
              >
                <PostCard 
                  post={post} 
                  onUpdate={handlePostUpdate} 
                  postId={post._id}
                />
              </Box>
            ))}

            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  {loadingMore ? <CircularProgress size={24} /> : 'Load More Posts'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Feed;

