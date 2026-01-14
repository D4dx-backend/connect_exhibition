# ConnectPlus - Setup & Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory by copying the example:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/connectplus
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connectplus

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=24h

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**Important:** 
- Replace `JWT_SECRET` with a strong random string (minimum 32 characters)
- Update `MONGODB_URI` with your actual MongoDB connection string

### 4. Create Upload Directories
```bash
mkdir -p uploads/images uploads/audio uploads/video uploads/documents
```

### 5. Start Backend Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The backend server will start on `http://localhost:5000`

### 6. Verify Backend is Running
Open your browser and visit:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "ConnectPlus API is running",
  "timestamp": "2026-01-09T..."
}
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=ConnectPlus
```

**Important:** 
- If your backend is running on a different port or domain, update `REACT_APP_API_URL` accordingly

### 4. Start Frontend Development Server
```bash
npm start
```

The application will open automatically at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

---

## Database Setup

### Option 1: Local MongoDB

1. **Install MongoDB** on your machine
2. **Start MongoDB Service:**
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account:** Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster:** Follow the setup wizard
3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Update `.env` file with this connection string

---

## Create Admin User

### Method 1: Direct Database Insert

```javascript
// Run this in MongoDB shell (mongosh)
use connectplus

db.users.insertOne({
  name: "Admin User",
  email: "admin@connectplus.com",
  password: "$2a$10$X7KvHLjkT8F5d8P9E6G3aO7YuGb8BvP5Q2w1xZ8nM9k4jL6tR3sD2", // "admin123"
  role: "admin",
  isActive: true,
  bookmarkedBooths: [],
  visitedBooths: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Method 2: Register via API

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@connectplus.com",
    "password": "admin123"
  }'
```

Then update the user role in database:
```javascript
db.users.updateOne(
  { email: "admin@connectplus.com" },
  { $set: { role: "admin" } }
)
```

---

## Seeding Sample Data (Optional)

Create a seed script `backend/seed.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Booth = require('./models/Booth');

const sampleBooths = [
  {
    name: "Tech Innovations",
    title: "Latest in Technology",
    description: "<h2>Welcome to Tech Innovations</h2><p>Discover the latest technology trends.</p>",
    logo: "/uploads/images/tech-logo.png",
    isPublished: true,
    order: 1
  },
  // Add more sample data...
];

const seedDB = async () => {
  try {
    await connectDB();
    await Booth.deleteMany({});
    await Booth.insertMany(sampleBooths);
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
```

Run the seed script:
```bash
node seed.js
```

---

## Testing the Application

### 1. Access Frontend
Open browser and navigate to:
```
http://localhost:3000
```

### 2. Test User Flow
1. **Register** a new account at `/register`
2. **Login** with your credentials at `/login`
3. **Explore Booths** at `/booths`
4. **Take Quiz** at `/quiz`
5. **Submit Feedback** at `/feedback`
6. **View Notifications** at `/notifications`

### 3. Test Admin Panel
1. **Login** as admin user
2. **Access Admin Panel** at `/admin`
3. **Manage Content** through admin interface

---

## Deployment

### Backend Deployment (Railway/Render)

1. **Create Account** on [Railway](https://railway.app) or [Render](https://render.com)
2. **Connect Repository** or upload code
3. **Set Environment Variables** in deployment settings
4. **Deploy** and note the API URL

### Frontend Deployment (Vercel/Netlify)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Or deploy to Netlify:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

4. **Update Environment Variables** on deployment platform:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running and connection string is correct

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill the process using port 5000

### Frontend Issues

**API Connection Error:**
```
Network Error / CORS Error
```
**Solution:** 
- Verify backend is running
- Check `REACT_APP_API_URL` in `.env`
- Ensure CORS is configured correctly in backend

**Build Errors:**
```
Module not found
```
**Solution:** Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Running Both Servers Concurrently

You can run both backend and frontend from the root directory:

Create `package.json` in root:
```json
{
  "name": "connectplus",
  "scripts": {
    "install-all": "cd backend && npm install && cd ../frontend && npm install",
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\"",
    "backend": "cd backend && npm run dev",
    "frontend": "cd frontend && npm start"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Install and run:
```bash
npm install
npm run dev
```

---

## API Documentation

Once backend is running, access API endpoints at:

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Booths
- GET `/api/booths` - Get all booths
- GET `/api/booths/:id` - Get booth details
- POST `/api/booths` - Create booth (Admin)
- POST `/api/booths/:id/bookmark` - Toggle bookmark

### Quiz
- GET `/api/quiz/questions` - Get quiz questions
- POST `/api/quiz/submit` - Submit quiz
- GET `/api/quiz/leaderboard` - Get leaderboard

### Feedback
- POST `/api/feedback` - Submit feedback
- GET `/api/feedback/stats` - Get statistics (Admin)

### Notifications
- GET `/api/notifications` - Get all notifications
- POST `/api/notifications` - Create notification (Admin)

---

## Support

For issues or questions:
- Check the [Functional Requirements](FUNCTIONAL_REQUIREMENTS.md) document
- Review error logs in console
- Ensure all dependencies are installed correctly

---

## License

MIT License - See LICENSE file for details
