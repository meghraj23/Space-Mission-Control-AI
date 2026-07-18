import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Database, ShieldAlert, Activity, RefreshCw, Plus, ArrowUpRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const SystemHealth = () => {
  const [metrics, setMetrics] = useState({
    cpuUsage: '0%',
    ramUsage: '0%',
    dbLatency: '0ms',
    serverUptime: '0d 0h 0m',
    activeWebSocketLinks: 0
  });
  const [backups, setBackups] = useState([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const fetchMetrics = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/monitoring/health', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBackups = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/monitoring/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBackups(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchBackups();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/monitoring/backups/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchBackups();
      }
    } catch (err) {
      alert('Backup failed.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`http://localhost:5000/api/monitoring/backups/restore?filename=${filename}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Restore failed.');
    }
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
          SYSTEM HEALTH & DIAGNOSTICS
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1">CPU DIAGNOSTICS &bull; SQL DATABASE BACKUPS MANAGER</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">CORE CPU LOAD</span>
          <span className="text-3xl font-black font-orbitron text-accentCyan">{metrics.cpuUsage}</span>
        </GlassCard>
        <GlassCard className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">VIRTUAL RAM UTILIZATION</span>
          <span className="text-3xl font-black font-orbitron text-accentCyan">{metrics.ramUsage}</span>
        </GlassCard>
        <GlassCard className="flex flex-col gap-2">
          <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">DATABASE LATENCY</span>
          <span className="text-3xl font-black font-orbitron text-green-400">{metrics.dbLatency}</span>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Monitor: Backup Manager */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard glow className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5">
                <Database className="h-4 w-4 text-accentCyan animate-pulse" /> SQL DATABASE BACKUPS
              </span>
              <button
                disabled={isBackingUp}
                onClick={handleCreateBackup}
                className="btn-cyber-primary text-[10px] font-mono py-1.5 px-3 rounded flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Trigger Backup
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {backups.length > 0 ? (
                backups.map((b) => (
                  <div key={b.id} className="flex justify-between items-center p-3.5 bg-spaceBg/40 border border-white/5 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono text-white">{b.filename}</span>
                      <span className="text-[9px] font-mono text-gray-500">{b.sizeBytes} bytes &bull; {b.createdAt}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreBackup(b.filename)}
                      className="text-[10px] font-mono text-accentCyan border border-accentCyan/20 hover:bg-accentCyan/10 px-2.5 py-1 rounded transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 font-mono text-center py-6">No SQL backups detected.</p>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Monitor: Host Machine details */}
        <GlassCard className="flex flex-col gap-4">
          <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Host server parameters</h3>
          <div className="flex flex-col gap-3 font-mono text-xs text-gray-400 border-t border-white/5 pt-4">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span>Uptime:</span>
              <span className="text-white">{metrics.serverUptime}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span>Active sockets:</span>
              <span className="text-white">{metrics.activeWebSocketLinks} links</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Failover Engine:</span>
              <span className="text-accentCyan font-bold">SQLITE FALLBACK ACTIVE</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SystemHealth;
