import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBell, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const Notifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [fetchNotifications, fetchUnreadCount, isAuthenticated]);

  const handleMarkAsRead = async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      await notificationAPI.markAsRead(notificationId);
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <FaExclamationCircle className="text-red-500" />;
      case 'high':
        return <FaBell className="text-orange-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return '🎉';
      case 'important':
        return '⚠️';
      case 'exhibition':
        return '🏢';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <FaBell className="text-primary-600 mr-3" />
              Announcements
            </h1>
            <p className="text-gray-600">Stay updated with the latest information</p>
          </div>
          {isAuthenticated && unreadCount > 0 && (
            <div className="bg-primary-600 text-white px-4 py-2 rounded-full font-semibold">
              {unreadCount} Unread
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaBell className="text-gray-300 text-6xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications available</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleMarkAsRead(notification._id)}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden border-l-4 ${
                getPriorityColor(notification.priority)
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          {notification.title}
                        </h3>
                        {getPriorityIcon(notification.priority)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(notification.publishDate)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          notification.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : notification.priority === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {notification.priority.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {notification.type.toUpperCase()}
                        </span>
                      </div>

                      {notification.metadata?.link && (
                        <a
                          href={notification.metadata.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-2"
                        >
                          <span>{notification.metadata.actionLabel || 'Learn More'}</span>
                          <span>→</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="text-primary-600 text-xl mt-1" />
          <div>
            <h4 className="font-bold text-primary-900 mb-2">Stay Connected</h4>
            <p className="text-primary-800 text-sm">
              Check this page regularly for important announcements, event updates, and exhibition information.
              {isAuthenticated && ' Click on notifications to mark them as read.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
