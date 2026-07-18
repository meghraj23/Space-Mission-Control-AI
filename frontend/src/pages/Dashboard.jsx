import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Rocket, Gauge, Compass, Activity, Thermometer, ShieldCheck, Heart, Radio, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = ({ liveTelemetry }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMissions = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setMissions(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch operations feed.');
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-orbitron text-accentCyan text-lg animate-pulse">
        LOADING MISSION PROTOCOLS...
      </div>
    );
  }

  // Find active missions to display
  const activeMissions = missions.filter(m => m.status === 'Active');

  // Chart data setup
  const chartData = {
    labels: missions.map(m => m.name),
    datasets: [
      {
        label: 'Fuel Levels (%)',
        data: missions.map(m => {
          // If live telemetry exists for this mission, use it
          const liveData = liveTelemetry[m._id];
          return liveData ? liveData.fuelLevel : m.fuel;
        }),
        backgroundColor: 'rgba(0, 229, 255, 0.4)',
        borderColor: '#00E5FF',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888', font: { family: 'Courier New' } } },
      x: { grid: { display: false }, ticks: { color: '#888', font: { family: 'Courier New' } } }
    }
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            OPERATIONS DECK
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">REAL-TIME FLIGHT CONTROL MONITOR &bull; APOGEE STABILIZERS SECURED</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/telemetry" className="btn-cyber-primary px-5 py-2 text-xs tracking-widest uppercase">
            Live Stream Hook
          </Link>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Active Flight Vector */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">Active Flight Vectors</h2>
          
          {activeMissions.length > 0 ? (
            activeMissions.map((m) => {
              // Extract real-time telemetry state if available
              const live = liveTelemetry[m._id] || {
                velocity: m.velocity,
                altitude: m.altitude,
                fuelLevel: m.fuel,
                pressure: 0.1,
                temperature: -50,
                crewPulse: 72,
                crewO2: 99
              };

              return (
                <GlassCard key={m._id} glow className="flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black font-orbitron text-white">{m.name}</h3>
                      <p className="text-xs text-accentCyan font-mono mt-0.5">LAUNCHER: {m.rocket} &bull; DESTINATION: {m.destination}</p>
                    </div>
                    <span className="bg-accentCyan/10 border border-accentCyan/30 text-accentCyan text-[10px] font-mono py-1 px-3 rounded-full animate-pulse uppercase">
                      Telemetry Active
                    </span>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-spaceBg/40 border border-white/5 p-4 rounded-lg flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-accentCyan" />
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono block">VELOCITY</span>
                        <span className="text-sm font-black font-mono text-white">{live.velocity.toLocaleString()} km/h</span>
                      </div>
                    </div>

                    <div className="bg-spaceBg/40 border border-white/5 p-4 rounded-lg flex items-center gap-3">
                      <Compass className="h-5 w-5 text-accentPurple" />
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono block">ALTITUDE</span>
                        <span className="text-sm font-black font-mono text-white">{live.altitude.toLocaleString()} km</span>
                      </div>
                    </div>

                    <div className="bg-spaceBg/40 border border-white/5 p-4 rounded-lg flex items-center gap-3">
                      <Activity className="h-5 w-5 text-accentDanger" />
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono block">FUEL RESERVES</span>
                        <span className="text-sm font-black font-mono text-white">{live.fuelLevel}%</span>
                      </div>
                    </div>

                    <div className="bg-spaceBg/40 border border-white/5 p-4 rounded-lg flex items-center gap-3">
                      <Heart className="h-5 w-5 text-green-400" />
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono block">CREW HEARTRATE</span>
                        <span className="text-sm font-black font-mono text-white">{live.crewPulse} bpm</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-mono text-gray-500">
                      <span>FUEL BURN COEFFICIENT</span>
                      <span>{live.fuelLevel}% REMAINING</span>
                    </div>
                    <div className="w-full bg-spaceBg h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-accentPurple to-accentCyan h-full transition-all duration-1000"
                        style={{ width: `${live.fuelLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          ) : (
            <GlassCard className="text-center py-12 flex flex-col items-center justify-center gap-4 text-gray-500 font-mono">
              <Radio className="h-10 w-10 text-accentCyan animate-pulse" />
              <div>
                <p className="text-sm text-white font-orbitron">ALL SYSTEMS PARKED</p>
                <p className="text-xs mt-1 text-gray-500">No active launches currently broadcasting telemetry.</p>
              </div>
              <Link to="/launches" className="btn-cyber-secondary px-6 py-2 text-xs">
                Schedule a Launch
              </Link>
            </GlassCard>
          )}

          {/* Fuel Level Chart Panel */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Global Fleet Fuel Summary</h3>
            <div className="h-48 relative">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Operational Feeds */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">Onboard Core Diagnostics</h2>

          {/* Diagnostics Card */}
          <GlassCard glow className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold font-orbitron text-white">SUBSYSTEM STATUS</span>
              <span className="bg-green-400/10 border border-green-400/30 text-green-400 text-[9px] font-mono py-0.5 px-2 rounded">ONLINE</span>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">LIQUID LOX PRES:</span>
                <span className="text-accentCyan font-bold">144.2 PSI (NOMINAL)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">S-BAND LINK GAIN:</span>
                <span className="text-accentCyan font-bold">+18.4 DB (LOCKED)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">APOGEE SHIELDS:</span>
                <span className="text-green-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> SECURE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">COOLANT LEVEL:</span>
                <span className="text-accentCyan font-bold">98.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">RADIATION INDEX:</span>
                <span className="text-accentPurple font-bold">4.2 MeV (LOW)</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Shortcuts */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Deck Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3 font-orbitron text-[10px] tracking-wider">
              <Link to="/ai" className="border border-white/5 hover:border-accentCyan/30 bg-spaceBg/40 py-3 text-center rounded transition-all text-gray-300 hover:text-accentCyan">
                AI COMMAND
              </Link>
              <Link to="/satellites" className="border border-white/5 hover:border-accentCyan/30 bg-spaceBg/40 py-3 text-center rounded transition-all text-gray-300 hover:text-accentCyan">
                SATELLITES
              </Link>
              <Link to="/crew" className="border border-white/5 hover:border-accentCyan/30 bg-spaceBg/40 py-3 text-center rounded transition-all text-gray-300 hover:text-accentCyan">
                CREW DECKS
              </Link>
              <Link to="/weather" className="border border-white/5 hover:border-accentCyan/30 bg-spaceBg/40 py-3 text-center rounded transition-all text-gray-300 hover:text-accentCyan">
                SPACE WEATHER
              </Link>
            </div>
          </GlassCard>

          {/* System Warnings */}
          <GlassCard className="flex flex-col gap-4 border-l-4 border-l-accentDanger">
            <div className="flex items-center gap-2 text-accentDanger font-orbitron text-xs font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>ALARM EVENT MATRIX</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
              Geomagnetic disturbance cell detected in high orbital belts. Solar panel yields on Hubble satellite degraded by 12%. Monitoring radiation limits.
            </p>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
