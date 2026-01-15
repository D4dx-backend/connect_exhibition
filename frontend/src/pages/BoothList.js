import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { boothAPI } from '../services/apiServices';
import { normalizeMediaUrl } from '../utils/media';
import { FaSearch, FaBookmark } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BoothList = () => {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBooths = useCallback(async () => {
    try {
      const response = await boothAPI.getAll({ search });
      setBooths(response.data.data);
    } catch (error) {
      toast.error('Failed to load booths');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBooths();
  }, [fetchBooths]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooths();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Exhibition Booths</h1>
        <p className="text-gray-600">Explore all exhibition booths and their details</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booths..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Booths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booths.map((booth) => {
          const logoUrl = normalizeMediaUrl(booth.logo);
          return (
          <Link
            key={booth._id}
            to={`/booths/${booth._id}`}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={booth.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-6xl font-bold">{booth.name[0]}</span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{booth.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{booth.title}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>👁️ {booth.visitCount} visits</span>
                <span className="flex items-center">
                  <FaBookmark className="mr-1" /> {booth.bookmarkCount}
                </span>
              </div>
            </div>
          </Link>
          );
        })}
      </div>

      {booths.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No booths found</p>
        </div>
      )}
    </div>
  );
};

export default BoothList;
