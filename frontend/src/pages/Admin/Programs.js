import React, { useState, useEffect, useCallback } from 'react';
import { programAPI } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaCalendar, FaClock } from 'react-icons/fa';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    speakers: [],
    status: 'published'
  });
  const [speakerForm, setSpeakerForm] = useState({ name: '', designation: '', photo: '' });

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await programAPI.getAllAdmin();
      setPrograms(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProgram) {
        await programAPI.update(editingProgram._id, formData);
        toast.success('Program updated successfully');
      } else {
        await programAPI.create(formData);
        toast.success('Program created successfully');
      }
      
      fetchPrograms();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save program');
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      date: new Date(program.date).toISOString().split('T')[0],
      startTime: program.startTime,
      endTime: program.endTime,
      speakers: program.speakers || [],
      status: program.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await programAPI.delete(id);
        toast.success('Program deleted successfully');
        fetchPrograms();
      } catch (error) {
        toast.error('Failed to delete program');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProgram(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      speakers: [],
      status: 'published'
    });
    setSpeakerForm({ name: '', designation: '', photo: '' });
  };

  const addSpeaker = () => {
    if (speakerForm.name && speakerForm.designation) {
      setFormData({
        ...formData,
        speakers: [...formData.speakers, { ...speakerForm }]
      });
      setSpeakerForm({ name: '', designation: '', photo: '' });
    } else {
      toast.error('Please fill in speaker name and designation');
    }
  };

  const removeSpeaker = (index) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.filter((_, i) => i !== index)
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Programs Management</h1>
          <p className="text-gray-600 mt-2">Manage exhibition programs and events</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
        >
          <FaPlus />
          <span>Add Program</span>
        </button>
      </div>

      {/* Programs List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speakers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {programs.map((program) => (
                <tr key={program._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{program.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{program.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <FaCalendar className="text-gray-400" />
                      <span>{formatDate(program.date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400" />
                      <span>{program.startTime} - {program.endTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {program.speakers?.length || 0} speaker(s)
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      program.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {program.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(program)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(program._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {programs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No programs found. Create your first program!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProgram ? 'Edit Program' : 'Add New Program'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Speakers Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Speakers</h3>
                
                <div className="space-y-3 mb-4">
                  {formData.speakers.map((speaker, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {speaker.photo && (
                          <img src={speaker.photo} alt={speaker.name} className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{speaker.name}</div>
                          <div className="text-sm text-gray-600">{speaker.designation}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpeaker(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Speaker Name"
                    value={speakerForm.name}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={speakerForm.designation}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, designation: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="url"
                    placeholder="Photo URL"
                    value={speakerForm.photo}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, photo: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addSpeaker}
                  className="mt-3 flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <FaPlus />
                  <span>Add Speaker</span>
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingProgram ? 'Update' : 'Create'} Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrograms;
