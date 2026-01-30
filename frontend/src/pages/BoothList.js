import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { boothAPI } from '../services/apiServices';
import { normalizeMediaUrl } from '../utils/media';
import { FaSearch, FaBookmark, FaMusic } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BoothList = () => {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  const fetchBooths = useCallback(async () => {
    try {
      const response = await boothAPI.getAll({ search });
      setBooths(response.data.data);
    } catch (error) {
      toast.error('Failed to load stalls');
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

  const openLightbox = (imageUrl, altText) => {
    if (!imageUrl) return;
    setLightboxImage(imageUrl);
    setLightboxAlt(altText || 'Stall image');
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxAlt('');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Exhibition Stalls</h1>
        <p className="text-gray-600">Explore all exhibition stalls and their details</p>
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
              placeholder="Search stalls..."
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
          const audioUrl = normalizeMediaUrl(booth.audioFile);
          return (
          <div key={booth._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
            <Link
              to={`/booths/${booth._id}`}
              className="block"
            >
              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={booth.name}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openLightbox(logoUrl, booth.name);
                    }}
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
            
            {/* Audio Player */}
            {audioUrl && (
              <div className="px-6 pb-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                  <FaMusic className="text-primary-600 flex-shrink-0" />
                  <audio
                    controls
                    className="w-full h-8"
                    style={{ maxHeight: '32px' }}
                    preload="none"
                  >
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {booths.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No stalls found</p>
        </div>
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-4 -right-4 bg-white text-gray-700 rounded-full p-2 shadow hover:bg-gray-100"
              aria-label="Close preview"
            >
              x
            </button>
            <img
              src={lightboxImage}
              alt={lightboxAlt}
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoothList;
