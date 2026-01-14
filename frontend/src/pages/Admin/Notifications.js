import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBell, FaEye } from 'react-icons/fa';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    metadata: {
      link: '',
      actionLabel: ''
    }
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        metadata: formData.metadata.link ? formData.metadata : undefined
      };

      if (editingNotification) {
        await notificationAPI.update(editingNotification._id, data);
        toast.success('Notification updated successfully');
      } else {
        await notificationAPI.create(data);
        toast.success('Notification created successfully');
      }
      
      fetchNotifications();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notification');
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      publishDate: new Date(notification.publishDate).toISOString().split('T')[0],
      expiryDate: notification.expiryDate ? new Date(notification.expiryDate).toISOString().split('T')[0] : '',
      metadata: notification.metadata || { link: '', actionLabel: '' }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await notificationAPI.delete(id);
      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      message: '',
      type: 'general',
      priority: 'normal',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      metadata: {
        link: '',
        actionLabel: ''
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'event':
        return 'bg-purple-100 text-purple-700';
      case 'important':
        return 'bg-red-100 text-red-700';
      case 'exhibition':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Notifications</h1>
          <p className="text-gray-600">Create and manage announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FaPlus />
          <span>Add Notification</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaBell className="text-gray-300 text-6xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications found. Create your first notification!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        getPriorityColor(notification.priority)
                      }`}>
                        {notification.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        getTypeColor(notification.type)
                      }`}>
                        {notification.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <FaEye />
                        <span>Reads: {notification.readBy?.length || 0}</span>
                      </div>
                      <div>
                        Published: {formatDate(notification.publishDate)}
                      </div>
                      {notification.expiryDate && (
                        <div>
                          Expires: {formatDate(notification.expiryDate)}
                        </div>
                      )}
                    </div>

                    {notification.metadata?.link && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">
                          <span className="font-semibold text-blue-900">Action Link:</span>{' '}
                          <a href={notification.metadata.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {notification.metadata.actionLabel || notification.metadata.link}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(notification)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingNotification ? 'Edit Notification' : 'Create New Notification'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="important">Important</option>
                    <option value="exhibition">Exhibition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date *</label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Action Link */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Action Link (Optional)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                  <input
                    type="url"
                    value={formData.metadata.link}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: {...formData.metadata, link: e.target.value}
                    })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Label</label>
                  <input
                    type="text"
                    value={formData.metadata.actionLabel}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: {...formData.metadata, actionLabel: e.target.value}
                    })}
                    placeholder="Learn More"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  {editingNotification ? 'Update Notification' : 'Create Notification'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
