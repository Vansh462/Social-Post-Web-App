import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloseIcon from '@mui/icons-material/Close';
import { postAPI } from '../../services/api.js';

/**
 * Component for creating a new post
 * @param {Function} onPostCreated - Callback when post is created successfully
 */
const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      // Clear video if image is selected
      setVideo(null);
      setVideoPreview(null);
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB instead of 20MB
        setError('Video size must be less than 15MB for best performance. Large videos may fail to upload.');
        return;
      }
      // Warn for large files
      if (file.size > 10 * 1024 * 1024) {
        setError(`Large video detected (${(file.size / 1024 / 1024).toFixed(2)}MB). This may take a while...`);
      }
      
      // Clear image if video is selected
      setImage(null);
      setImagePreview(null);
      setVideo(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
        setError(''); // Clear error after preview loads
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !image && !video) {
      setError('Please add text, an image, or a video');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (text.trim()) {
        formData.append('text', text.trim());
      }
      if (image) {
        formData.append('image', image);
      }
      if (video) {
        formData.append('video', video);
        // Show message for video upload
        if (video.size > 5 * 1024 * 1024) {
          setError(`Uploading video (${(video.size / 1024 / 1024).toFixed(2)}MB). Please wait...`);
        }
      }

      // Add timeout for video uploads
      const uploadPromise = postAPI.createPost(formData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout. The video may be too large.')), 60000) // 60 second timeout
      );

      await Promise.race([uploadPromise, timeoutPromise]);
      
      // Reset form
      setText('');
      setImage(null);
      setVideo(null);
      setImagePreview(null);
      setVideoPreview(null);
      setError('');
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      if (err.message === 'Upload timeout. The video may be too large.') {
        setError('Upload timed out. Please try a smaller video file (under 15MB recommended).');
      } else {
        setError(err.response?.data?.message || 'Failed to create post. If uploading a video, try a smaller file.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Create Post
      </Typography>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {imagePreview && (
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: 1
              }}
            />
            <IconButton
              onClick={removeImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {videoPreview && (
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Box
              component="video"
              src={videoPreview}
              controls
              sx={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: 1
              }}
            />
            <IconButton
              onClick={removeVideo}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              disabled={loading}
            >
              Photo
            </Button>
          </label>

          <input
            accept="video/*"
            style={{ display: 'none' }}
            id="video-upload"
            type="file"
            onChange={handleVideoChange}
          />
          <label htmlFor="video-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<VideocamIcon />}
              disabled={loading}
              color="secondary"
            >
              Video
            </Button>
          </label>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (!text.trim() && !image && !video)}
            sx={{ ml: 'auto' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Post'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;

