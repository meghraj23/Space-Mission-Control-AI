import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Compass, ShieldCheck, Battery, Signal, Zap, AlertTriangle, Play, Pause } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const SatelliteMonitoring = ({ socket }) => {
  const [satellites, setSatellites] = useState([]);
  const [selectedSat, setSelectedSat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  // 1. Fetch initial Satellites
  useEffect(() => {
    const fetchSatellites = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/satellites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setSatellites(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedSat(res.data.data[0]);
          }
        }
      } catch (err) {
        setError('Failed to fetch satellite matrix.');
      } finally {
        setLoading(false);
      }
    };
    fetchSatellites();
  }, []);

  // 2. Listen to WebSocket updates for real-time drift coordinates
  useEffect(() => {
    if (!socket) return;

    const handleSatUpdate = (data) => {
      setSatellites((prev) =>
        prev.map((sat) => {
          if (sat._id === data._id) {
            const updated = {
              ...sat,
              latitude: data.latitude,
              longitude: data.longitude,
              battery: data.battery
            };
            // Keep selected satellite reference updated
            if (selectedSat && selectedSat._id === sat._id) {
              setSelectedSat(updated);
            }
            return updated;
          }
          return sat;
        })
      );
    };

    socket.on('satellite_update', handleSatUpdate);
    return () => socket.off('satellite_update', handleSatUpdate);
  }, [socket, selectedSat]);

  // 3. Render 2D Canvas Orbital Map Grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear and size
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += width / 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += height / 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw equatorial grid line
    ctx.strokeStyle = 'rgba(123, 97, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Map Coordinates translation helper
    // Lat: -90 to +90 -> Height to 0
    // Lon: -180 to +180 -> 0 to Width
    const getCanvasXY = (lat, lon) => {
      const x = ((parseFloat(lon) + 180) / 360) * width;
      const y = ((90 - parseFloat(lat)) / 180) * height;
      return { x, y };
    };

    // Draw orbits and satellite nodes
    satellites.forEach((sat) => {
      const { x, y } = getCanvasXY(sat.latitude, sat.longitude);

      // Draw orbital track path (simple sinusoidal sine curve projection)
      ctx.strokeStyle = sat._id === selectedSat?._id ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 5) {
        // Project a circular orbit as a sine-like path on 2D mercator
        const latOffset = Math.sin((lon + sat.longitude) * (Math.PI / 180)) * 45 + sat.latitude;
        const pt = getCanvasXY(latOffset, lon);
        if (lon === -180) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Draw node indicator
      const isSelected = sat._id === selectedSat?._id;
      ctx.fillStyle = isSelected ? '#00E5FF' : (sat.status === 'Degraded' ? '#FF4D6D' : '#7B61FF');
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 6 : 4, 0, 2 * Math.PI);
      ctx.fill();

      // Outer glowing aura for selected
      if (isSelected) {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw label name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '8px Courier New';
      ctx.fillText(sat.name, x + 8, y + 3);
    });

  }, [satellites, selectedSat]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedSat) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`http://localhost:5000/api/satellites/${selectedSat._id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSatellites(prev => prev.map(s => s._id === selectedSat._id ? { ...s, status: newStatus } : s));
        setSelectedSat({ ...selectedSat, status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Access Denied: Operators/Scientists only.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-orbitron text-accentCyan text-lg animate-pulse">
        ACQUIRING SATELLITE ORBIT CO-ORDINATES...
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            SATELLITE OPERATION DECK
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">CONSTELLATION ARRAY DIAGNOSTICS &bull; MERCATOR GRID PLOTTING</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Map Visualization */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard glow className="relative flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Global Mercator Orbit Grid</h3>
              <span className="text-[10px] text-accentCyan font-mono bg-accentCyan/10 px-2 py-0.5 rounded border border-accentCyan/20 animate-pulse">
                GRID MATRIX ACTIVE
              </span>
            </div>
            
            <div className="w-full relative overflow-hidden bg-spaceBg/60 border border-white/10 rounded-lg p-2 aspect-[2/1]">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-full block rounded"
              />
            </div>
          </GlassCard>

          {/* Satellites Grid List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Satellite Registry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {satellites.map((sat) => (
                <GlassCard
                  key={sat._id}
                  onClick={() => setSelectedSat(sat)}
                  className={`border transition-all duration-300 ${
                    selectedSat?._id === sat._id ? 'border-accentCyan/50 bg-spaceCard/80 shadow-glow-cyan' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold font-orbitron text-white">{sat.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{sat.designation}</p>
                    </div>
                    <span className={`text-[9px] font-orbitron px-2 py-0.5 rounded-full uppercase ${
                      sat.status === 'Operational' ? 'bg-green-400/10 text-green-400' :
                      sat.status === 'Degraded' ? 'bg-accentDanger/10 text-accentDanger' :
                      'bg-gray-400/10 text-gray-400'
                    }`}>
                      {sat.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-[10px] font-mono text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Battery className="h-3.5 w-3.5 text-accentCyan" />
                      <span>BATTERY: {sat.battery}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Signal className="h-3.5 w-3.5 text-accentPurple" />
                      <span>SIGNAL: {sat.signalStrength}%</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Satellite diagnostics */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">Active Telemetry Diagnostic</h2>

          {selectedSat ? (
            <GlassCard glow className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-black font-orbitron text-white">{selectedSat.name}</h3>
                <p className="text-xs text-accentCyan font-mono mt-0.5">ORBIT TYPE: {selectedSat.orbit}</p>
              </div>

              <div className="flex flex-col gap-4 font-mono text-xs border-y border-white/5 py-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">ALTITUDE:</span>
                  <span className="text-white font-bold">{selectedSat.altitude.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">LATITUDE:</span>
                  <span className="text-white font-bold">{selectedSat.latitude}° N</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">LONGITUDE:</span>
                  <span className="text-white font-bold">{selectedSat.longitude}° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">BATTERY CAP:</span>
                  <span className={`font-bold ${selectedSat.battery < 30 ? 'text-accentDanger' : 'text-accentCyan'}`}>
                    {selectedSat.battery}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SIGNAL LEVEL:</span>
                  <span className={`font-bold ${selectedSat.signalStrength < 50 ? 'text-accentDanger' : 'text-accentPurple'}`}>
                    {selectedSat.signalStrength}%
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-orbitron">SYSTEM OVERRIDE COMMANDS</span>
                
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleUpdateStatus('Operational')}
                    className="flex-1 bg-green-400/20 hover:bg-green-400 text-green-400 hover:text-spaceBg font-mono text-[10px] font-bold py-2 rounded transition-all text-center"
                  >
                    RESTORE
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Degraded')}
                    className="flex-1 bg-accentDanger/20 hover:bg-accentDanger text-accentDanger hover:text-spaceBg font-mono text-[10px] font-bold py-2 rounded transition-all text-center"
                  >
                    FORCE DEGRADE
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Inactive')}
                    className="flex-1 bg-gray-500/20 hover:bg-gray-500 text-gray-400 hover:text-spaceBg font-mono text-[10px] font-bold py-2 rounded transition-all text-center"
                  >
                    POWER OFF
                  </button>
                </div>
              </div>

              {/* Status Warning Alerts */}
              {selectedSat.status === 'Degraded' && (
                <div className="bg-accentDanger/10 border border-accentDanger/30 p-3 rounded-lg text-[10px] font-mono text-accentDanger flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Warning: Diagnostic logs reveal solar array orientation failure. Signal margin critical.</span>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="text-center py-12 text-gray-500 font-mono">
              Select a satellite to display detailed diagnostics.
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};

export default SatelliteMonitoring;
