import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const AdminGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    isActive: true
  });

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await galleryAPI.getAllAdmin();
      setGalleryItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingItem && imageFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    
    if (editingItem && uploadedImages.length === 0 && imageFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let imageUrls = [...uploadedImages];

      // Upload new images if provided
      if (imageFiles.length > 0) {
        const uploadFormData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) {
          uploadFormData.append('images', imageFiles[i]);
        }
        
        try {
          const uploadResponse = await galleryAPI.uploadImages(uploadFormData);
          imageUrls = [...imageUrls, ...uploadResponse.data.data.images];
          toast.success('Images uploaded successfully');
        } catch (uploadError) {
          toast.error('Failed to upload images: ' + (uploadError.response?.data?.message || uploadError.message));
          setSubmitting(false);
          return;
        }
      }

      const galleryData = {
        images: imageUrls,
        isActive: formData.isActive
      };
      
      if (editingItem) {
        await galleryAPI.update(editingItem._id, galleryData);
        toast.success('Gallery item updated successfully');
      } else {
        await galleryAPI.create(galleryData);
        toast.success('Gallery item created successfully');
      }
      
      fetchGalleryItems();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save gallery item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      isActive: item.isActive
    });
    setUploadedImages(item.images || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    
    try {
      await galleryAPI.delete(id);
      toast.success('Gallery item deleted successfully');
      fetchGalleryItems();
    } catch (error) {
      toast.error('Failed to delete gallery item');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      isActive: true
    });
    setImageFiles([]);
    setUploadedImages([]);
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
          <h1 className="text-2xl font-bold text-gray-800">Home Page Gallery</h1>
          <p className="text-gray-600">Manage gallery slider on the home page</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FaPlus />
          <span>Add Gallery</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-48">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt="Gallery"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FaImage className="text-gray-400 text-4xl" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {item.images?.length || 0} image(s)
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  item.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition"
                >
                  <FaEdit className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
                >
                  <FaTrash className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {galleryItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No gallery items found. Create your first gallery!
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-20">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingItem ? 'Edit Gallery' : 'Create New Gallery'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700" disabled={submitting}>
                <FaTimes size={24} />
              </button>
            </div>

            {/* Loading Overlay */}
            {submitting && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50 rounded-xl">
                <DotLottieReact
                  src="https://lottie.host/5f3b2e2f-d9de-4297-ae97-43f22ca8b8ba/iePEFUUzpk.lottie"
                  loop
                  autoplay
                  style={{ width: '250px', height: '250px' }}
                />
                <p className="mt-4 text-gray-700 font-medium text-lg">
                  {editingItem ? 'Updating gallery...' : 'Creating gallery...'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaImage className="inline mr-2" />Gallery Images
                </label>
                
                {/* Display already uploaded images (in edit mode) */}
                {uploadedImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-blue-600 mb-2">
                      Current: {uploadedImages.length} image(s)
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Uploaded ${idx + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = uploadedImages.filter((_, i) => i !== idx);
                              setUploadedImages(newImages);
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
                    setImageFiles(files);
                  }}
                  className="w-full text-sm"
                  disabled={submitting}
                />
                
                {/* Display newly selected images */}
                {imageFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-green-600 mb-2">
                      {imageFiles.length} new image(s) selected
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {imageFiles.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected ${idx + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = imageFiles.filter((_, i) => i !== idx);
                              setImageFiles(newFiles);
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

              {/* Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 text-primary-600"
                  disabled={submitting}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (Display on home page)
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {editingItem ? 'Update Gallery' : 'Create Gallery'}
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

export default AdminGallery;
