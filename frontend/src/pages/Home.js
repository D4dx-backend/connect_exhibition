import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boothAPI, programAPI } from '../services/apiServices';
import { FaStore, FaQuestionCircle, FaCommentAlt, FaBell, FaBookmark, FaTrophy, FaCalendarAlt, FaClock, FaUser } from 'react-icons/fa';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [booths, setBooths] = useState([]);
  const [todayPrograms, setTodayPrograms] = useState([]);

  useEffect(() => {
    fetchBooths();
    fetchTodayPrograms();
  }, []);

  const fetchBooths = async () => {
    try {
      const response = await boothAPI.getAll();
      setBooths(response.data.data || []);
    } catch (error) {
      console.error('Failed to load booths');
    }
  };

  const fetchTodayPrograms = async () => {
    try {
      const response = await programAPI.getToday();
      setTodayPrograms(response.data.data || []);
    } catch (error) {
      console.error('Failed to load today\'s programs');
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const features = [
    {
      icon: <FaStore className="text-xl sm:text-2xl" />,
      title: 'Exhibition Booths',
      description: 'Explore various exhibition booths',
      link: '/booths',
      iconBg: 'bg-blue-500'
    },
    {
      icon: <FaBookmark className="text-xl sm:text-2xl" />,
      title: 'My Bookmarks',
      description: 'View and manage bookmarks',
      link: '/profile',
      iconBg: 'bg-purple-500',
      requireAuth: true
    },
    {
      icon: <FaQuestionCircle className="text-xl sm:text-2xl" />,
      title: 'Quiz Competition',
      description: 'Participate in daily quizzes',
      link: '/quiz',
      iconBg: 'bg-pink-500'
    },
    {
      icon: <FaTrophy className="text-xl sm:text-2xl" />,
      title: 'Leaderboard',
      description: 'Check rankings and scores',
      link: '/leaderboard',
      iconBg: 'bg-yellow-600'
    },
    {
      icon: <FaCommentAlt className="text-xl sm:text-2xl" />,
      title: 'Share Feedback',
      description: 'Rate your experience',
      link: '/feedback',
      iconBg: 'bg-green-500'
    },
    {
      icon: <FaBell className="text-xl sm:text-2xl" />,
      title: 'Announcements',
      description: 'Stay updated with latest info',
      link: '/notifications',
      iconBg: 'bg-teal-500'
    },
    {
      icon: <FaCalendarAlt className="text-xl sm:text-2xl" />,
      title: 'Programs',
      description: 'View all scheduled events',
      link: '/programs',
      iconBg: 'bg-indigo-500'
    }
  ];

  return (
    <div className="fade-in">
      {/* Compact Welcome Header */}
      <div className="glass-card rounded-2xl p-4 mb-6 shadow-md">
        <h1 className="text-xl font-bold mb-1">
          Welcome to <span className="text-red-600">Connecta</span>
        </h1>
        {isAuthenticated ? (
          <p className="text-sm text-gray-700">
            Hello, <span className="font-semibold text-red-600">{user?.name}</span>! 👋
          </p>
        ) : (
          <div className="flex space-x-2 mt-2">
            <Link
              to="/login"
              className="glass text-gray-800 px-4 py-1.5 rounded-lg font-medium hover:glass-strong transition-morph text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-primary-700 transition-morph text-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Main Features Grid - Card Design */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        {features.filter(feature => !feature.requireAuth || isAuthenticated).map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="glass-card rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-morph flex flex-col sm:flex-row items-start sm:space-x-4"
          >
            {/* Icon Circle */}
            <div className={`${feature.iconBg} rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-white flex-shrink-0`}>
              {feature.icon}
            </div>
            
            {/* Text Content */}
            <div className="flex-1 min-w-0 mt-3 sm:mt-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Programs */}
      {todayPrograms.length > 0 && (
        <div className="glass-card rounded-2xl shadow-md p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FaCalendarAlt className="mr-2 text-primary-600" />
              Today's Programs
            </h2>
            <Link
              to="/programs"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {todayPrograms.map((program) => (
              <div key={program._id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary-500 transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3 text-center min-w-[70px]">
                    <FaClock className="text-primary-600 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-primary-700">
                      {formatTime(program.startTime)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">{program.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{program.description}</p>
                    {program.speakers && program.speakers.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <FaUser />
                        <span>{program.speakers.map(s => s.name).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="glass-card rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Exhibition Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">{booths.length}</div>
            <div className="text-gray-600 text-xs">Booths</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">100+</div>
            <div className="text-gray-600 text-xs">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">1000+</div>
            <div className="text-gray-600 text-xs">Visitors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
            <div className="text-gray-600 text-xs">Access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
