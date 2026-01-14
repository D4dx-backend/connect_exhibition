const QuizConfig = require('../models/QuizConfig');
const moment = require('moment-timezone');

// Check if quiz is available based on date and time restrictions
exports.checkQuizAvailability = async (req, res, next) => {
  try {
    // Get active quiz config
    const config = await QuizConfig.findOne({ isActive: true });
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'No active quiz available at the moment'
      });
    }
    
    const now = moment().tz(config.timezone);
    const startDate = moment(config.startDate).tz(config.timezone).startOf('day');
    const endDate = moment(config.endDate).tz(config.timezone).endOf('day');
    
    // Check if quiz period is active
    if (now.isBefore(startDate)) {
      return res.status(400).json({
        success: false,
        message: `Quiz starts on ${startDate.format('MMMM D, YYYY')}`,
        startsAt: startDate.toISOString()
      });
    }
    
    if (now.isAfter(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz period has ended',
        endedAt: endDate.toISOString()
      });
    }
    
    // Check daily time window
    const [startHour, startMin] = config.dailyStartTime.split(':').map(Number);
    const [endHour, endMin] = config.dailyEndTime.split(':').map(Number);
    
    const dailyStart = now.clone().hour(startHour).minute(startMin).second(0);
    const dailyEnd = now.clone().hour(endHour).minute(endMin).second(59);
    
    if (now.isBefore(dailyStart)) {
      return res.status(400).json({
        success: false,
        message: `Quiz is available from ${config.dailyStartTime} to ${config.dailyEndTime} IST`,
        availableAt: dailyStart.toISOString()
      });
    }
    
    if (now.isAfter(dailyEnd)) {
      const nextDay = dailyStart.clone().add(1, 'day');
      return res.status(400).json({
        success: false,
        message: `Today's quiz time has ended. Come back tomorrow at ${config.dailyStartTime} IST`,
        availableAt: nextDay.toISOString()
      });
    }
    
    // Attach config to request
    req.quizConfig = config;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if mobile has already attempted today
exports.checkDailyAttempt = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return next(); // Skip check if no mobile provided (registered user)
    }
    
    const QuizAttempt = require('../models/QuizAttempt');
    const config = req.quizConfig;
    
    const now = moment().tz(config.timezone);
    const todayStart = now.clone().startOf('day');
    const todayEnd = now.clone().endOf('day');
    
    // Check for existing attempt today
    const existingAttempt = await QuizAttempt.findOne({
      mobile: mobile,
      attemptDate: {
        $gte: todayStart.toDate(),
        $lte: todayEnd.toDate()
      }
    });
    
    if (existingAttempt) {
      const [startHour, startMin] = config.dailyStartTime.split(':').map(Number);
      const nextDay = now.clone().add(1, 'day').hour(startHour).minute(startMin).second(0);
      
      return res.status(400).json({
        success: false,
        message: 'You have already completed today\'s quiz. Please try again tomorrow!',
        nextAttemptAt: nextDay.toISOString(),
        previousScore: existingAttempt.score,
        previousCorrect: existingAttempt.correctAnswers
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
