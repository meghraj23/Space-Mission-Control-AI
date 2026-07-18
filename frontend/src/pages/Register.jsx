import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { KeyRound, Mail, UserPlus, Orbit, ShieldAlert, User } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Guest');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        role
      });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: res.data.data._id,
          username: res.data.data.username,
          email: res.data.data.email,
          role: res.data.data.role,
          profilePic: '',
          settings: { theme: 'dark', notifications: true, refreshRate: 1000 }
        }));
        navigate('/dashboard');
      } else {
        setError(res.data.message || 'Registration failed');
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
            <Orbit className="h-10 w-10 text-accentPurple animate-spin-slow" />
            <h1 className="text-2xl font-black font-orbitron uppercase tracking-widest text-gradient-cyan">
              DECK AUTHORIZATION
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              CREATE SECURE OPERATOR LINK CREDENTIALS
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 border border-accentDanger/40 bg-accentDanger/10 p-3 rounded-lg text-xs text-accentDanger font-mono">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 font-orbitron uppercase tracking-wider">username</label>
              <div className="flex items-center gap-2 bg-spaceBg/60 border border-accentCyan/10 focus-within:border-accentCyan/40 px-3.5 py-2.5 rounded-lg transition-all">
                <User className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. jdoe_flight"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-white font-mono placeholder-gray-600"
                />
              </div>
            </div>

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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 font-orbitron uppercase tracking-wider">operational role</label>
              <div className="flex items-center gap-2 bg-spaceBg/60 border border-accentCyan/10 focus-within:border-accentCyan/40 px-2 py-1 rounded-lg transition-all">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-white font-mono py-1.5 px-2 bg-spaceCard cursor-pointer"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Operator">Operator (Manage Flight/Sats)</option>
                  <option value="Scientist">Scientist (Analyze/Register Sats)</option>
                  <option value="Guest">Guest (Read Only)</option>
                </select>
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
                  <span>REQUEST AUTHORIZATION LINK</span>
                  <UserPlus className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 font-mono">
            Already authorized?{' '}
            <Link to="/login" className="text-accentCyan hover:underline">
              Establish Link Connection
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Register;
