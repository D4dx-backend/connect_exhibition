import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { FaStar, FaUser, FaCalendar, FaChartBar, FaDownload } from 'react-icons/fa';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFeedback();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await feedbackAPI.getAll({ status: filter !== 'all' ? filter : undefined });
      setFeedback(response.data.data || []);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load feedback');
      }
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await feedbackAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
      setStats(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
            size={16}
          />
        ))}
      </div>
    );
  };

  const exportToCSV = () => {
    if (feedback.length === 0) {
      toast.error('No feedback to export');
      return;
    }

    try {
      const headers = ['Date', 'Time', 'User', 'Overall Quality', 'Digital Presence', 'Facilities', 'Comments'];
      
      const rows = feedback.map(f => {
        const date = new Date(f.createdAt);
        const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        return [
          `"${dateStr}"`,
          `"${timeStr}"`,
          `"${f.isAnonymous ? 'Anonymous' : (f.userId?.name || 'Unknown')}"`,
          f.ratings?.overallQuality || 'N/A',
          f.ratings?.digitalPresence || 'N/A',
          f.ratings?.facilities || 'N/A',
          `"${(f.comments || 'No comments').replace(/"/g, '""')}"`
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
      a.download = `feedback_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Feedback exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export feedback');
    }
  };

  if (loading && !stats) {
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
          <h1 className="text-2xl font-bold text-gray-800">Feedback Analytics</h1>
          <p className="text-gray-600">View and analyze user feedback</p>
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
      {stats && stats.averageRatings && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Feedback</p>
                <p className="text-4xl font-bold">{stats.totalFeedback || 0}</p>
              </div>
              <FaChartBar className="text-5xl text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Overall Quality</p>
                <p className="text-4xl font-bold">{stats.averageRatings.overallQuality?.toFixed(1) || '0.0'}</p>
                <div className="mt-2">{renderStars(Math.round(stats.averageRatings.overallQuality || 0))}</div>
              </div>
              <FaStar className="text-5xl text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Digital Presence</p>
                <p className="text-4xl font-bold">{stats.averageRatings.digitalPresence?.toFixed(1) || '0.0'}</p>
                <div className="mt-2">{renderStars(Math.round(stats.averageRatings.digitalPresence || 0))}</div>
              </div>
              <FaStar className="text-5xl text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Facilities</p>
                <p className="text-4xl font-bold">{stats.averageRatings.facilities?.toFixed(1) || '0.0'}</p>
                <div className="mt-2">{renderStars(Math.round(stats.averageRatings.facilities || 0))}</div>
              </div>
              <FaStar className="text-5xl text-green-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Feedback</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : feedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No feedback found</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {item.isAnonymous ? '?' : (item.userId?.name?.[0] || 'U')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {item.isAnonymous ? 'Anonymous User' : (item.userId?.name || 'Unknown User')}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FaCalendar className="mr-1" />
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : item.status === 'reviewed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Overall Quality</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(item.ratings.overallQuality)}
                      <span className="font-bold text-gray-800">{item.ratings.overallQuality}</span>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Digital Presence</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(item.ratings.digitalPresence)}
                      <span className="font-bold text-gray-800">{item.ratings.digitalPresence}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Facilities</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(item.ratings.facilities)}
                      <span className="font-bold text-gray-800">{item.ratings.facilities}</span>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                {item.comments && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Comments:</p>
                    <p className="text-gray-800 leading-relaxed">{item.comments}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rating Distribution (if stats available) */}
      {stats && stats.ratingDistribution && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Rating Distribution</h2>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-20">
                  <span className="font-medium text-gray-700">{star}</span>
                  <FaStar className="text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${stats.totalFeedback > 0 ? ((stats.ratingDistribution[star] || 0) / stats.totalFeedback) * 100 : 0}%`
                    }}
                  >
                    {stats.ratingDistribution[star] > 0 && (
                      <span className="text-xs font-semibold text-white">
                        {stats.ratingDistribution[star]}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {stats.totalFeedback > 0 ? ((stats.ratingDistribution[star] || 0) / stats.totalFeedback * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
