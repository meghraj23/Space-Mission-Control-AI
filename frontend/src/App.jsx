import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

// Component Imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import NotificationCenter from './components/NotificationCenter';
import Sidebar from './components/Sidebar';

// Page Imports
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LaunchCenter from './pages/LaunchCenter';
import SatelliteMonitoring from './pages/SatelliteMonitoring';
import AstronautManagement from './pages/AstronautManagement';
import AiAssistant from './pages/AiAssistant';
import LiveTelemetry from './pages/LiveTelemetry';
import SpaceWeather from './pages/SpaceWeather';
import MissionAnalytics from './pages/MissionAnalytics';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import SettingsPage from './pages/Settings';
import NotFound from './pages/NotFound';

// New Advanced Module Pages
import MissionControl from './pages/MissionControl';
import PlanetExplorer from './pages/PlanetExplorer';
import RoverControl from './pages/RoverControl';
import MissionArchive from './pages/MissionArchive';
import SystemHealth from './pages/SystemHealth';
import SecurityDashboard from './pages/SecurityDashboard';
import Calendar from './pages/Calendar';
import MissionDocuments from './pages/MissionDocuments';

const API_URL = 'http://localhost:5000';

function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState({});
  const [socket, setSocket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Establish WebSocket Connection
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setSocketConnected(true);
      console.log('[Socket] Connected to telemetry command server.');
    });

    newSocket.on('disconnect', () => {
      setSocketConnected(false);
      console.log('[Socket] Disconnected from telemetry server.');
    });

    newSocket.on('notification_alert', (newAlert) => {
      setNotifications((prev) => [newAlert, ...prev]);
    });

    newSocket.on('telemetry_update', (data) => {
      setLiveTelemetry((prev) => ({
        ...prev,
        [data.missionId]: data.telemetry
      }));
    });

    return () => newSocket.close();
  }, []);

  // 2. Fetch Initial Notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load initial notifications.', err.message);
      }
    };
    fetchNotifications();
  }, []);

  // Keyboard shortcut listener for Command Palette (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children, roles = [] }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      return <Navigate to="/login" replace />;
    }

    try {
      const user = JSON.parse(userStr);
      if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-spaceBg text-white relative overflow-x-hidden">
        {/* Starfield Backdrop */}
        <div className="fixed inset-0 star-bg pointer-events-none z-0"></div>

        {/* Global Navigation */}
        <Navbar
          socketConnected={socketConnected}
          notifications={notifications}
          onOpenNotifications={() => setIsNotifOpen(true)}
          onOpenCommandPalette={() => setIsCommandOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content Pane */}
        <div className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300 ${
          isSidebarOpen ? 'md:pl-64' : 'pl-0'
        }`}>
          {/* Command Search Overlay */}
          <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

          {/* Real-time Notification Panel */}
          <NotificationCenter
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
          />

          {/* Pages Content */}
          <main className="flex-1 w-full pt-20 pb-12 flex flex-col overflow-y-auto relative">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Operator dashboard routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard liveTelemetry={liveTelemetry} />
                </ProtectedRoute>
              } />
              <Route path="/control-room" element={
                <ProtectedRoute>
                  <MissionControl />
                </ProtectedRoute>
              } />
              <Route path="/launches" element={
                <ProtectedRoute>
                  <LaunchCenter />
                </ProtectedRoute>
              } />
              <Route path="/satellites" element={
                <ProtectedRoute>
                  <SatelliteMonitoring socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/crew" element={
                <ProtectedRoute>
                  <AstronautManagement socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/ai" element={
                <ProtectedRoute>
                  <AiAssistant />
                </ProtectedRoute>
              } />
              <Route path="/telemetry" element={
                <ProtectedRoute>
                  <LiveTelemetry socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/weather" element={
                <ProtectedRoute>
                  <SpaceWeather />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <MissionAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/explorer" element={
                <ProtectedRoute>
                  <PlanetExplorer />
                </ProtectedRoute>
              } />
              <Route path="/rover" element={
                <ProtectedRoute>
                  <RoverControl />
                </ProtectedRoute>
              } />
              <Route path="/archive" element={
                <ProtectedRoute>
                  <MissionArchive />
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
              <Route path="/documents" element={
                <ProtectedRoute>
                  <MissionDocuments />
                </ProtectedRoute>
              } />
              <Route path="/health" element={
                <ProtectedRoute>
                  <SystemHealth />
                </ProtectedRoute>
              } />
              <Route path="/security" element={
                <ProtectedRoute>
                  <SecurityDashboard />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Admin control route */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />

              {/* fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
