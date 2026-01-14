import React, { useState, useEffect } from 'react';
import { quizAPI, boothAPI } from '../../services/apiServices';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import parse from 'html-react-parser';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    boothId: '',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: ''
  });

  useEffect(() => {
    fetchBooths();
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBooth]);

  const fetchBooths = async () => {
    try {
      const response = await boothAPI.getAll();
      setBooths(response.data.data);
    } catch (error) {
      toast.error('Failed to load booths');
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = selectedBooth ? { boothId: selectedBooth } : {};
      const response = await quizAPI.getAllQuestions(params);
      setQuestions(response.data.data || []);
    } catch (error) {
      // Don't show error toast if it's just empty data (404 or empty response)
      if (error.response?.status !== 404) {
        console.error('Error loading questions:', error);
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.options.some(opt => !opt.trim())) {
      toast.error('All options must be filled');
      return;
    }

    if (!formData.boothId) {
      toast.error('Please select a booth');
      return;
    }

    try {
      // Transform data to match backend schema
      const questionData = {
        booth: formData.boothId,
        question: formData.questionText,
        options: formData.options.map((text, index) => ({
          text: text,
          isCorrect: index === formData.correctAnswer
        })),
        difficulty: formData.difficulty,
        explanation: formData.explanation
      };

      if (editingQuestion) {
        await quizAPI.updateQuestion(editingQuestion._id, questionData);
        toast.success('Question updated successfully');
      } else {
        await quizAPI.createQuestion(questionData);
        toast.success('Question created successfully');
      }
      
      fetchQuestions();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      boothId: question.booth?._id || question.booth,
      questionText: question.question,
      options: question.options.map(opt => opt.text || opt),
      correctAnswer: question.options.findIndex(opt => opt.isCorrect),
      difficulty: question.difficulty,
      explanation: question.explanation || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await quizAPI.deleteQuestion(id);
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({...formData, options: newOptions});
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData({
      boothId: '',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      explanation: ''
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
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
          <h1 className="text-2xl font-bold text-gray-800">Manage Questions</h1>
          <p className="text-gray-600">Create and manage quiz questions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FaPlus />
          <span>Add Question</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Booth</label>
        <select
          value={selectedBooth}
          onChange={(e) => setSelectedBooth(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Booths</option>
          {booths.map((booth) => (
            <option key={booth._id} value={booth._id}>
              {booth.name}
            </option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No questions found. Create your first question!</p>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-lg font-bold text-gray-800">
                        {parse(question.question || question.questionText || '')}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        getDifficultyColor(question.difficulty)
                      }`}>
                        {question.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Booth: <span className="font-semibold">{question.booth?.name || question.boothId?.name || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        option.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {option.isCorrect ? (
                          <FaCheckCircle className="text-green-600" />
                        ) : (
                          <FaTimesCircle className="text-gray-400" />
                        )}
                        <span className="font-medium text-gray-700">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <div className="text-gray-800">{parse(option.text || option)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-900">
                      <span className="font-semibold">Explanation:</span> {parse(question.explanation)}
                    </div>
                  </div>
                )}
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
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Booth Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Booth *</label>
                <select
                  value={formData.boothId}
                  onChange={(e) => setFormData({...formData, boothId: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose a booth</option>
                  {booths.map((booth) => (
                    <option key={booth._id} value={booth._id}>
                      {booth.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                <ReactQuill
                  theme="snow"
                  value={formData.questionText}
                  onChange={(value) => setFormData({...formData, questionText: value})}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  className="bg-white"
                  style={{ height: '120px', marginBottom: '50px' }}
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                <div className="space-y-4">
                  {formData.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={formData.correctAnswer === index}
                          onChange={() => setFormData({...formData, correctAnswer: index})}
                          className="w-5 h-5 text-primary-600"
                        />
                        <span className="font-medium text-gray-700">
                          Option {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={option}
                        onChange={(value) => handleOptionChange(index, value)}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            ['link'],
                            ['clean']
                          ]
                        }}
                        className="bg-white"
                        style={{ height: '80px', marginBottom: '50px' }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Select the radio button to mark the correct answer
                </p>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                <div className="flex space-x-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, difficulty: level})}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                        formData.difficulty === level
                          ? level === 'easy'
                            ? 'bg-green-600 text-white'
                            : level === 'medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                <ReactQuill
                  theme="snow"
                  value={formData.explanation}
                  onChange={(value) => setFormData({...formData, explanation: value})}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  className="bg-white"
                  placeholder="Provide an explanation for the correct answer"
                  style={{ height: '120px', marginBottom: '50px' }}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
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

export default AdminQuestions;
