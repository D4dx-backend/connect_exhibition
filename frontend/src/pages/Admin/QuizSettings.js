import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { FaSave, FaPlus, FaEdit, FaTrash, FaClock, FaCalendar, FaTrophy } from 'react-icons/fa';

const AdminQuizSettings = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    dailyStartTime: '08:00',
    dailyEndTime: '21:00',
    topCount: 10,
    isActive: true,
    description: ''
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await API.get('/quiz-config');
      setConfigs(response.data.data || []);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load quiz configurations');
      }
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await API.put(`/quiz-config/${editingConfig._id}`, formData);
        toast.success('Configuration updated successfully');
      } else {
        await API.post('/quiz-config', formData);
        toast.success('Configuration created successfully');
      }
      fetchConfigs();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      startDate: config.startDate.split('T')[0],
      endDate: config.endDate.split('T')[0],
      dailyStartTime: config.dailyStartTime,
      dailyEndTime: config.dailyEndTime,
      topCount: config.topCount,
      isActive: config.isActive,
      description: config.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await API.delete(`/quiz-config/${id}`);
      toast.success('Configuration deleted successfully');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to delete configuration');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setFormData({
      startDate: '',
      endDate: '',
      dailyStartTime: '08:00',
      dailyEndTime: '21:00',
      topCount: 10,
      isActive: true,
      description: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz Settings</h1>
          <p className="text-gray-600">Manage quiz configurations and schedules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FaPlus />
          <span>New Configuration</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="spinner"></div>
        </div>
      ) : configs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No quiz configuration found</p>
          <p className="text-gray-400 text-sm">Create your first configuration to enable the quiz</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {configs.map((config) => (
            <div key={config._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        Quiz Configuration
                      </h3>
                      {config.isActive && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    {config.description && (
                      <p className="text-gray-600 text-sm">{config.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(config._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FaCalendar className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quiz Period</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(config.startDate)} - {formatDate(config.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FaClock className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Daily Timing (IST)</p>
                      <p className="font-semibold text-gray-800">
                        {config.dailyStartTime} - {config.dailyEndTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FaTrophy className="text-yellow-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Top Leaderboard</p>
                      <p className="font-semibold text-gray-800">Top {config.topCount} Results</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingConfig ? 'Edit Configuration' : 'New Configuration'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Start Time (IST) *
                  </label>
                  <input
                    type="time"
                    value={formData.dailyStartTime}
                    onChange={(e) => setFormData({ ...formData, dailyStartTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily End Time (IST) *
                  </label>
                  <input
                    type="time"
                    value={formData.dailyEndTime}
                    onChange={(e) => setFormData({ ...formData, dailyEndTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top Count (Leaderboard) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.topCount}
                    onChange={(e) => setFormData({ ...formData, topCount: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Set as Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Add a description for this configuration..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3 border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  <FaSave />
                  <span>{editingConfig ? 'Update' : 'Create'}</span>
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

export default AdminQuizSettings;
