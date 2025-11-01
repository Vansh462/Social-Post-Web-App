import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants.js';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('social_post_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data)
};

// User API calls
export const userAPI = {
  getCurrentUser: () => api.get('/users/me')
};

// Post API calls
export const postAPI = {
  getAllPosts: (page = 1, limit = 20, userId = null) => {
    const params = new URLSearchParams({ page, limit });
    if (userId) params.append('userId', userId);
    return api.get(`/posts?${params.toString()}`);
  },
  createPost: (formData) => api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000 // 2 minute timeout for video uploads
  }),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  commentOnPost: (postId, text) => api.post(`/posts/${postId}/comment`, { text })
};

export default api;

