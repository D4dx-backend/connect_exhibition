# ConnectPlus - Exhibition Management Application

A comprehensive Progressive Web App (PWA) for managing exhibitions with multiple stalls, quizzes, feedback, and notifications.

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- TailwindCSS for styling
- PWA capabilities
- Mobile-first responsive design

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Express Validator

### CMS Features
- Content management for booths
- Quiz management
- Feedback analytics
- Notification system

## Project Structure

```
connectPlus/
├── backend/              # Node.js backend
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # File uploads directory
│   └── server.js        # Entry point
│
└── frontend/            # React frontend
    ├── public/          # Static files & PWA assets
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── services/    # API services
    │   ├── context/     # Context providers
    │   ├── utils/       # Utility functions
    │   └── App.js       # Main app component
    └── package.json
```

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your MongoDB URL to .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `.env` file in backend directory:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Features

### 1. Exhibitor/Booth Module
- Display multiple exhibition booths
- Each booth with logo and name
- Detailed view: title, HTML description, audio, video
- Multiple resource links
- Bookmark functionality
- Mark as visited
- Easy navigation between booths

### 2. Quiz Module
- Daily quiz competitions
- 10 random questions per attempt
- One question from each booth
- Time tracking
- Scoring system
- Daily leaderboard
- Winners based on highest marks in least time

### 3. Feedback Module
- Text feedback submission
- Star rating (1-5 stars)
- Multiple categories:
  - Overall Quality
  - Digital Presence
  - Facilities
- Feedback analytics for admin

### 4. Information/Notifications Module
- Display board for announcements
- Real-time notifications
- Admin-managed content

## API Documentation

Base URL: `http://localhost:5000/api`

### Booth APIs
- GET `/booths` - Get all booths
- GET `/booths/:id` - Get booth details
- POST `/booths` - Create booth (Admin)
- PUT `/booths/:id` - Update booth (Admin)
- POST `/booths/:id/bookmark` - Toggle bookmark
- POST `/booths/:id/visit` - Mark as visited

### Quiz APIs
- GET `/quiz/booths/:boothId` - Get questions for booth
- POST `/quiz/attempt` - Submit quiz attempt
- GET `/quiz/leaderboard` - Get daily leaderboard

### Feedback APIs
- POST `/feedback` - Submit feedback
- GET `/feedback` - Get all feedback (Admin)
- GET `/feedback/stats` - Get feedback statistics

### Notification APIs
- GET `/notifications` - Get all notifications
- POST `/notifications` - Create notification (Admin)

## License

MIT
