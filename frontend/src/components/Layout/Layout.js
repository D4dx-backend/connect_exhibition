import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, FaStore, FaQuestionCircle, FaTrophy, 
  FaCommentAlt, FaBell, FaUser, FaBars, FaTimes, FaSignOutAlt, FaUserShield, FaBookmark, FaCalendarAlt
} from 'react-icons/fa';
import logo from '../../assets/connecta-logo.svg';

const Layout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: <FaHome /> },
    { path: '/booths', label: 'Booths', icon: <FaStore /> },
    { path: '/quiz', label: 'Quiz', icon: <FaQuestionCircle /> },
    { path: '/programs', label: 'Programs', icon: <FaCalendarAlt /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
    { path: '/feedback', label: 'Feedback', icon: <FaCommentAlt /> },
    { path: '/notifications', label: 'Info', icon: <FaBell /> },
  ];

  const authenticatedNavItems = isAuthenticated ? [
    ...navItems,
    { path: '/profile', label: 'Bookmarks', icon: <FaBookmark /> },
  ] : navItems;

  if (isLanding) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-dark text-white shadow-lg sticky top-0 z-50 transition-morph">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/home" className="flex items-center space-x-3 text-xl md:text-2xl font-bold">
              <img src={logo} alt="Connecta" className="h-10 w-10" />
              <span className="text-white">Connecta</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {authenticatedNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 hover:text-primary-200 transition"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 hover:text-primary-200 transition bg-primary-700 px-3 py-2 rounded-lg"
                >
                  <FaUserShield />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* App-bar actions (mobile-first) */}
              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    aria-label="Bookmarks"
                    title="Bookmarks"
                    className="glass rounded-full w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-morph"
                  >
                    <FaBookmark />
                  </Link>
                )}
                <Link
                  to="/notifications"
                  aria-label="Info"
                  title="Info"
                  className="glass rounded-full w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-morph"
                >
                  <FaBell />
                </Link>
              </div>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="hidden md:flex items-center space-x-2 hover:text-primary-200"
                  >
                    <FaUser />
                    <span>{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center space-x-2 hover:text-primary-200"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:block bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-2xl"
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-dark border-t border-white/10">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {authenticatedNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 py-2 hover:bg-primary-600 px-3 rounded transition"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 py-2 hover:bg-primary-600 px-3 rounded transition"
                  >
                    <FaUser />
                    <span>Profile</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 py-2 hover:bg-primary-600 px-3 rounded transition bg-primary-700"
                    >
                      <FaUserShield />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 py-2 hover:bg-primary-600 px-3 rounded transition"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-white/20 safe-bottom shadow-lg">
        <div className="flex justify-around items-center h-16">
          {(isAuthenticated ? authenticatedNavItems.slice(0, 5) : navItems.slice(0, 5)).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-700 hover:text-primary-600 transition-morph"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer (Desktop Only) */}
      <footer className="hidden md:block glass-dark text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2026 Connecta. All rights reserved.</p>
          <p className="text-sm opacity-80">
            Powered by <a href="https://d4dx.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-200 transition">d4dx.co</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
