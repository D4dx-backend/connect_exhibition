import React, { useState, useEffect } from 'react';
import { programAPI } from '../services/apiServices';
import { toast } from 'react-toastify';
import { FaClock, FaUser, FaFilter } from 'react-icons/fa';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(true);

  useEffect(() => {
    fetchPrograms();
    // eslint-disable-next-line
  }, [filterDate, showUpcoming]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) {
        params.date = filterDate;
      } else if (showUpcoming) {
        params.upcoming = 'true';
      }
      
      const response = await programAPI.getAll(params);
      setPrograms(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupProgramsByDate = () => {
    const grouped = {};
    programs.forEach(program => {
      const dateKey = new Date(program.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(program);
    });
    return grouped;
  };

  const groupedPrograms = groupProgramsByDate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Programs & Events</h1>
        <p className="text-white drop-shadow">View all scheduled programs and events</p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setShowUpcoming(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilterDate('');
                setShowUpcoming(true);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                showUpcoming && !filterDate
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-600'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => {
                setFilterDate('');
                setShowUpcoming(false);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                !showUpcoming && !filterDate
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-600'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Programs List */}
      {Object.keys(groupedPrograms).length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-gray-500 text-lg">No programs found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPrograms).map(([date, datePrograms]) => (
            <div key={date}>
              <h2 className="text-2xl font-bold text-white mb-4 drop-shadow">
                {formatDate(datePrograms[0].date)}
              </h2>
              <div className="space-y-4">
                {datePrograms.map((program) => (
                  <div key={program._id} className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-morph">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Time Badge */}
                      <div className="flex-shrink-0">
                        <div className="bg-primary-600 text-white rounded-xl p-4 text-center min-w-[120px]">
                          <FaClock className="mx-auto mb-2 text-2xl" />
                          <div className="text-sm font-semibold">
                            {formatTime(program.startTime)}
                          </div>
                          <div className="text-xs opacity-90">to</div>
                          <div className="text-sm font-semibold">
                            {formatTime(program.endTime)}
                          </div>
                        </div>
                      </div>

                      {/* Program Details */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {program.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {program.description}
                        </p>

                        {/* Speakers */}
                        {program.speakers && program.speakers.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <FaUser className="mr-2" />
                              Speakers
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {program.speakers.map((speaker, index) => (
                                <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                                  {speaker.photo ? (
                                    <img
                                      src={speaker.photo}
                                      alt={speaker.name}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                      {speaker.name.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-gray-900">{speaker.name}</div>
                                    <div className="text-sm text-gray-600">{speaker.designation}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Programs;
