import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { KeyRound, Mail, LogIn, Orbit, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: res.data.data._id,
          username: res.data.data.username,
          email: res.data.data.email,
          role: res.data.data.role,
          profilePic: res.data.data.profilePic,
          settings: res.data.data.settings
        }));
        navigate('/dashboard');
      } else {
        setError(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection to control server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 py-16 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard glow className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Orbit className="h-10 w-10 text-accentCyan animate-spin-slow" />
            <h1 className="text-2xl font-black font-orbitron uppercase tracking-widest text-gradient-cyan">
              USER AUTHENTICATION
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              SECURE DECK TERMINAL FEED &bull; PORTAL CODES REQUIRED
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 border border-accentDanger/40 bg-accentDanger/10 p-3 rounded-lg text-xs text-accentDanger font-mono">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 font-orbitron uppercase tracking-wider">email address</label>
              <div className="flex items-center gap-2 bg-spaceBg/60 border border-accentCyan/10 focus-within:border-accentCyan/40 px-3.5 py-2.5 rounded-lg transition-all">
                <Mail className="h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. operator@missioncontrol.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-white font-mono placeholder-gray-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 font-orbitron uppercase tracking-wider">terminal password</label>
              <div className="flex items-center gap-2 bg-spaceBg/60 border border-accentCyan/10 focus-within:border-accentCyan/40 px-3.5 py-2.5 rounded-lg transition-all">
                <KeyRound className="h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-white font-mono placeholder-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber-primary w-full py-3 mt-2 flex items-center justify-center gap-2 text-sm tracking-widest disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <>
                  <span>DECRYPT SECURITY LOCK</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick presets helper */}
          <div className="border-t border-white/5 pt-4 text-center">
            <p className="text-[10px] text-gray-600 font-mono">
              OPERATIONAL PRESET LOGINS FOR EVALUATION:
            </p>
            <div className="flex justify-center gap-4 mt-2 text-[10px] text-accentCyan font-mono">
              <button onClick={() => { setEmail('admin@missioncontrol.gov'); setPassword('admin123'); }} className="hover:underline">Admin (admin123)</button>
              <button onClick={() => { setEmail('operator@missioncontrol.gov'); setPassword('guest123'); }} className="hover:underline">Operator (guest123)</button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 font-mono">
            Unregistered Operator?{' '}
            <Link to="/register" className="text-accentCyan hover:underline">
              Request Deck Authorization
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
