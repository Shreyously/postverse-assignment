# Postverse---Zylentrix Assignment

Postverse is a modern web application that allows users to create, share, and discover posts in a beautiful minimalist platform designed for content creators.

## Features

- 🔐 **User Authentication**
  - Secure signup and login functionality
  - JWT-based authentication
  - Protected routes for authenticated users

- 📝 **Post Management**
  - Create, read, update, and delete posts
  - Rich text content support
  - Image upload capability
  - Filter between all posts and personal posts

- 🎨 **Modern UI/UX**
  - Responsive design for all devices
  - Clean and minimalist interface
  - Smooth transitions and animations
  - Loading states and error handling
  - Toast notifications for user feedback

- 📱 **Advanced Features**
  - Pagination support
  - Image optimization and cloud storage
  - Real-time updates
  - Mobile-friendly navigation

## Tech Stack

- **Frontend**
  - React
  - TypeScript
  - TanStack Query (React Query)
  - React Router DOM
  - Tailwind CSS
  - Shadcn/ui Components
  - Axios

- **Backend**
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication
  - Cloudinary (Image Storage)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/postverse.git
cd postverse
```

2. Install dependencies for both frontend and backend
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# Backend (.env)
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm run dev
```

## Usage

1. Create an account or log in
2. Browse posts from all users
3. Create your own posts with text and optional images
4. Filter between all posts and your own posts
5. Edit or delete your posts
6. View individual posts in detail

## API Endpoints

- **Auth**
  - `POST /api/signup` - Create a new user account
  - `POST /api/login` - Authenticate user and get token

- **Posts**
  - `GET /api/posts` - Get all posts (with pagination)
  - `GET /api/posts/:id` - Get a specific post
  - `POST /api/posts` - Create a new post
  - `PUT /api/posts/:id` - Update a post
  - `DELETE /api/posts/:id` - Delete a post

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
