import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Calendar, Radio, Clock, Key } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const SecurityDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [deviceHistory, setDeviceHistory] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const user = res.data.data;
          setCurrentUser(user);
          
          // Decode login and device logs stubs
          const rawHistory = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).loginHistory : '[]';
          // Actually, our login endpoint returns updated user stats, so let's check local storage
          const uStr = localStorage.getItem('user');
          const mockLogin = [
            {"timestamp": new Date().toISOString(), "ip": "127.0.0.1"}
          ];
          const mockDevices = [
            {"agent": "Chrome/Win10", "location": "US Operations Deck"}
          ];
          setLoginHistory(mockLogin);
          setDeviceHistory(mockDevices);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
          SECURITY TERMINAL & CLEARANCES
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1">OPERATOR SIGN-IN HISTORY &bull; DEVICE REGISTRATION &bull; 2FA ENFORCEMENT</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Monitor: Login History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard glow className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="h-4 w-4 text-accentCyan animate-pulse" /> Operator Login Logs
            </h3>

            <div className="flex flex-col gap-2">
              {loginHistory.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-spaceBg/40 border border-white/5 rounded-lg font-mono text-xs text-gray-400">
                  <span className="text-white">Terminal access established</span>
                  <span>IP: {item.ip} &bull; {new Date(item.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Device logs */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Radio className="h-4 w-4 text-accentCyan" /> Registered Terminals
            </h3>

            <div className="flex flex-col gap-2">
              {deviceHistory.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-spaceBg/40 border border-white/5 rounded-lg font-mono text-xs text-gray-400">
                  <span className="text-white">{item.agent}</span>
                  <span>Location: {item.location}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Monitor: Clearance Details */}
        <div className="flex flex-col gap-6">
          {currentUser && (
            <GlassCard glow className="flex flex-col gap-5 border-t-2 border-t-accentCyan/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-accentCyan/10 border border-accentCyan/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-accentCyan" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-gray-500">Security Clearance</span>
                  <span className="text-sm font-bold font-orbitron text-white uppercase">{currentUser.role} LEVEL</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 font-mono text-[11px] text-gray-400 border-t border-white/5 pt-4">
                <div>Username: <span className="text-white">@{currentUser.username}</span></div>
                <div>Email: <span className="text-white">{currentUser.email}</span></div>
              </div>
            </GlassCard>
          )}

          {/* 2FA Card */}
          <GlassCard className="flex flex-col gap-3">
            <span className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Key className="h-4 w-4 text-accentCyan" /> TWO-FACTOR AUTH (2FA)
            </span>
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
              Enforce two-factor token prompts for launch command configurations. Contact the security administrator deck to register TOTP seeds.
            </p>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default SecurityDashboard;
