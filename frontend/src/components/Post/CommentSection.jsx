import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { postAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Component for displaying and adding comments on a post
 * @param {Object} post - Post object
 * @param {Function} onCommentAdded - Callback when comment is added
 */
const CommentSection = ({ post, onCommentAdded }) => {
  const { isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await postAPI.commentOnPost(post._id, commentText);
      const newComment = response.data.comment;
      setCommentText('');
      if (onCommentAdded) {
        onCommentAdded(newComment); // Pass the new comment
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Please login to comment
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Comments ({post.comments?.length || 0})
      </Typography>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      {/* Add comment form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
            setError('');
          }}
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={loading || !commentText.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Comment'}
        </Button>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Display comments */}
      {post.comments && post.comments.length > 0 ? (
        <Box>
          {post.comments.map((comment, index) => (
            <Paper key={index} elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {comment.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {comment.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Box>
  );
};

export default CommentSection;

