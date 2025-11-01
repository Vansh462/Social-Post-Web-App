import Post from '../models/Post.js';
import User from '../models/User.js';
import { bufferToBase64 } from '../utils/upload.js';

/**
 * Create a new post
 * @route POST /api/posts
 * @access Private
 */
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let imageUrl = null;
    let videoUrl = null;

    // Handle image or video upload - files will be in req.files object
    if (req.files) {
      // Handle image
      if (req.files.image && req.files.image[0]) {
        const imageFile = req.files.image[0];
        if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit for images
          return res.status(400).json({ message: 'Image size must be less than 10MB' });
        }
        imageUrl = bufferToBase64(imageFile.buffer, imageFile.mimetype);
      }
      
      // Handle video
      if (req.files.video && req.files.video[0]) {
        const videoFile = req.files.video[0];
        // More aggressive limit for videos (20MB) since base64 increases size
        if (videoFile.size > 20 * 1024 * 1024) {
          return res.status(400).json({ 
            message: 'Video size must be less than 20MB. Large videos may take longer to upload.' 
          });
        }
        
        // Warn if video is large but proceed
        if (videoFile.size > 10 * 1024 * 1024) {
          console.log(`Processing large video: ${(videoFile.size / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // Convert video to base64 (this might take time for large files)
        try {
          videoUrl = bufferToBase64(videoFile.buffer, videoFile.mimetype);
        } catch (error) {
          console.error('Error converting video to base64:', error);
          return res.status(500).json({ 
            message: 'Error processing video. Please try a smaller file or different format.' 
          });
        }
      }
    }

    // Validate that at least one field is provided
    const textValue = text ? text.trim() : '';
    if (!textValue && !imageUrl && !videoUrl) {
      return res.status(400).json({ message: 'Either text, image, or video is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = new Post({
      userId: req.user.id,
      username: user.username,
      text: textValue || '',
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || ''
    });

    await post.save();

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Handle MongoDB document size limit (16MB)
    if (error.message && error.message.includes('maximum document size')) {
      return res.status(400).json({ 
        message: 'File too large. Please use a smaller video file (max 15MB recommended).' 
      });
    }
    res.status(500).json({ 
      message: 'Server error while creating post. If uploading a video, try a smaller file.' 
    });
  }
};

/**
 * Get all posts with pagination
 * @route GET /api/posts
 * @access Public
 */
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const userId = req.query.userId; // Add filter for user posts

    // Build query
    const query = userId ? { userId } : {};

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    // Get posts sorted by newest first
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email')
      .lean();

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

/**
 * Like or unlike a post
 * @route POST /api/posts/:id/like
 * @access Private
 */
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.findIndex(
      like => like.userId.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      // Unlike: remove from likes array
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.json({
        message: 'Post unliked',
        post,
        liked: false
      });
    } else {
      // Like: add to likes array
      post.likes.push({
        userId: userId,
        username: user.username
      });
      await post.save();
      return res.json({
        message: 'Post liked',
        post,
        liked: true
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error while liking post' });
  }
};

/**
 * Add a comment to a post
 * @route POST /api/posts/:id/comment
 * @access Private
 */
export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.user.id;

    // Validation
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add comment
    post.comments.push({
      userId: userId,
      username: user.username,
      text: text.trim()
    });

    await post.save();

    // Get the last comment (the one we just added)
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
      post
    });
  } catch (error) {
    console.error('Comment on post error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

export default { createPost, getAllPosts, likePost, commentOnPost };

