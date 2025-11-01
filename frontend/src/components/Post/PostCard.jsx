import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Avatar,
  Divider,
  Collapse,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import { postAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import CommentSection from './CommentSection.jsx';

/**
 * Component for displaying a single post card
 * @param {Object} post - Post object
 * @param {Function} onUpdate - Callback when post is updated (like/comment)
 */
const PostCard = ({ post, onUpdate, postId }) => {
  const { isAuthenticated, user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const isUpdatingRef = useRef(false); // Track if we're currently updating
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const openShareMenu = Boolean(shareAnchorEl);

  // Use localPost instead of post
  const isLiked = localPost.likes?.some(
    like => {
      const likeUserId = like.userId?.toString() || like.userId;
      const currentUserId = user?.id?.toString() || user?.id;
      return likeUserId === currentUserId;
    }
  );

  const handleLike = async () => {
    if (!isAuthenticated || loading) {
      return;
    }

    setLoading(true);
    isUpdatingRef.current = true; // Mark that we're updating
    
    // Store original state for rollback
    const originalPost = { ...localPost };
    
    // Optimistic update
    const currentUserId = user?.id?.toString() || user?.id;
    const likeIndex = localPost.likes?.findIndex(
      like => {
        const likeUserId = like.userId?.toString() || like.userId;
        return likeUserId === currentUserId;
      }
    ) ?? -1;

    let updatedPost = { ...localPost };
    if (likeIndex > -1) {
      // Unlike
      updatedPost.likes = localPost.likes.filter((_, index) => index !== likeIndex);
    } else {
      // Like
      updatedPost.likes = [
        ...(localPost.likes || []),
        { userId: user.id, username: user.username }
      ];
    }
    
    // Apply optimistic update immediately
    setLocalPost(updatedPost);
    
    try {
      const response = await postAPI.likePost(post._id);
      // Only update with server response, don't call onUpdate during optimistic update
      const serverPost = response.data.post;
      setLocalPost(serverPost);
      
      // Update parent only after server confirms
      if (onUpdate) {
        onUpdate(postId, serverPost);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      setLocalPost(originalPost);
      setSnackbar({ open: true, message: 'Failed to update like. Please try again.' });
    } finally {
      setLoading(false);
      // Use setTimeout to allow state to settle before allowing prop updates
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  };

  const handleCommentAdded = (newComment) => {
    // Optimistic update for comment
    const updatedPost = {
      ...localPost,
      comments: [...(localPost.comments || []), newComment]
    };
    setLocalPost(updatedPost);
    if (onUpdate) {
      onUpdate(postId, updatedPost);
    }
  };

  const handleShare = (platform) => {
    const postUrl = `${window.location.origin}/feed`;
    const postText = localPost.text || 'Check out this post!';
    
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(postText + ' ' + postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        setSnackbar({ open: true, message: 'Link copied to clipboard!' });
        setShareAnchorEl(null);
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShareAnchorEl(null);
  };

  // Only sync from props when post ID changes (new post) or when explicitly needed
  useEffect(() => {
    // Reset local state if we got a completely new post (different ID)
    if (post._id !== localPost._id) {
      setLocalPost(post);
    }
  }, [post._id]); // Only depend on post ID, not the entire post object

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: 4
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Post header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                mr: 1.5,
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {localPost.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {localPost.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(localPost.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5, mx: -3 }} />

          {/* Post text */}
          {localPost.text && (
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2, 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                color: 'text.primary'
              }}
            >
              {localPost.text}
            </Typography>
          )}

          {/* Post image */}
          {localPost.imageUrl && (
            <CardMedia
              component="img"
              image={localPost.imageUrl}
              alt="Post image"
              sx={{
                maxHeight: '500px',
                objectFit: 'contain',
                borderRadius: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
          )}

          {/* Post video */}
          {localPost.videoUrl && (
            <Box
              component="video"
              src={localPost.videoUrl}
              controls
              sx={{
                width: '100%',
                maxHeight: '500px',
                borderRadius: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                onClick={handleLike}
                disabled={!isAuthenticated || loading}
                color={isLiked ? 'error' : 'default'}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {localPost.likes?.length || 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                onClick={() => setShowComments(!showComments)}
                disabled={!isAuthenticated}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <CommentIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {localPost.comments?.length || 0}
              </Typography>
            </Box>

            {/* Share button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <IconButton
                onClick={(e) => setShareAnchorEl(e.currentTarget)}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <ShareIcon />
              </IconButton>
              
              <Menu
                anchorEl={shareAnchorEl}
                open={openShareMenu}
                onClose={() => setShareAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <MenuItem onClick={() => handleShare('facebook')}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share on Facebook</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleShare('twitter')}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share on Twitter</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleShare('whatsapp')}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share on WhatsApp</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleShare('linkedin')}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share on LinkedIn</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleShare('copy')}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Copy Link</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </CardContent>

        {/* Comments section */}
        <Collapse in={showComments}>
          <Divider />
          <CommentSection 
            post={localPost} 
            onCommentAdded={handleCommentAdded} 
          />
        </Collapse>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error">{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default PostCard;

