import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, Database, Shield } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const MissionArchive = () => {
  const [archived, setArchived] = useState([]);

  useEffect(() => {
    const fetchArchive = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/archive', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setArchived(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchArchive();
  }, []);

  const triggerExport = (format) => {
    const token = localStorage.getItem('token');
    // Open download link directly
    const url = `http://localhost:5000/api/reports/${format}?token=${token}`;
    
    // Create an anchor and click it to download
    const link = document.createElement('a');
    link.href = url;
    // We can set default headers by performing an axios fetch with responseType blob if needed,
    // or since this is a simple download, let uvicorn handle token query parameter or bearer cookie.
    // For maximum convenience and security, let's open in new tab!
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            OPERATIONAL ARCHIVES
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">HISTORICAL FLIGHT REGISTRY &bull; DOWNLOAD DATA SHEETS</p>
        </div>

        {/* Report downloads */}
        <div className="flex gap-3">
          <button
            onClick={() => triggerExport('pdf')}
            className="btn-cyber-primary text-xs font-mono px-4 py-2 rounded flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> PDF Report
          </button>
          <button
            onClick={() => triggerExport('excel')}
            className="btn-cyber-primary text-xs font-mono px-4 py-2 rounded flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Excel Sheet
          </button>
          <button
            onClick={() => triggerExport('csv')}
            className="btn-cyber-primary text-xs font-mono px-4 py-2 rounded flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> CSV Logs
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {archived.map((mission) => (
          <GlassCard key={mission.id} className="flex flex-col gap-4 border-t-2 border-t-accentCyan/30">
            <div className="flex justify-between items-start">
              <h3 className="font-orbitron font-bold text-white text-base tracking-wide">{mission.name}</h3>
              <span className="text-[9px] font-mono bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase">
                {mission.status}
              </span>
            </div>

            <div className="flex flex-col gap-1 font-mono text-[10px] text-gray-400">
              <div>Launch Date: {mission.date}</div>
              <div>Launcher: {mission.rocket}</div>
              <div>Destination: {mission.destination}</div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">{mission.details}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default MissionArchive;
