require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const boothRoutes = require('./routes/booths');
const quizRoutes = require('./routes/quiz');
const quizConfigRoutes = require('./routes/quizConfig');
const feedbackRoutes = require('./routes/feedback');
const notificationRoutes = require('./routes/notifications');
const programRoutes = require('./routes/programs');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/booths', boothRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/quiz-config', quizConfigRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/programs', programRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Connecta API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║       Connecta API Server                         ║
║                                                   ║
║   🚀 Server running on port ${PORT}                 ║
║   📝 Environment: ${process.env.NODE_ENV || 'development'}                  ║
║   🗄️  Database: MongoDB                           ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
