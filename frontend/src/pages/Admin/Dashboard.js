import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChartBar, FaClock, FaPhone, FaTrophy, FaUser } from 'react-icons/fa';
import { userAPI } from '../../services/apiServices';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getAdminOverview();
        setOverview(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = overview?.stats || {};

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-500 text-sm font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalUsers || 0}</p>
              <p className="text-xs text-gray-400 mt-2">Active users: {stats.activeUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-500 text-sm font-medium mb-1">Total Booths</p>
              <p className="text-3xl font-bold text-primary-600">{stats.totalBooths || 0}</p>
              <p className="text-xs text-gray-400 mt-2">Exhibition booths</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-500 text-sm font-medium mb-1">Quiz Attempts</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalQuizAttempts || 0}</p>
              <p className="text-xs text-gray-400 mt-2">
                Guests: {stats.guestAttempts || 0} · Registered: {stats.registeredAttempts || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-gray-500 text-sm font-medium mb-1">Feedback</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalFeedback || 0}</p>
              <p className="text-xs text-gray-400 mt-2">Total submissions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
                  <p className="text-sm text-gray-500">Latest registrations</p>
                </div>
                <FaUser className="text-primary-600" />
              </div>
              <div className="divide-y divide-gray-100">
                {overview?.recentUsers?.length ? (
                  overview.recentUsers.map((user) => (
                    <div key={user._id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name || 'N/A'}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-3 mt-1">
                          <span className="inline-flex items-center">
                            <FaPhone className="mr-2 text-gray-400" />
                            {user.mobile || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="text-sm font-medium text-gray-700">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">No recent users</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Recent Quiz Attempts</h2>
                  <p className="text-sm text-gray-500">Latest activity</p>
                </div>
                <FaChartBar className="text-purple-600" />
              </div>
              <div className="divide-y divide-gray-100">
                {overview?.recentQuizAttempts?.length ? (
                  overview.recentQuizAttempts.map((attempt) => {
                    const user = attempt.userType === 'guest' ? attempt.guestUser : attempt.user;
                    const percentage = Number.isFinite(attempt.percentage)
                      ? attempt.percentage
                      : (attempt.totalQuestions ? (attempt.correctAnswers / attempt.totalQuestions) * 100 : 0);
                    return (
                      <div key={attempt._id} className="px-6 py-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{user?.name || 'N/A'}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-3 mt-1">
                            <span className="inline-flex items-center">
                              <FaCalendarAlt className="mr-2 text-gray-400" />
                              {formatDate(attempt.attemptDate)}
                            </span>
                            <span className="inline-flex items-center">
                              <FaClock className="mr-2 text-gray-400" />
                              {formatTime(attempt.totalTime)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="inline-flex items-center text-sm font-semibold text-gray-700">
                            <FaTrophy className="mr-2 text-yellow-500" />
                            {attempt.score}
                          </p>
                          <p className="text-xs text-gray-500">{percentage.toFixed(0)}% accuracy</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            attempt.userType === 'guest' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {attempt.userType}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">No recent quiz attempts</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
