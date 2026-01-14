import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI, authAPI } from '../services/apiServices';
import { toast } from 'react-toastify';
import { 
  FaUser, FaEnvelope, FaBookmark, FaHistory, FaTrophy, 
  FaClock, FaCheckCircle, FaEdit, FaKey 
} from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [quizHistory, setQuizHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'quiz-history') {
      fetchQuizHistory();
    }
  }, [activeTab]);

  const fetchQuizHistory = async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getHistory();
      setQuizHistory(response.data.data);
    } catch (error) {
      toast.error('Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <FaBookmark /> },
    { id: 'quiz-history', label: 'Quiz History', icon: <FaHistory /> },
  ];

  const stats = [
    {
      label: 'Bookmarked Booths',
      value: user?.bookmarkedBooths?.length || 0,
      icon: <FaBookmark className="text-primary-600" />,
      color: 'bg-primary-50'
    },
    {
      label: 'Visited Booths',
      value: user?.visitedBooths?.length || 0,
      icon: <FaCheckCircle className="text-green-600" />,
      color: 'bg-green-50'
    },
    {
      label: 'Quiz Attempts',
      value: quizHistory.length,
      icon: <FaTrophy className="text-purple-600" />,
      color: 'bg-purple-50'
    },
  ];

  return (
    <div className="fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <FaUser className="text-primary-600 text-4xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-primary-100 flex items-center">
              <FaEnvelope className="mr-2" />
              {user?.email}
            </p>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                user?.role === 'admin' ? 'bg-yellow-500 text-yellow-900' : 'bg-white text-primary-600'
              }`}>
                {user?.role === 'admin' ? '🔑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-xl shadow-md p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {!editMode ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">Full Name</label>
                      <p className="text-lg text-gray-800">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-medium">Email Address</label>
                      <p className="text-lg text-gray-800">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-medium">Account Type</label>
                      <p className="text-lg text-gray-800 capitalize">{user?.role}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-medium">Member Since</label>
                      <p className="text-lg text-gray-800">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-primary-600 hover:text-primary-600 transition"
                    >
                      <FaKey />
                      <span>Change Password</span>
                    </button>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="mt-6 space-y-4 bg-gray-50 p-6 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          required
                          minLength="8"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                          Update Password
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Bookmarked Booths</h2>
              {user?.bookmarkedBooths && user.bookmarkedBooths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.bookmarkedBooths.map((booth) => (
                    <Link
                      key={booth._id}
                      to={`/booths/${booth._id}`}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                        {booth.name?.[0] || 'B'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{booth.name}</h3>
                        <p className="text-sm text-gray-600">{booth.title}</p>
                      </div>
                      <FaBookmark className="text-primary-600" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaBookmark className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No bookmarked booths yet</p>
                  <Link
                    to="/booths"
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Explore Booths
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quiz History Tab */}
          {activeTab === 'quiz-history' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz History</h2>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : quizHistory.length > 0 ? (
                <div className="space-y-4">
                  {quizHistory.map((attempt) => (
                    <div
                      key={attempt._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {formatDate(attempt.attemptDate)}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="text-sm text-gray-600">Score:</span>
                              <span className="ml-2 text-2xl font-bold text-primary-600">
                                {attempt.score}/{attempt.totalQuestions * 10}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Correct:</span>
                              <span className="ml-2 text-xl font-bold text-green-600">
                                {attempt.correctAnswers}/{attempt.totalQuestions}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaClock className="text-gray-400" />
                              <span className="font-mono font-bold text-purple-600">
                                {formatTime(attempt.totalTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                          <p className="text-3xl font-bold text-orange-600">
                            {attempt.percentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaTrophy className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No quiz attempts yet</p>
                  <Link
                    to="/quiz"
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Take Quiz
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
