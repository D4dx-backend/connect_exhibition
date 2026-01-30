import React, { useState, useEffect } from 'react';
import { boothAPI } from '../../services/apiServices';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaImage, 
  FaMusic, FaVideo, FaTimes, FaLink
} from 'react-icons/fa';

const AdminBooths = () => {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBooth, setEditingBooth] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    metadata: {
      tag: '',
      contactInfo: { email: '', phone: '', website: '' }
    },
    isPublished: true
  });
  const [logoFile, setLogoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploadedGalleryImages, setUploadedGalleryImages] = useState([]);
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ label: '', url: '', type: 'document' });
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  useEffect(() => {
    fetchBooths();
  }, []);

  // Function to extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  // Function to validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) return true; // Empty is valid
    return extractYouTubeId(url) !== null;
  };

  const fetchBooths = async () => {
    try {
      const response = await boothAPI.getAll();
      setBooths(response.data.data);
    } catch (error) {
      toast.error('Failed to load stalls');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate YouTube URL if provided
    if (videoUrl && !validateYouTubeUrl(videoUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let logoUrl = editingBooth?.logo || '';
      let audioFileUrl = editingBooth?.audioFile || audioUrl;
      let videoFileUrl = videoUrl;
      let galleryImageUrls = [...uploadedGalleryImages];

      // Upload files to DigitalOcean Spaces if provided
      if (logoFile || audioFile || galleryFiles.length > 0) {
        const uploadFormData = new FormData();
        if (logoFile) uploadFormData.append('logo', logoFile);
        if (audioFile) uploadFormData.append('audio', audioFile);
        
        // Add gallery images
        if (galleryFiles.length > 0) {
          for (let i = 0; i < galleryFiles.length; i++) {
            uploadFormData.append('galleryImages', galleryFiles[i]);
          }
        }
        
        try {
          const uploadResponse = await boothAPI.uploadMedia(uploadFormData);
          if (uploadResponse.data.data.logo) {
            logoUrl = uploadResponse.data.data.logo;
          }
          if (uploadResponse.data.data.audioFile) {
            audioFileUrl = uploadResponse.data.data.audioFile;
          }
          if (uploadResponse.data.data.galleryImages) {
            galleryImageUrls = [...galleryImageUrls, ...uploadResponse.data.data.galleryImages];
          }
          toast.success('Files uploaded successfully');
        } catch (uploadError) {
          toast.error('Failed to upload files: ' + (uploadError.response?.data?.message || uploadError.message));
          setSubmitting(false);
          return;
        }
      }

      // If audio URL is provided (not file), use it
      if (!audioFile && audioUrl) {
        audioFileUrl = audioUrl;
      }

      // Prepare booth data
      const normalizedResources = resources.map((resource) => ({
        ...resource,
        type: resource.type === 'pdf' ? 'document' : resource.type
      }));

      const boothData = {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        metadata: formData.metadata,
        isPublished: formData.isPublished,
        logo: logoUrl,
        audioFile: audioFileUrl,
        videoFile: videoFileUrl,
        galleryImages: galleryImageUrls,
        resources: normalizedResources
      };
      
      if (editingBooth) {
        await boothAPI.update(editingBooth._id, boothData);
        toast.success('Stall updated successfully');
      } else {
        await boothAPI.create(boothData);
        toast.success('Stall created successfully');
      }
      
      fetchBooths();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save stall');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (booth) => {
    setEditingBooth(booth);
    
    // Ensure metadata and contactInfo are properly initialized
    const metadata = booth.metadata || {};
    const contactInfo = metadata.contactInfo || { email: '', phone: '', website: '' };
    
    setFormData({
      name: booth.name,
      title: booth.title,
      description: booth.description,
      metadata: {
        tag: metadata.tag || '',
        contactInfo: contactInfo
      },
      isPublished: booth.isPublished
    });
    setResources(booth.resources || []);
    setAudioUrl(booth.audioFile || '');
    setVideoUrl(booth.videoFile || '');
    setUploadedGalleryImages(booth.galleryImages || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stall?')) return;
    
    try {
      await boothAPI.delete(id);
      toast.success('Stall deleted successfully');
      fetchBooths();
    } catch (error) {
      toast.error('Failed to delete stall');
    }
  };

  const addResource = () => {
    if (!newResource.label || !newResource.url) {
      toast.error('Please fill in resource label and URL');
      return;
    }
    setResources([...resources, { ...newResource }]);
    setNewResource({ label: '', url: '', type: 'document' });
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBooth(null);
    setFormData({
      name: '',
      title: '',
      description: '',
      metadata: {
        tag: '',
        contactInfo: { email: '', phone: '', website: '' }
      },
      isPublished: true
    });
    setLogoFile(null);
    setAudioFile(null);
    setAudioUrl('');
    setVideoUrl('');
    setGalleryFiles([]);
    setUploadedGalleryImages([]);
    setResources([]);
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
          <h1 className="text-2xl font-bold text-gray-800">Manage Stalls</h1>
          <p className="text-gray-600">Create and manage exhibition stalls</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FaPlus />
          <span>Add Stall</span>
        </button>
      </div>

      {/* Booths Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Title</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tag</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Stats</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {booths.map((booth) => (
              <tr key={booth._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{booth.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{booth.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {booth.metadata?.tag || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {booth.isPublished ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      <FaEye />
                      <span>Published</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                      <FaEyeSlash />
                      <span>Draft</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-xs text-gray-600">
                    <div>👁️ {booth.visitCount || 0}</div>
                    <div>🔖 {booth.bookmarkCount || 0}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(booth)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(booth._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {booths.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No Stalls found. Create your first stall!
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-20">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingBooth ? 'Edit Stall' : 'Create New Stall'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700" disabled={submitting}>
                <FaTimes size={24} />
              </button>
            </div>

            {/* Loading Overlay */}
            {submitting && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50 rounded-xl">
                <img
                  src="/loading.svg"
                  alt="Loading..."
                  style={{ width: '250px', height: '250px' }}
                />
                <p className="mt-4 text-gray-700 font-medium text-lg">
                  {editingBooth ? 'Updating stall...' : 'Creating stall...'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stall Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <button
                      type="button"
                      onClick={() => setIsHtmlMode(!isHtmlMode)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                    >
                      {isHtmlMode ? '📝 Visual Editor' : '</> Raw HTML'}
                    </button>
                  </div>
                  
                  {isHtmlMode ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      placeholder="Paste your raw HTML here..."
                    />
                  ) : (
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(value) => setFormData({...formData, description: value})}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          ['link', 'image'],
                          ['clean']
                        ]
                      }}
                      className="bg-white"
                      style={{ height: '200px', marginBottom: '50px' }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                  <input
                    type="text"
                    value={formData.metadata.tag}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: {...formData.metadata, tag: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Media Files */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800">Media Files</h3>
                
                <div className="space-y-4">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaImage className="inline mr-2" />Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                      className="w-full text-sm"
                    />
                    {editingBooth?.logo && (
                      <p className="text-xs text-gray-500 mt-1">Current: {editingBooth.logo.split('/').pop()}</p>
                    )}
                  </div>

                  {/* Audio - File or URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMusic className="inline mr-2" />Audio (File or URL)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          setAudioFile(e.target.files[0]);
                          setAudioUrl('');
                        }}
                        className="w-full text-sm"
                      />
                      <div className="text-center text-gray-500 text-sm">OR</div>
                      <input
                        type="url"
                        placeholder="https://example.com/audio.mp3"
                        value={audioUrl}
                        onChange={(e) => {
                          setAudioUrl(e.target.value);
                          setAudioFile(null);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    {editingBooth?.audioFile && (
                      <p className="text-xs text-gray-500 mt-1">Current: {editingBooth.audioFile.split('/').pop()}</p>
                    )}
                  </div>

                  {/* Video - YouTube URL only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaVideo className="inline mr-2" />YouTube Video URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                    </p>
                    {editingBooth?.videoFile && (
                      <p className="text-xs text-gray-500 mt-1">Current: {editingBooth.videoFile}</p>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaImage className="inline mr-2" />Gallery Images (up to 25)
                    </label>
                    
                    {/* Display already uploaded images (in edit mode) */}
                    {uploadedGalleryImages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-blue-600 mb-2">
                          Current: {uploadedGalleryImages.length} image(s) uploaded
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {uploadedGalleryImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`Uploaded ${idx + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = uploadedGalleryImages.filter((_, i) => i !== idx);
                                  setUploadedGalleryImages(newImages);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                disabled={submitting}
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* File input for new images */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 25) {
                          toast.warning('Maximum 25 images allowed');
                          setGalleryFiles(files.slice(0, 25));
                        } else {
                          setGalleryFiles(files);
                        }
                      }}
                      className="w-full text-sm"
                      disabled={submitting}
                    />
                    
                    {/* Display newly selected images */}
                    {galleryFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-green-600 mb-2">
                          {galleryFiles.length} new image(s) selected
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {galleryFiles.map((file, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Selected ${idx + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = galleryFiles.filter((_, i) => i !== idx);
                                  setGalleryFiles(newFiles);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                disabled={submitting}
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800">Resources</h3>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={newResource.label}
                    onChange={(e) => setNewResource({...newResource, label: e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={newResource.url}
                    onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="document">Document</option>
                    <option value="link">Link</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={addResource}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FaPlus />
                  </button>
                </div>

                {resources.length > 0 && (
                  <div className="space-y-2">
                    {resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FaLink className="text-primary-600" />
                          <div>
                            <div className="font-medium text-gray-800">{resource.label}</div>
                            <div className="text-sm text-gray-600">{resource.url}</div>
                          </div>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                            {resource.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeResource(index)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.metadata?.contactInfo?.email || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          contactInfo: {...(formData.metadata?.contactInfo || {}), email: e.target.value}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.metadata?.contactInfo?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          contactInfo: {...(formData.metadata?.contactInfo || {}), phone: e.target.value}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.metadata?.contactInfo?.website || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          contactInfo: {...(formData.metadata?.contactInfo || {}), website: e.target.value}
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Publish Status */}
              <div className="flex items-center space-x-3 border-t border-gray-200 pt-6">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="w-5 h-5 text-primary-600"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {editingBooth ? 'Update Stall' : 'Create Stall'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
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

export default AdminBooths;
