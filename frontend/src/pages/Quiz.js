import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/apiServices';
import API from '../services/api';
import { toast } from 'react-toastify';
import { FaClock, FaCheckCircle, FaArrowRight, FaArrowLeft, FaUser, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaInfoCircle } from 'react-icons/fa';

const Quiz = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestData, setGuestData] = useState({
    name: '',
    age: '',
    mobile: '',
    place: ''
  });
  const [quizConfig, setQuizConfig] = useState(null);
  const [quizAvailable, setQuizAvailable] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [questionCount, setQuestionCount] = useState(0);

  const sanitizeText = (value) => {
    if (!value) return '';
    const parsed = new DOMParser().parseFromString(String(value), 'text/html');
    return (parsed.body.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    fetchQuizConfig();
    fetchQuestions();
  }, []);

  const fetchQuizConfig = async () => {
    try {
      const response = await API.get('/quiz-config/active');
      setQuizConfig(response.data.data);
    } catch (error) {
      setQuizConfig(null);
    }
  };

  useEffect(() => {
    let interval;
    if (quizStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, startTime]);

  const fetchQuestions = async () => {
    try {
      const response = await quizAPI.getQuestions();
      setQuestions(response.data.data);
      setQuestionCount(response.data.count || response.data.data?.length || 0);
      setQuizAvailable(true);
    } catch (error) {
      if (error.response?.status === 400) {
        setQuizAvailable(false);
        setAvailabilityMessage(error.response.data.message || 'Quiz is not available');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load quiz questions');
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => answers[q._id] === undefined);
    if (unanswered.length > 0) {
      toast.warning(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    if (!window.confirm('Are you sure you want to submit your quiz?')) {
      return;
    }

    setSubmitting(true);

    try {
      const submissionData = {
        answers: questions.map(q => ({
          questionId: q._id,
          selectedOption: answers[q._id],
          timeTaken: 0
        })),
        totalTime: elapsedTime
      };

      // Add guest data if not authenticated
      if (!isAuthenticated) {
        submissionData.guestData = guestData;
      }

      const response = await quizAPI.submitQuiz(submissionData);
      const result = response.data.data;

      toast.success(`Quiz submitted! Score: ${result.score}/${result.totalQuestions * 10}`);
      navigate('/leaderboard', { state: { result } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGuestFormSubmit = (e) => {
    e.preventDefault();
    if (!guestData.name || !guestData.age || !guestData.mobile || !guestData.place) {
      toast.error('Please fill all fields');
      return;
    }
    if (!/^[0-9]{10}$/.test(guestData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (guestData.age < 1 || guestData.age > 150) {
      toast.error('Please enter a valid age');
      return;
    }
    setShowGuestForm(false);
    startQuiz();
  };

  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      setShowGuestForm(true);
    } else {
      startQuiz();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Competition</h1>
          <p className="text-gray-600 mb-6">
            Test your knowledge about the exhibition booths! Answer 10 questions and compete for the top position on the leaderboard.
          </p>

          {/* Quiz Availability Info */}
          {quizConfig && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <FaInfoCircle className="text-blue-600 mt-1" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Quiz Schedule</p>
                  <p>Available: {new Date(quizConfig.startDate).toLocaleDateString()} - {new Date(quizConfig.endDate).toLocaleDateString()}</p>
                  <p>Daily Timing: {quizConfig.dailyStartTime} - {quizConfig.dailyEndTime} IST</p>
                  <p className="mt-1 text-blue-700">One attempt per day allowed</p>
                </div>
              </div>
            </div>
          )}

          {!quizAvailable && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">{availabilityMessage}</p>
            </div>
          )}

          {showGuestForm ? (
            <form onSubmit={handleGuestFormSubmit} className="space-y-4 mb-6">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                <p className="text-primary-900 font-semibold mb-2">Guest Registration</p>
                <p className="text-sm text-primary-700">Please provide your details to participate in the quiz</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />Full Name *
                </label>
                <input
                  type="text"
                  value={guestData.name}
                  onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBirthdayCake className="inline mr-2" />Age *
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={guestData.age}
                  onChange={(e) => setGuestData({ ...guestData, age: e.target.value })}
                  placeholder="Enter your age"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />Mobile Number *
                </label>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={guestData.mobile}
                  onChange={(e) => setGuestData({ ...guestData, mobile: e.target.value })}
                  placeholder="Enter 10-digit mobile number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />Place *
                </label>
                <input
                  type="text"
                  value={guestData.place}
                  onChange={(e) => setGuestData({ ...guestData, place: e.target.value })}
                  placeholder="Enter your city/place"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!quizAvailable}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-primary-900 mb-3">Quiz Rules:</h3>
                <ul className="space-y-2 text-primary-800">
                  <li>✓ {questionCount || 10} questions total (1 from each booth)</li>
                  <li>✓ Each correct answer = 10 points</li>
                  <li>✓ Your time will be recorded</li>
                  <li>✓ Winners determined by highest score + fastest time</li>
                  <li>✓ You can navigate between questions</li>
                  <li>✓ Submit only when all questions are answered</li>
                  <li>✓ One attempt per mobile number per day</li>
                </ul>
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={!quizAvailable}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthenticated ? 'Start Quiz' : 'Register & Start Quiz'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto fade-in">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Answered: {answeredCount}/{questions.length}
            </span>
            <div className="flex items-center space-x-2 text-primary-600">
              <FaClock />
              <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            {sanitizeText(currentQuestion.boothName)}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {sanitizeText(currentQuestion.question)}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion._id] === option.index;
            return (
              <button
                key={option.index}
                onClick={() => handleAnswer(currentQuestion._id, option.index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-lg ${isSelected ? 'font-semibold text-primary-900' : 'text-gray-700'}`}>
                    {sanitizeText(option.text)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaArrowLeft />
          <span>Previous</span>
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < questions.length}
            className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {submitting ? (
              <>
                <div className="spinner w-5 h-5 border-2"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FaCheckCircle />
                <span>Submit Quiz</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {questions.map((q, index) => (
            <button
              key={q._id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg font-semibold transition ${
                index === currentQuestionIndex
                  ? 'bg-primary-600 text-white'
                  : answers[q._id] !== undefined
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
