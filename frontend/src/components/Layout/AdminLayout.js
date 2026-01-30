import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTachometerAlt, FaStore, FaQuestionCircle, 
  FaCommentAlt, FaBell, FaSignOutAlt, FaArrowLeft, 
  FaClipboardList, FaCog, FaCalendarAlt, FaImages, FaUsers
} from 'react-icons/fa';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { path: '/admin/booths', label: 'Stalls', icon: <FaStore /> },
    { path: '/admin/gallery', label: 'Gallery', icon: <FaImages /> },
    { path: '/admin/programs', label: 'Programs', icon: <FaCalendarAlt /> },
    { path: '/admin/questions', label: 'Questions', icon: <FaQuestionCircle /> },
    { path: '/admin/quiz-results', label: 'Quiz Results', icon: <FaClipboardList /> },
    { path: '/admin/quiz-settings', label: 'Quiz Settings', icon: <FaCog /> },
    { path: '/admin/feedback', label: 'Feedback', icon: <FaCommentAlt /> },
    { path: '/admin/notifications', label: 'Notifications', icon: <FaBell /> },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col h-screen flex-shrink-0">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2 mt-auto">
          <Link
            to="/home"
            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition"
          >
            <FaArrowLeft />
            <span>Back to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
