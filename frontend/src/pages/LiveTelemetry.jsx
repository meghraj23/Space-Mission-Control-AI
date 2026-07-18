import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Radio, Gauge, Compass, Activity, Thermometer, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const LiveTelemetry = ({ socket }) => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch active missions on mount
  useEffect(() => {
    const fetchMissions = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const active = res.data.data.filter(m => m.status === 'Active');
          setMissions(active);
          if (active.length > 0) {
            setSelectedMission(active[0]);
          }
        }
      } catch (err) {
        setError('Failed to query mission telemetry rosters.');
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  // 2. Fetch telemetry history once active mission is selected
  useEffect(() => {
    if (!selectedMission) return;
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`http://localhost:5000/api/telemetry/history?missionId=${selectedMission._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setTelemetryHistory(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [selectedMission]);

  // 3. Listen to WebSocket ticks for real-time additions
  useEffect(() => {
    if (!socket || !selectedMission) return;

    const handleTelemetryTick = (data) => {
      if (data.missionId === selectedMission._id) {
        setTelemetryHistory((prev) => {
          // Keep last 30 frames for graph performance
          const sliced = prev.length > 30 ? prev.slice(1) : prev;
          return [...sliced, data.telemetry];
        });
      }
    };

    socket.on('telemetry_update', handleTelemetryTick);
    return () => socket.off('telemetry_update', handleTelemetryTick);
  }, [socket, selectedMission]);

  const getChartData = (field, label, color) => {
    return {
      labels: telemetryHistory.map((t) => new Date(t.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label,
          data: telemetryHistory.map((t) => t[field]),
          fill: false,
          borderColor: color,
          borderWidth: 1.5,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    };
  };

  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888', font: { family: 'Courier New', size: 9 } } },
      x: { display: false }
    }
  });

  const triggerSimulationAlert = (type) => {
    if (!socket) return;
    alert(`Simulation trigger applied: ${type.toUpperCase()}. Alert dispatched to operators.`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-orbitron text-accentCyan text-lg animate-pulse">
        CONNECTING TO FLIGHT TRANSMITTER DECK...
      </div>
    );
  }

  const latestTelemetry = telemetryHistory[telemetryHistory.length - 1] || {
    velocity: 0,
    altitude: 0,
    fuelLevel: 100,
    pressure: 101.3,
    temperature: 20,
    engineStatus: 'Standby'
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            LIVE FLIGHT DATA MATRIX
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">HIGH SPEED OSCILLOSCOPE &bull; WEBSOCKET CHANNELS ACTIVE</p>
        </div>
      </div>

      {missions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Line Charts */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Chart 1: Velocity */}
            <GlassCard glow>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold font-orbitron text-white">Velocity History Vector</span>
                <span className="text-[10px] text-accentCyan font-mono">{latestTelemetry.velocity.toLocaleString()} km/h</span>
              </div>
              <div className="h-40 relative">
                <Line data={getChartData('velocity', 'Velocity (km/h)', '#00E5FF')} options={getChartOptions()} />
              </div>
            </GlassCard>

            {/* Chart 2: Altitude */}
            <GlassCard glow>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold font-orbitron text-white">Altitude Ascent Curve</span>
                <span className="text-[10px] text-accentPurple font-mono">{latestTelemetry.altitude.toLocaleString()} km</span>
              </div>
              <div className="h-40 relative">
                <Line data={getChartData('altitude', 'Altitude (km)', '#7B61FF')} options={getChartOptions()} />
              </div>
            </GlassCard>

            {/* Chart 3: Propellant Yields */}
            <GlassCard glow>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold font-orbitron text-white">Propellant Fuel Burn</span>
                <span className="text-[10px] text-accentDanger font-mono">{latestTelemetry.fuelLevel}%</span>
              </div>
              <div className="h-40 relative">
                <Line data={getChartData('fuelLevel', 'Fuel reserves (%)', '#FF4D6D')} options={getChartOptions()} />
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Console Details */}
          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase font-orbitron">Transceiver Diagnostic</h2>

            <GlassCard className="flex flex-col gap-4">
              <h3 className="text-sm font-bold font-orbitron text-white">{selectedMission.name}</h3>
              
              <div className="flex flex-col gap-3 font-mono text-xs border-y border-white/5 py-4 my-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">BOOSTER STATE:</span>
                  <span className="text-green-400 font-bold uppercase">{latestTelemetry.engineStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ATMOSPHERIC PRESSURE:</span>
                  <span className="text-white font-bold">{latestTelemetry.pressure} PSI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">EXHAUST THERMALS:</span>
                  <span className="text-white font-bold">{latestTelemetry.temperature}° C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SIGNAL LATENCY:</span>
                  <span className="text-accentCyan font-bold">14.2 ms (GEO STABLE)</span>
                </div>
              </div>

              {/* Simulation triggers */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-orbitron">Operator Mock Injectors</span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => triggerSimulationAlert('leak')}
                    className="w-full bg-accentDanger/10 hover:bg-accentDanger border border-accentDanger/30 hover:border-accentDanger text-accentDanger hover:text-white font-mono text-[10px] font-bold py-2.5 rounded transition-all text-center"
                  >
                    INJECT LIQUID HELIUM LEAK
                  </button>
                  <button
                    onClick={() => triggerSimulationAlert('drift')}
                    className="w-full bg-accentPurple/10 hover:bg-accentPurple border border-accentPurple/30 hover:border-accentPurple text-accentPurple hover:text-white font-mono text-[10px] font-bold py-2.5 rounded transition-all text-center"
                  >
                    INJECT PITCH CORRECTION FAULT
                  </button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-3 border-l-4 border-l-green-400">
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold font-orbitron">
                <CheckCircle className="h-4 w-4" />
                <span>CHANNEL INTEGRITY OK</span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                Primary and secondary telemetry channels locked. S-band transceivers synced with Goldstone Deep Space communications complex.
              </p>
            </GlassCard>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 font-mono py-24 gap-4">
          <Radio className="h-12 w-12 text-accentCyan animate-pulse" />
          <div>
            <p className="text-base text-white font-orbitron uppercase">NO ACTIVE TELEMETRY LINKS</p>
            <p className="text-xs text-gray-500 mt-1">Please launch or set a mission status to "Active" in the Launch Center to unlock real-time grids.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTelemetry;
