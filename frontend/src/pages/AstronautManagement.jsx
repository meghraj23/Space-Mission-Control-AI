import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Activity, Heart, Thermometer, ShieldAlert, Sparkles, Star } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const AstronautManagement = ({ socket }) => {
  const [crew, setCrew] = useState([]);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [pulseHistory, setPulseHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch crew roster
  useEffect(() => {
    const fetchCrew = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/crew', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setCrew(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedCrew(res.data.data[0]);
          }
        }
      } catch (err) {
        setError('Failed to fetch crew status decks.');
      } finally {
        setLoading(false);
      }
    };
    fetchCrew();
  }, []);

  // 2. Listen to WebSocket updates for astronaut vitals
  useEffect(() => {
    if (!socket) return;

    const handleCrewUpdate = (data) => {
      // Update crew array
      setCrew((prev) =>
        prev.map((c) => {
          if (c._id === data._id) {
            const updated = {
              ...c,
              heartRate: data.heartRate,
              oxygenLevel: data.oxygenLevel
            };
            if (selectedCrew && selectedCrew._id === c._id) {
              setSelectedCrew(updated);
            }
            return updated;
          }
          return c;
        })
      );

      // Save pulse history
      setPulseHistory((prev) => {
        const history = prev[data._id] || Array(12).fill(70);
        const updatedHistory = [...history.slice(1), data.heartRate];
        return { ...prev, [data._id]: updatedHistory };
      });
    };

    socket.on('crew_update', handleCrewUpdate);
    return () => socket.off('crew_update', handleCrewUpdate);
  }, [socket, selectedCrew]);

  // Set up chart data for active biometric pulse
  const getChartData = () => {
    const history = (selectedCrew && pulseHistory[selectedCrew._id]) || Array(12).fill(72);
    return {
      labels: Array(12).fill('').map((_, i) => `${i * 2}s`),
      datasets: [
        {
          label: 'Cardiovascular Pulse (BPM)',
          data: history,
          fill: false,
          borderColor: '#00E5FF',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 40, max: 120, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888', font: { family: 'Courier New', size: 9 } } },
      x: { grid: { display: false }, ticks: { color: '#888', font: { family: 'Courier New', size: 9 } } }
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedCrew) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`http://localhost:5000/api/crew/${selectedCrew._id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCrew(prev => prev.map(c => c._id === selectedCrew._id ? { ...c, status: newStatus } : c));
        setSelectedCrew({ ...selectedCrew, status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Access Denied.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-orbitron text-accentCyan text-lg animate-pulse">
        CONNECTING CREW BIOMETRIC LINK DECKS...
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            CREW BIOMETRIC SYSTEM
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">REAL-TIME CLINICAL ECG FEEDS &bull; ASTRONAUT ROSTER</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Astronaut List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">Active Crew Members</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {crew.map((member) => (
              <GlassCard
                key={member._id}
                onClick={() => setSelectedCrew(member)}
                className={`border transition-all duration-300 ${
                  selectedCrew?._id === member._id ? 'border-accentCyan/50 bg-spaceCard/80 shadow-glow-cyan' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=200&auto=format&fit=crop'}
                    alt={member.name}
                    className="h-16 w-16 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold font-orbitron text-white truncate">{member.name}</h3>
                    <p className="text-xs text-accentCyan font-mono mt-0.5">{member.role}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-gray-500">
                      <Star className="h-3 w-3 text-accentPurple" />
                      <span>PERFORMANCE: {member.performanceScore}%</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-orbitron px-2 py-0.5 rounded uppercase ${
                    member.status === 'Active' ? 'bg-green-400/10 text-green-400 animate-pulse' :
                    member.status === 'Training' ? 'bg-accentPurple/10 text-accentPurple' :
                    'bg-gray-400/10 text-gray-400'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right: Selected Biometric Deck */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">ECG Diagnostic Matrix</h2>

          {selectedCrew ? (
            <GlassCard glow className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCrew.avatar}
                  alt={selectedCrew.name}
                  className="h-14 w-14 rounded-full border border-accentCyan/30 object-cover"
                />
                <div>
                  <h3 className="text-base font-black font-orbitron text-white">{selectedCrew.name}</h3>
                  <p className="text-xs text-accentCyan font-mono">{selectedCrew.role}</p>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-gray-400 font-mono leading-relaxed border-t border-white/5 pt-4">
                {selectedCrew.bio}
              </p>

              {/* Clinical ECG charts */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-accentDanger animate-pulse" /> LIVE ECG FEED
                  </span>
                  <span className="text-white font-bold">{selectedCrew.heartRate} BPM</span>
                </div>
                <div className="h-28 relative bg-spaceBg/60 border border-white/10 rounded-lg p-2">
                  <Line data={getChartData()} options={chartOptions} />
                </div>
              </div>

              {/* Vitals logs */}
              <div className="grid grid-cols-2 gap-4 font-mono text-[10px] border-t border-white/5 pt-4">
                <div className="bg-spaceBg/40 border border-white/5 p-3 rounded">
                  <span className="text-gray-500 block">BLOOD PRESS:</span>
                  <span className="text-white font-bold text-xs">{selectedCrew.bloodPressure}</span>
                </div>
                <div className="bg-spaceBg/40 border border-white/5 p-3 rounded">
                  <span className="text-gray-500 block">O2 SATURATION:</span>
                  <span className="text-white font-bold text-xs">{selectedCrew.oxygenLevel}% (OK)</span>
                </div>
              </div>

              {/* Commands */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-orbitron">Duty Deck Controls</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus('Active')}
                    className="flex-1 bg-green-400/20 hover:bg-green-400 text-green-400 hover:text-spaceBg font-mono text-[10px] font-bold py-2 rounded transition-all text-center"
                  >
                    DEPLOY ACTIVE
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Training')}
                    className="flex-1 bg-accentPurple/20 hover:bg-accentPurple text-accentPurple hover:text-spaceBg font-mono text-[10px] font-bold py-2 rounded transition-all text-center"
                  >
                    DEPLOY TRAINING
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Idle')}
                    className="flex-1 bg-gray-500/20 hover:bg-gray-500 text-gray-400 hover:text-spaceBg font-mono text-[10px] font-bold py-2 rounded transition-all text-center"
                  >
                    STANDBY
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="text-center py-12 text-gray-500 font-mono">
              Select an astronaut to display detailed vitals diagnostics.
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};

export default AstronautManagement;
