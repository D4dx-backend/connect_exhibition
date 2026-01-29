const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Booth = require('../models/Booth');
require('../models/GuestUser');

// @desc    Get random quiz questions (1 from each booth)
// @route   GET /api/quiz/questions
// @access  Private
exports.getQuizQuestions = async (req, res, next) => {
  try {
    // Get all published booths
    const booths = await Booth.find({ isPublished: true })
      .select('name')
      .lean();

    if (booths.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No published booths available for quiz'
      });
    }

    const boothMap = new Map(booths.map(booth => [booth._id.toString(), booth]));
    const boothIds = booths.map(booth => booth._id);

    const activeQuestions = await Question.find({
      booth: { $in: boothIds },
      isActive: true
    }).lean();

    if (activeQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active questions available for quiz'
      });
    }

    const questionsByBooth = new Map();
    activeQuestions.forEach(question => {
      const boothId = question.booth.toString();
      if (!questionsByBooth.has(boothId)) {
        questionsByBooth.set(boothId, []);
      }
      questionsByBooth.get(boothId).push(question);
    });

    const questions = [];

    // Pick one random question from each booth that has questions
    for (const [boothId, boothQuestions] of questionsByBooth.entries()) {
      const booth = boothMap.get(boothId);
      if (!booth) {
        continue;
      }

      const randomIndex = Math.floor(Math.random() * boothQuestions.length);
      const selectedQuestion = boothQuestions[randomIndex];

      // Remove isCorrect flag from options before sending
      const sanitizedQuestion = {
        _id: selectedQuestion._id,
        booth: selectedQuestion.booth,
        boothName: booth.name,
        question: selectedQuestion.question,
        options: selectedQuestion.options.map((opt, index) => ({
          index,
          text: opt.text
        })),
        points: selectedQuestion.points
      };

      questions.push(sanitizedQuestion);
    }

    // Shuffle and cap at 10 questions (one per booth)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    const finalQuestions = questions.slice(0, 10);

    res.status(200).json({
      success: true,
      count: finalQuestions.length,
      data: finalQuestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quiz/submit
// @access  Public (with middleware checks)
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, totalTime, guestData } = req.body;
    const userId = req.user?.id; // Optional for guests

    if (!answers || answers.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz submission. 10 answers required'
      });
    }

    // Determine user type
    let userType, attemptUserId, guestUserId, mobile;
    
    if (userId) {
      // Registered user
      userType = 'registered';
      attemptUserId = userId;
    } else if (guestData) {
      // Guest user
      const { name, age, mobile: guestMobile, place } = guestData;
      
      if (!name || !age || !guestMobile || !place) {
        return res.status(400).json({
          success: false,
          message: 'Guest data incomplete. Name, age, mobile, and place are required'
        });
      }
      
      userType = 'guest';
      mobile = guestMobile;
      
      // Find or create guest user
      const GuestUser = require('../models/GuestUser');
      let guestUser = await GuestUser.findOne({ mobile: guestMobile });
      
      if (!guestUser) {
        guestUser = await GuestUser.create({ name, age, mobile: guestMobile, place });
      }
      
      guestUser.totalAttempts += 1;
      guestUser.lastAttemptDate = new Date();
      await guestUser.save();
      
      guestUserId = guestUser._id;
    } else {
      return res.status(400).json({
        success: false,
        message: 'User authentication or guest data required'
      });
    }

    let correctAnswers = 0;
    let totalScore = 0;
    const processedAnswers = [];

    // Process each answer
    for (const answer of answers) {
      const question = await Question.findById(answer.questionId);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: `Question ${answer.questionId} not found`
        });
      }

      const isCorrect = question.options[answer.selectedOption]?.isCorrect || false;

      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points;
      }

      processedAnswers.push({
        question: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeTaken: answer.timeTaken || 0
      });
    }

    // Create quiz attempt
    const attemptData = {
      userType,
      answers: processedAnswers,
      totalQuestions: 10,
      correctAnswers,
      score: totalScore,
      totalTime,
      attemptDate: Date.now()
    };
    
    if (userType === 'registered') {
      attemptData.user = attemptUserId;
    } else {
      attemptData.guestUser = guestUserId;
      attemptData.mobile = mobile;
    }
    
    const quizAttempt = await QuizAttempt.create(attemptData);

    // Populate details
    await quizAttempt.populate('answers.question');
    if (userType === 'guest') {
      await quizAttempt.populate('guestUser', 'name age place mobile');
    }

    res.status(201).json({
      success: true,
      data: quizAttempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily leaderboard
// @route   GET /api/quiz/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { date } = req.query;

    // Get start and end of the day
    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all attempts for the day, sorted by score and time
    const attempts = await QuizAttempt.find({
      attemptDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .sort({ score: -1, totalTime: 1 })
      .limit(50)
      .populate('user', 'name email avatar')
      .populate('guestUser', 'name mobile place age');

    // Get best attempt per user/guest
    const userBestAttempts = {};
    attempts.forEach(attempt => {
      const identifier = attempt.userType === 'registered' 
        ? attempt.user?._id.toString()
        : attempt.mobile;
      if (!userBestAttempts[identifier]) {
        userBestAttempts[identifier] = attempt;
      }
    });

    // Convert to array and add rank
    const leaderboard = Object.values(userBestAttempts).map((attempt, index) => ({
      rank: index + 1,
      user: attempt.user,
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalTime: attempt.totalTime,
      percentage: attempt.percentage,
      attemptDate: attempt.attemptDate
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user quiz history
// @route   GET /api/quiz/history
// @access  Private
exports.getQuizHistory = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .sort({ attemptDate: -1 })
      .populate('answers.question');

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create question (Admin)
// @route   POST /api/quiz/questions
// @access  Private/Admin
// @desc    Get all questions with optional booth filter (Admin)
// @route   GET /api/quiz/admin/questions
// @access  Private/Admin
exports.getAllQuestions = async (req, res, next) => {
  try {
    const filter = {};
    
    // If boothId is provided, filter by booth
    if (req.query.boothId) {
      filter.booth = req.query.boothId;
    }

    const questions = await Question.find(filter)
      .populate('booth', 'name title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions by booth (Admin)
// @route   GET /api/quiz/booth/:boothId/questions
// @access  Private/Admin
exports.getQuestionsByBooth = async (req, res, next) => {
  try {
    const questions = await Question.find({
      booth: req.params.boothId
    }).populate('booth', 'name title');

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question (Admin)
// @route   PUT /api/quiz/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question (Admin)
// @route   DELETE /api/quiz/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quiz attempts with filters (Admin)
// @route   GET /api/quiz/attempts
// @access  Private/Admin
exports.getAllQuizAttempts = async (req, res, next) => {
  try {
    const { startDate, endDate, userType, mobile, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    
    if (startDate || endDate) {
      filter.attemptDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.attemptDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.attemptDate.$lte = end;
      }
    }
    
    if (userType) {
      filter.userType = userType;
    }
    
    if (mobile) {
      filter.mobile = { $regex: mobile, $options: 'i' };
    }
    
    const skip = (page - 1) * limit;
    
    const attempts = await QuizAttempt.find(filter)
      .sort({ attemptDate: -1, score: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email mobile')
      .populate('guestUser', 'name mobile place age');
    
    const total = await QuizAttempt.countDocuments(filter);
    
    // Calculate stats
    const stats = {
      totalAttempts: total,
      guestAttempts: await QuizAttempt.countDocuments({ ...filter, userType: 'guest' }),
      registeredAttempts: await QuizAttempt.countDocuments({ ...filter, userType: 'registered' }),
      avgScore: 0,
      avgTime: 0
    };
    
    if (total > 0) {
      const aggResult = await QuizAttempt.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          avgTime: { $avg: '$totalTime' }
        }}
      ]);
      
      if (aggResult.length > 0) {
        stats.avgScore = Math.round(aggResult[0].avgScore);
        stats.avgTime = Math.round(aggResult[0].avgTime);
      }
    }
    
    res.status(200).json({
      success: true,
      count: attempts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};
