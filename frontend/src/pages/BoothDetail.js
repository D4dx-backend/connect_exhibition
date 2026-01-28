import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { boothAPI } from '../services/apiServices';
import { normalizeMediaUrl } from '../utils/media';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import parse, { domToReact } from 'html-react-parser';
import { 
  FaBookmark, FaRegBookmark, FaCheckCircle, FaArrowLeft, 
  FaArrowRight, FaPlay, FaPause, FaDownload, FaExternalLinkAlt 
} from 'react-icons/fa';

const BoothDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [booth, setBooth] = useState(null);
  const [allBooths, setAllBooths] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const audioRef = React.useRef(null);

  const fetchAllBooths = useCallback(async () => {
    try {
      const response = await boothAPI.getAll();
      const booths = response.data.data || [];
      setAllBooths(booths);
    } catch (error) {
      console.error('Failed to load booths list');
    }
  }, []);

  const fetchBoothDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await boothAPI.getById(id);
      const boothData = response.data.data;
      setBooth(boothData);
      
      // Find current booth index
      const index = allBooths.findIndex(b => b._id === id);
      setCurrentIndex(index);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load booth details';
      toast.error(message);
      navigate('/booths');
    } finally {
      setLoading(false);
    }
  }, [allBooths, id, navigate]);

  const markAsVisited = useCallback(async () => {
    try {
      await boothAPI.markAsVisited(id);
    } catch (error) {
      console.error('Failed to mark as visited');
    }
  }, [id]);

  useEffect(() => {
    fetchAllBooths();
  }, [fetchAllBooths]);

  useEffect(() => {
    if (allBooths.length > 0) {
      fetchBoothDetail();
      if (isAuthenticated) {
        markAsVisited();
      }
    }
  }, [allBooths.length, fetchBoothDetail, isAuthenticated, markAsVisited]);
  console.log(allBooths.length);

  useEffect(() => {
    if (booth && user) {
      setIsBookmarked(user.bookmarkedBooths?.some(b => b._id === booth._id || b === booth._id));
      setIsVisited(user.visitedBooths?.some(v => v.booth?._id === booth._id || v.booth === booth._id));
    }
  }, [booth, user]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to bookmark booths');
      navigate('/login');
      return;
    }

    try {
      const response = await boothAPI.toggleBookmark(id);
      setIsBookmarked(response.data.bookmarked);
      toast.success(response.data.bookmarked ? 'Booth bookmarked!' : 'Bookmark removed');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  // Extract YouTube video ID from URL
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

  // Gallery navigation functions
  const nextGalleryImage = () => {
    if (booth?.galleryImages && booth.galleryImages.length > 0) {
      setCurrentGalleryIndex((prev) => 
        prev === booth.galleryImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevGalleryImage = () => {
    if (booth?.galleryImages && booth.galleryImages.length > 0) {
      setCurrentGalleryIndex((prev) => 
        prev === 0 ? booth.galleryImages.length - 1 : prev - 1
      );
    }
  };

  const openLightbox = (imageUrl) => {
    if (!imageUrl) return;
    setLightboxImage(imageUrl);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const handlePreviousBooth = () => {
    if (currentIndex > 0) {
      const prevBooth = allBooths[currentIndex - 1];
      navigate(`/booths/${prevBooth._id}`);
      window.scrollTo(0, 0);
    }
  };

  const handleNextBooth = () => {
    if (currentIndex < allBooths.length - 1) {
      const nextBooth = allBooths[currentIndex + 1];
      navigate(`/booths/${nextBooth._id}`);
      window.scrollTo(0, 0);
    }
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allBooths.length - 1;

  const normalizeHtml = (input) => {
    if (!input || typeof input !== 'string') return '';

    let value = input;
    // If HTML is stored escaped (e.g., &lt;h1&gt;), decode entities.
    for (let i = 0; i < 2; i++) {
      if (!/[&](lt|gt|amp|quot|#\d+|#x[\da-fA-F]+);/.test(value)) break;
      const textarea = document.createElement('textarea');
      textarea.innerHTML = value;
      const decoded = textarea.value;
      if (decoded === value) break;
      value = decoded;
    }

    // If a full HTML document/page was pasted, extract head + body to preserve styles.
    if (/[<](html|head|body|title)[\s>]/i.test(value)) {
      try {
        const doc = new DOMParser().parseFromString(value, 'text/html');
        
        // Extract style blocks from head
        const styles = Array.from(doc.querySelectorAll('style'))
          .map(s => s.outerHTML)
          .join('\n');
        
        // Get body content
        const bodyHtml = doc?.body?.innerHTML?.trim() || '';
        
        // Combine styles + body
        value = styles + bodyHtml;
      } catch (_) {
        // ignore
      }
    }

    // Remove only dangerous blocks, keep style tags
    value = value
      .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
      .replace(/<\s*title[^>]*>[\s\S]*?<\s*\/\s*title\s*>/gi, '')
      .trim();

    return value;
  };

  const descriptionHtml = normalizeHtml(booth?.description) || '<p>No description available</p>';
  const descriptionParseOptions = {
    replace: (domNode) => {
      const name = domNode?.name;

      // Drop document-level / unsafe tags if a full HTML page was pasted.
      if (name === 'title' || name === 'script' || name === 'meta' || name === 'link') {
        return <></>;
      }
      
      // Keep style tags - they're safe and needed for custom styling
      if (name === 'style') {
        return undefined; // Let html-react-parser handle it normally
      }

      // Unwrap html/head/body and render their children.
      if (name === 'html' || name === 'head' || name === 'body') {
        return <>{domToReact(domNode.children || [], descriptionParseOptions)}</>;
      }

      if (name === 'pre') {
        return (
          <pre className="whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto text-sm text-gray-800">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </pre>
        );
      }

      if (name === 'code') {
        return (
          <code className="break-words bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[0.9em]">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </code>
        );
      }

      if (name === 'img' && domNode?.attribs) {
        const { src, alt } = domNode.attribs;
        if (!src) return <></>;
        return (
          <img
            src={src}
            alt={alt || ''}
            className="max-w-full h-auto rounded-xl"
            loading="lazy"
          />
        );
      }

      if (name === 'a' && domNode?.attribs) {
        const href = domNode.attribs.href;
        if (!href) return undefined;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline break-words"
          >
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </a>
        );
      }

      // Style headings
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(name)) {
        const sizes = { h1: 'text-3xl', h2: 'text-2xl', h3: 'text-xl', h4: 'text-lg', h5: 'text-base', h6: 'text-sm' };
        return (
          <div className={`${sizes[name]} font-bold text-gray-800 mt-6 mb-3 first:mt-0`}>
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </div>
        );
      }

      // Style paragraphs
      if (name === 'p') {
        return (
          <p className="mb-4 text-gray-700 leading-relaxed">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </p>
        );
      }

      // Style lists
      if (name === 'ul') {
        return (
          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </ul>
        );
      }

      if (name === 'ol') {
        return (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </ol>
        );
      }

      if (name === 'li') {
        return (
          <li className="ml-4">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </li>
        );
      }

      // Style blockquotes
      if (name === 'blockquote') {
        return (
          <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-gray-600 bg-gray-50 rounded">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </blockquote>
        );
      }

      // Style tables
      if (name === 'table') {
        return (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-300 rounded-lg">
              {domToReact(domNode.children || [], descriptionParseOptions)}
            </table>
          </div>
        );
      }

      if (name === 'thead') {
        return (
          <thead className="bg-gray-100">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </thead>
        );
      }

      if (name === 'tbody') {
        return (
          <tbody className="divide-y divide-gray-200">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </tbody>
        );
      }

      if (name === 'tr') {
        return (
          <tr>
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </tr>
        );
      }

      if (name === 'th') {
        return (
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border border-gray-300">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </th>
        );
      }

      if (name === 'td') {
        return (
          <td className="px-4 py-2 text-sm text-gray-700 border border-gray-300">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </td>
        );
      }

      // Style horizontal rules
      if (name === 'hr') {
        return <hr className="my-6 border-gray-300" />;
      }

      // Style strong/bold
      if (name === 'strong' || name === 'b') {
        return (
          <strong className="font-semibold text-gray-900">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </strong>
        );
      }

      // Style emphasis/italic
      if (name === 'em' || name === 'i') {
        return (
          <em className="italic">
            {domToReact(domNode.children || [], descriptionParseOptions)}
          </em>
        );
      }

      return undefined;
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!booth) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Booth not found</p>
        <Link to="/booths" className="text-primary-600 hover:underline mt-4 inline-block">
          ← Back to Booths
        </Link>
      </div>
    );
  }

  const logoUrl = normalizeMediaUrl(booth?.logo);
  const audioUrl = normalizeMediaUrl(booth?.audioFile);
  const videoUrl = normalizeMediaUrl(booth?.videoFile);

  return (
    <div className="fade-in max-w-4xl mx-auto">
      {/* Header with Navigation */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => navigate('/booths')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition"
        >
          <FaArrowLeft />
          <span>Back to Booths</span>
        </button>

        <div className="flex items-center space-x-4">
          {isVisited && (
            <div className="flex items-center space-x-2 text-green-600">
              <FaCheckCircle />
              <span className="text-sm">Visited</span>
            </div>
          )}
          
          <button
            onClick={handleBookmark}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              isBookmarked
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-600'
            }`}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Booth Navigation */}
      <div className="mb-6 flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <button
          onClick={handlePreviousBooth}
          disabled={!hasPrevious}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            hasPrevious
              ? 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaArrowLeft />
          <span>Previous Booth</span>
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Booth {currentIndex + 1} of {allBooths.length}
          </span>
        </div>

        <button
          onClick={handleNextBooth}
          disabled={!hasNext}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            hasNext
              ? 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Next Booth</span>
          <FaArrowRight />
        </button>
      </div>

      {/* Booth Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center p-8">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={booth.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-white text-8xl font-bold">{booth.name[0]}</span>
          )}
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{booth.name}</h1>
          <h2 className="text-xl text-gray-600 mb-4">{booth.title}</h2>

          {booth.metadata?.category && (
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {booth.metadata.category}
            </span>
          )}

          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
            <span>👁️ {booth.visitCount} visits</span>
            <span>🔖 {booth.bookmarkCount} bookmarks</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">About</h3>
        <div className="booth-description max-w-none text-gray-700 leading-relaxed overflow-hidden">
          {parse(descriptionHtml, descriptionParseOptions)}
        </div>
      </div>

      {/* Audio Section */}
      {audioUrl && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Audio</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAudio}
              className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
            >
              {audioPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
            </button>
            <div className="flex-1">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setAudioPlaying(false)}
                className="w-full"
                controls
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Section - YouTube Embed */}
      {videoUrl && extractYouTubeId(videoUrl) && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Video</h3>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <FaExternalLinkAlt />
              <span>Watch on YouTube</span>
            </a>
          </div>
          <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            ></iframe>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {booth?.galleryImages && booth.galleryImages.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Gallery</h3>
          <div className="relative">
            <img
              src={normalizeMediaUrl(booth.galleryImages[currentGalleryIndex])}
              alt={`Gallery ${currentGalleryIndex + 1}`}
              className="w-full h-96 object-cover rounded-lg cursor-zoom-in"
              onClick={() =>
                openLightbox(normalizeMediaUrl(booth.galleryImages[currentGalleryIndex]))
              }
            />
            
            {booth.galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevGalleryImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={nextGalleryImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition"
                >
                  <FaArrowRight />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  {currentGalleryIndex + 1} / {booth.galleryImages.length}
                </div>
              </>
            )}
          </div>
          
          {/* Gallery Thumbnails */}
          {booth.galleryImages.length > 1 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
              {booth.galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGalleryIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    index === currentGalleryIndex
                      ? 'border-primary-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={normalizeMediaUrl(image)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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
              alt="Gallery preview"
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Resources Section */}
      {booth.resources && booth.resources.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booth.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition group"
              >
                <div className="flex items-center space-x-3">
                  {resource.type === 'document' ? (
                    <FaDownload className="text-gray-400 group-hover:text-primary-600" />
                  ) : (
                    <FaExternalLinkAlt className="text-gray-400 group-hover:text-primary-600" />
                  )}
                  <span className="font-medium text-gray-700 group-hover:text-primary-600">
                    {resource.label}
                  </span>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-primary-600" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {booth.metadata?.contactInfo && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-2 text-gray-700">
            {booth.metadata.contactInfo.email && (
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href={`mailto:${booth.metadata.contactInfo.email}`}
                  className="text-primary-600 hover:underline"
                >
                  {booth.metadata.contactInfo.email}
                </a>
              </p>
            )}
            {booth.metadata.contactInfo.phone && (
              <p>
                <strong>Phone:</strong>{' '}
                <a
                  href={`tel:${booth.metadata.contactInfo.phone}`}
                  className="text-primary-600 hover:underline"
                >
                  {booth.metadata.contactInfo.phone}
                </a>
              </p>
            )}
            {booth.metadata.contactInfo.website && (
              <p>
                <strong>Website:</strong>{' '}
                <a
                  href={booth.metadata.contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {booth.metadata.contactInfo.website}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-8 flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <button
          onClick={handlePreviousBooth}
          disabled={!hasPrevious}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            hasPrevious
              ? 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaArrowLeft />
          <span>Previous Booth</span>
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Booth {currentIndex + 1} of {allBooths.length}
          </span>
        </div>

        <button
          onClick={handleNextBooth}
          disabled={!hasNext}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            hasNext
              ? 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Next Booth</span>
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default BoothDetail;
