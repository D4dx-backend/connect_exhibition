import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { quizAPI, quizConfigAPI } from '../services/apiServices';
import { toast } from 'react-toastify';
import { FaTrophy, FaMedal, FaClock, FaCheckCircle, FaLock } from 'react-icons/fa';

const Leaderboard = () => {
  const location = useLocation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [resultsPublished, setResultsPublished] = useState(false);
  const result = location.state?.result;

  const fetchQuizConfig = useCallback(async () => {
    try {
      const response = await quizConfigAPI.getActive();
      const config = response.data.data;
      setResultsPublished(config?.resultsPublished || false);
    } catch (error) {
      console.error('Failed to load quiz config');
      setResultsPublished(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await quizAPI.getLeaderboard(selectedDate);
      setLeaderboard(response.data.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchQuizConfig();
  }, [fetchQuizConfig]);

  useEffect(() => {
    if (resultsPublished) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [fetchLeaderboard, resultsPublished, selectedDate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-500 text-3xl" />;
      case 2:
        return <FaMedal className="text-gray-400 text-2xl" />;
      case 3:
        return <FaMedal className="text-orange-600 text-2xl" />;
      default:
        return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-white border-2 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show message if results are not published
  if (!resultsPublished) {
    return (
      <div className="fade-in max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center drop-shadow-lg">
            <FaTrophy className="text-yellow-300 mr-3" />
            Quiz Leaderboard
          </h1>
        </div>

        {/* Result Banner */}
        {result && (
          <div className="glass-card border-2 border-green-500 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <FaCheckCircle className="text-green-600 text-2xl" />
              <h3 className="text-xl font-bold text-green-800">Quiz Submitted Successfully!</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-green-700">{result.score}/{result.totalQuestions * 10}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl font-bold text-green-700">{result.correctAnswers}/{result.totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="text-2xl font-bold text-green-700">{result.percentage.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Taken</p>
                <p className="text-2xl font-bold text-green-700">{formatTime(result.totalTime)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Not Published Message */}
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 p-6 rounded-full">
              <FaLock className="text-yellow-600 text-6xl" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Leaderboard Coming Soon!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            The quiz results haven't been published yet. The leaderboard will be revealed once the admin publishes the results.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-blue-800">
              <strong>Note:</strong> Your quiz submission has been recorded. Check back later to see your ranking!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center drop-shadow-lg">
          <FaTrophy className="text-yellow-300 mr-3" />
          Quiz Leaderboard
        </h1>
        <p className="text-white drop-shadow">Top performers ranked by highest score and fastest time</p>
      </div>

      {/* Result Banner */}
      {result && (
        <div className="glass-card border-2 border-green-500 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <FaCheckCircle className="text-green-600 text-2xl" />
            <h3 className="text-xl font-bold text-green-800">Quiz Submitted Successfully!</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-green-700">{result.score}/{result.totalQuestions * 10}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold text-green-700">{result.correctAnswers}/{result.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Percentage</p>
              <p className="text-2xl font-bold text-green-700">{result.percentage.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Taken</p>
              <p className="text-2xl font-bold text-green-700">{formatTime(result.totalTime)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="glass-card rounded-xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No quiz attempts for this date</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.user._id}
              className={`${getRankBadge(entry.rank)} rounded-xl shadow-lg p-6 transform transition hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      entry.rank <= 3 ? 'text-white' : 'text-gray-800'
                    }`}>
                      {entry.user.name}
                    </h3>
                    <p className={`text-sm ${
                      entry.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      {entry.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className={`text-sm ${
                      entry.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      Score
                    </p>
                    <p className={`text-2xl font-bold ${
                      entry.rank <= 3 ? 'text-white' : 'text-primary-600'
                    }`}>
                      {entry.score}/100
                    </p>
                  </div>

                  <div className="text-center">
                    <p className={`text-sm ${
                      entry.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      Correct
                    </p>
                    <p className={`text-2xl font-bold ${
                      entry.rank <= 3 ? 'text-white' : 'text-green-600'
                    }`}>
                      {entry.correctAnswers}/10
                    </p>
                  </div>

                  <div className="text-center">
                    <p className={`text-sm ${
                      entry.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      <FaClock className="inline mr-1" />Time
                    </p>
                    <p className={`text-2xl font-bold font-mono ${
                      entry.rank <= 3 ? 'text-white' : 'text-purple-600'
                    }`}>
                      {formatTime(entry.totalTime)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className={`text-sm ${
                      entry.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      Accuracy
                    </p>
                    <p className={`text-2xl font-bold ${
                      entry.rank <= 3 ? 'text-white' : 'text-orange-600'
                    }`}>
                      {entry.percentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {leaderboard.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Total Participants</p>
              <p className="text-3xl font-bold text-primary-600">{leaderboard.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Highest Score</p>
              <p className="text-3xl font-bold text-green-600">{leaderboard[0]?.score || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Fastest Time</p>
              <p className="text-3xl font-bold text-purple-600">
                {leaderboard[0]?.totalTime ? formatTime(leaderboard[0].totalTime) : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Avg Accuracy</p>
              <p className="text-3xl font-bold text-orange-600">
                {leaderboard.length > 0
                  ? (leaderboard.reduce((sum, e) => sum + e.percentage, 0) / leaderboard.length).toFixed(0)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
