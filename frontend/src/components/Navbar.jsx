import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Orbit, Bell, Shield, LogOut, Terminal, User, Settings as SettingsIcon } from 'lucide-react';

const Navbar = ({ socketConnected, notifications, onOpenNotifications, onOpenCommandPalette }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Launch Center', path: '/launches' },
    { name: 'Satellites', path: '/satellites' },
    { name: 'Crew Vitals', path: '/crew' },
    { name: 'AI Control', path: '/ai' },
    { name: 'Live Link', path: '/telemetry' },
    { name: 'Space Weather', path: '/weather' },
    { name: 'Analytics', path: '/analytics' }
  ];

  const isActive = (path) => location.pathname === path;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-spaceBg/60 backdrop-blur-md border-b border-accentCyan/10 px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2">
        <Orbit className="h-7 w-7 text-accentCyan animate-spin-slow" />
        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-cyan-purple tracking-widest uppercase">
          Mission Control
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-semibold tracking-wider transition-colors duration-200 uppercase ${
              isActive(link.path)
                ? 'text-accentCyan border-b border-accentCyan pb-1'
                : 'text-gray-400 hover:text-accentCyan'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="hidden sm:flex items-center gap-1.5 bg-spaceCard/60 border border-white/5 py-1 px-3 rounded-full text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-accentCyan cyber-pulse-cyan' : 'bg-accentDanger cyber-pulse-danger'}`}></span>
          <span className={socketConnected ? 'text-accentCyan' : 'text-accentDanger'}>
            {socketConnected ? 'LINK ACQUIRED' : 'LINK OFFLINE'}
          </span>
        </div>

        {/* Cmd Palette Shortcut */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-1 bg-spaceCard/80 border border-accentCyan/20 hover:border-accentCyan/40 py-1 px-2.5 rounded text-xs font-mono text-gray-400 hover:text-accentCyan transition-all"
        >
          <Terminal className="h-3 w-3" />
          <span>Cmd K</span>
        </button>

        {/* Notifications Alert */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 bg-spaceCard border border-white/10 rounded-full hover:border-accentCyan/40 text-gray-300 hover:text-accentCyan transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accentDanger text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {currentUser ? (
          <div className="relative group flex items-center gap-2">
            <button className="flex items-center gap-2 focus:outline-none">
              {currentUser.profilePic ? (
                <img
                  src={currentUser.profilePic}
                  alt={currentUser.username}
                  className="h-8 w-8 rounded-full border border-accentCyan/30 object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full border border-accentCyan/30 bg-spaceCard flex items-center justify-center text-accentCyan text-sm font-bold font-mono">
                  {currentUser.username[0].toUpperCase()}
                </div>
              )}
            </button>

            {/* User Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-spaceCard/95 border border-accentCyan/20 rounded-lg shadow-2xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 backdrop-blur-md">
              <div className="px-4 py-2 border-b border-white/5">
                <p className="text-sm font-semibold text-white truncate">@{currentUser.username}</p>
                <p className="text-xs text-accentCyan font-mono">{currentUser.role}</p>
              </div>
              
              {currentUser.role === 'Admin' && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-accentCyan/10 hover:text-accentCyan transition-colors">
                  <Shield className="h-4 w-4" />
                  <span>Admin Command</span>
                </Link>
              )}

              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-accentCyan/10 hover:text-accentCyan transition-colors">
                <SettingsIcon className="h-4 w-4" />
                <span>Control Deck</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accentDanger hover:bg-accentDanger/10 transition-colors text-left border-t border-white/5"
              >
                <LogOut className="h-4 w-4" />
                <span>Decouple User</span>
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold border border-accentCyan hover:bg-accentCyan/10 text-accentCyan rounded transition-all font-orbitron uppercase tracking-wider"
          >
            Authenticate
          </Link>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-1 bg-spaceCard border border-white/10 rounded text-gray-300 hover:text-accentCyan transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-spaceBg/95 border-b border-accentCyan/20 py-4 px-6 flex flex-col gap-3 lg:hidden backdrop-blur-lg z-50">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-sm font-semibold tracking-wider py-2 uppercase ${
                isActive(link.path) ? 'text-accentCyan' : 'text-gray-400 hover:text-accentCyan'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!currentUser && (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-center py-2 border border-accentCyan text-accentCyan rounded text-sm font-semibold font-orbitron"
            >
              AUTHENTICATE
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
