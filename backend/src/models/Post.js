import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'Post text cannot exceed 2000 characters']
    },
    imageUrl: {
      type: String,
      trim: true
    },
    videoUrl: {
      type: String,
      trim: true
    },
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        username: {
          type: String,
          required: true
        }
      }
    ],
    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

// Validate that at least text or imageUrl is provided
postSchema.pre('validate', function (next) {
  const hasText = this.text && this.text.trim().length > 0;
  const hasImage = this.imageUrl && this.imageUrl.trim().length > 0;
  const hasVideo = this.videoUrl && this.videoUrl.trim().length > 0;
  
  if (!hasText && !hasImage && !hasVideo) {
    this.invalidate('text', 'Either text, image, or video is required');
    this.invalidate('imageUrl', 'Either text, image, or video is required');
    this.invalidate('videoUrl', 'Either text, image, or video is required');
  }
  next();
});

// Index for efficient querying
postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;

