import express from 'express';
import {
  createPost,
  getAllPosts,
  likePost,
  commentOnPost
} from '../controllers/postController.js';
import authenticate from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination
 * @access  Public
 */
router.get('/', getAllPosts);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
// Accept either 'image' or 'video' field
router.post('/', authenticate, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), createPost);

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like or unlike a post
 * @access  Private
 */
router.post('/:id/like', authenticate, likePost);

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post('/:id/comment', authenticate, commentOnPost);

export default router;

