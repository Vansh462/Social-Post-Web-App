# Social Post Web Application

A full-stack social media application where users can create accounts, share posts with text and images, view a public feed, and interact with posts through likes and comments.

## Features

- ✅ User authentication (Signup & Login)
- ✅ Create posts with text, images, or both
- ✅ Public feed displaying all posts
- ✅ Like and unlike posts
- ✅ Comment on posts
- ✅ Responsive UI with Material UI
- ✅ Pagination for posts
- ✅ Real-time updates for likes and comments

## Tech Stack

### Frontend
- React.js with Vite
- Material UI (MUI) for styling
- React Router for navigation
- Axios for API calls
- Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for image uploads
- Bcrypt for password hashing

## Project Structure

```
Social-Post-Web-App/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React Context providers
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Social-Post-Web-App
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

   Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the `frontend` directory (optional, defaults to localhost):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

   Start the frontend development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
  - Body: `{ email, password, username }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`

### Posts
- `GET /api/posts` - Get all posts (with pagination)
  - Query params: `page`, `limit`
- `POST /api/posts` - Create a new post (Protected)
  - Body: FormData with `text` (optional) and `image` (optional file)
- `POST /api/posts/:id/like` - Like/unlike a post (Protected)
- `POST /api/posts/:id/comment` - Add a comment (Protected)
  - Body: `{ text }`

### Users
- `GET /api/users/me` - Get current user info (Protected)

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  username: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  username: String,
  text: String (optional),
  imageUrl: String (optional),
  likes: [{ userId, username }],
  comments: [{ userId, username, text, createdAt }],
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.com/api`

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your secret key
   - `PORT`: 10000 (or as required by Render)
   - `NODE_ENV`: production

### Database (MongoDB Atlas)

1. Create a free cluster on MongoDB Atlas
2. Get your connection string
3. Update `MONGODB_URI` in your backend `.env` file
4. Whitelist your IP address (or use 0.0.0.0/0 for development)

## Important Notes

- **Media Storage**: Images and videos are stored as base64 strings in MongoDB (MVP approach)
  - Image limit: 10MB | Video limit: 20MB
  - Large videos may experience slow upload times due to base64 conversion
- **Authentication**: JWT tokens stored in localStorage; passwords hashed with bcrypt
- **Security**: CORS enabled; protected routes require JWT authentication
- **Features**: Posts support text, images, videos, or combinations
- **Filters**: Users can view "All Posts" or "My Posts"
- **Sharing**: Share posts to social media platforms or copy link
- **UI**: Modern design with Poppins/Inter fonts and optimistic updates

## Future Enhancements

- Image optimization and cloud storage (AWS S3, Cloudinary)
- Real-time updates using WebSockets
- User profiles with custom avatars
- Post editing and deletion
- Search functionality
- Follow/unfollow users
- Notifications system

## License

This project is open source and available under the MIT License.

