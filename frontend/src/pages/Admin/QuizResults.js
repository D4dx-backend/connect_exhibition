import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { 
  FaCalendar, FaUser, FaPhone, FaMapMarkerAlt, FaTrophy, 
  FaClock, FaDownload, FaSearch, FaFilter 
} from 'react-icons/fa';

const AdminQuizResults = () => {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userType: 'all',
    mobile: '',
    page: 1
  });

  useEffect(() => {
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.userType !== 'all') params.userType = filters.userType;
      if (filters.mobile) params.mobile = filters.mobile;
      params.page = filters.page;

      const response = await API.get('/quiz/attempts', { params });
      setAttempts(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load quiz attempts');
      }
      setAttempts([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportToCSV = () => {
    if (attempts.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Date', 'Name', 'Mobile', 'Place', 'Age', 'Score', 'Correct', 'Time', 'Type'];
    const rows = attempts.map(a => {
      const user = a.userType === 'guest' ? a.guestUser : a.user;
      return [
        formatDate(a.attemptDate),
        user?.name || 'N/A',
        a.userType === 'guest' ? user?.mobile : 'Registered',
        a.userType === 'guest' ? user?.place : 'N/A',
        a.userType === 'guest' ? user?.age : 'N/A',
        a.score,
        `${a.correctAnswers}/${a.totalQuestions}`,
        formatTime(a.totalTime),
        a.userType
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz Results</h1>
          <p className="text-gray-600">View and analyze all quiz attempts</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <FaDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-blue-100 text-sm mb-1">Total Attempts</p>
            <p className="text-4xl font-bold">{stats.totalAttempts}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-green-100 text-sm mb-1">Guest Attempts</p>
            <p className="text-4xl font-bold">{stats.guestAttempts}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-purple-100 text-sm mb-1">Avg Score</p>
            <p className="text-4xl font-bold">{stats.avgScore}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-yellow-100 text-sm mb-1">Avg Time</p>
            <p className="text-4xl font-bold">{formatTime(stats.avgTime)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaFilter className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendar className="inline mr-2" />Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendar className="inline mr-2" />End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
            <select
              value={filters.userType}
              onChange={(e) => setFilters({ ...filters, userType: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="guest">Guest</option>
              <option value="registered">Registered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />Mobile Search
            </label>
            <input
              type="text"
              placeholder="Search mobile..."
              value={filters.mobile}
              onChange={(e) => setFilters({ ...filters, mobile: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="spinner"></div>
        </div>
      ) : attempts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No quiz attempts found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Score</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Accuracy</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Time</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.map((attempt, index) => {
                  const user = attempt.userType === 'guest' ? attempt.guestUser : attempt.user;
                  return (
                    <tr key={attempt._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FaCalendar className="text-gray-400" />
                          <span>{formatDate(attempt.attemptDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FaUser className="text-gray-400" />
                          <span className="font-medium text-gray-800">{user?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {attempt.userType === 'guest' ? (
                          <div className="flex items-center space-x-2 text-sm">
                            <FaPhone className="text-gray-400" />
                            <span>{user?.mobile || 'N/A'}</span>
                            <span className="text-gray-500">| Age: {user?.age || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Registered User</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {attempt.userType === 'guest' && user?.place ? (
                          <div className="flex items-center space-x-2 text-sm">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span>{user.place}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FaTrophy className="text-yellow-500" />
                          <span className="font-bold text-gray-800">{attempt.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          attempt.percentage >= 80 ? 'bg-green-100 text-green-800' :
                          attempt.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {attempt.correctAnswers}/{attempt.totalQuestions} ({attempt.percentage.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <FaClock className="text-gray-400" />
                          <span>{formatTime(attempt.totalTime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          attempt.userType === 'guest' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {attempt.userType}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizResults;
