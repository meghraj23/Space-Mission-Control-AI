import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Sliders, Shield, Save, User, Bell } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Settings = () => {
  const [user, setUser] = useState({ username: '', email: '', role: 'Guest' });
  const [refreshRate, setRefreshRate] = useState(1000);
  const [notifications, setNotifications] = useState(true);
  const [orbitThreshold, setOrbitThreshold] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      if (parsed.settings) {
        setRefreshRate(parsed.settings.refreshRate || 1000);
        setNotifications(parsed.settings.notifications !== false);
      }
    }
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put('http://localhost:5000/api/auth/settings', {
        refreshRate,
        notifications
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        // Update local storage user settings
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          parsed.settings = res.data.data;
          localStorage.setItem('user', JSON.stringify(parsed));
          setUser(parsed);
        }
        alert('Deck parameters updated successfully.');
      }
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            CONTROL DECK SETTINGS
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">TELEMETRY POLLING FREQUENCIES &bull; USER METADATA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: General Settings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard glow className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-accentCyan border-b border-white/5 pb-3">
              <Sliders className="h-5 w-5" />
              <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">Operational Parameters</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-5 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Telemetry Refresh Cycle (ms)</label>
                <input
                  type="number"
                  min={500}
                  max={10000}
                  required
                  value={refreshRate}
                  onChange={(e) => setRefreshRate(parseInt(e.target.value))}
                  className="w-full bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 py-2.5 px-3.5 rounded-lg text-white outline-none"
                />
                <span className="text-[9px] text-gray-600 mt-1">Controls how fast WebSockets and API updates poll active rocket manifolds. Range: 500ms - 10000ms.</span>
              </div>

              <div className="flex items-center justify-between bg-spaceBg/40 border border-white/5 p-4 rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white">SYSTEM WARNING ALERTS</span>
                  <span className="text-[9px] text-gray-500">Enable real-time push events for solar flares and fuel leaks.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-5 w-5 accent-accentCyan cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Orbital Decay warning threshold (km)</label>
                <input
                  type="number"
                  required
                  value={orbitThreshold}
                  onChange={(e) => setOrbitThreshold(parseInt(e.target.value))}
                  className="w-full bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 py-2.5 px-3.5 rounded-lg text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-cyber-primary py-3.5 flex items-center justify-center gap-2 text-sm font-orbitron tracking-widest disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>SAVE DECK OVERRIDES</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right: Profile Info summary */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase font-orbitron">User Profile Deck</h2>

          <GlassCard glow className="flex flex-col gap-5">
            <div className="flex items-center gap-2 text-accentCyan border-b border-white/5 pb-3">
              <User className="h-5 w-5" />
              <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">Credential Registry</h3>
            </div>

            <div className="flex flex-col gap-4 font-mono text-xs">
              <div>
                <span className="text-[9px] text-gray-500 block uppercase">Operator Username</span>
                <span className="text-sm font-bold text-white">@{user.username}</span>
              </div>

              <div>
                <span className="text-[9px] text-gray-500 block uppercase">Assigned Email</span>
                <span className="text-sm font-bold text-white">{user.email}</span>
              </div>

              <div>
                <span className="text-[9px] text-gray-500 block uppercase">Designated Clearance Role</span>
                <span className="text-xs font-orbitron font-bold text-accentPurple bg-accentPurple/10 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                  {user.role}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-3 border-l-4 border-l-accentDanger">
            <div className="flex items-center gap-2 text-accentDanger text-xs font-bold font-orbitron">
              <Shield className="h-4 w-4" />
              <span>TERMINATE CONTROL DECK LINK</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
              Decoupling links invalidates temporary cryptographic keys and resets active WebSocket arrays to parking modes.
            </p>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Settings;
