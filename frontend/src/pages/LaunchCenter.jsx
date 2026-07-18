import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Rocket, ShieldAlert, Cpu, Calendar, User, Compass, HelpCircle, Plus, X, Flame } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LaunchCenter = () => {
  const [missions, setMissions] = useState([]);
  const [rockets, setRockets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [rocket, setRocket] = useState('Starship-HLS');
  const [destination, setDestination] = useState('Moon South Pole');
  const [payload, setPayload] = useState('Scientific Sensors');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Scheduled');

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const missionRes = await axios.get('http://localhost:5000/api/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (missionRes.data.success) {
        setMissions(missionRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        await fetchMissions();

        // Standard rockets fetch or fallback to local presets if API not written
        setRockets([
          { name: 'Starship-HLS', thrust: 74000, height: 121, mass: 5000000, success: 94 },
          { name: 'Falcon Heavy', thrust: 22819, height: 70, mass: 1420788, success: 99 },
          { name: 'Artemis SLS', thrust: 41000, height: 98, mass: 2600000, success: 100 },
          { name: 'Falcon 9', thrust: 7607, height: 70, mass: 549054, success: 99.4 }
        ]);

      } catch (err) {
        setError('Error fetching flight decks.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateMission = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const payloadData = {
      name,
      rocket,
      crew: [],
      launchDate: new Date().toISOString(),
      destination,
      fuel: 100,
      velocity: status === 'Active' ? 1200 : 0,
      altitude: status === 'Active' ? 2 : 0,
      payload,
      description,
      status
    };

    try {
      const res = await axios.post('http://localhost:5000/api/missions', payloadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setModalOpen(false);
        fetchMissions();
        // Reset form
        setName('');
        setDestination('Moon South Pole');
        setPayload('Scientific Sensors');
        setDescription('');
        setStatus('Scheduled');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unauthorized role for scheduling flights.');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/missions/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Access Denied.');
    }
  };

  const chartData = {
    labels: rockets.map(r => r.name),
    datasets: [
      {
        label: 'Engine Thrust (kN)',
        data: rockets.map(r => r.thrust),
        backgroundColor: 'rgba(123, 97, 255, 0.4)',
        borderColor: '#7B61FF',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-orbitron text-accentCyan text-lg animate-pulse">
        LOADING ROCKET DECK VECTOR SYSTEM...
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            LAUNCH OPERATIONS CENTER
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">LAUNCH LOGISTICS &bull; VEHICLE PERFORMANCE GRAPHS</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-cyber-primary px-4 py-2 text-xs tracking-widest flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>SCHEDULE FLIGHT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Flight Log */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">Active and Scheduled Flight Logs</h2>

          <div className="flex flex-col gap-4">
            {missions.map((m) => (
              <GlassCard key={m._id} className="relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accentCyan/10 border border-accentCyan/20 rounded-lg text-accentCyan">
                      <Rocket className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-orbitron text-white">{m.name}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        VEHICLE: {m.rocket} &bull; DESTINATION: {m.destination}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        PAYLOAD: {m.payload}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-orbitron font-semibold px-3 py-1 rounded-full uppercase ${
                      m.status === 'Active' ? 'bg-accentCyan/15 text-accentCyan animate-pulse' :
                      m.status === 'Completed' ? 'bg-green-400/15 text-green-400' :
                      m.status === 'Delayed' ? 'bg-accentDanger/15 text-accentDanger' :
                      'bg-gray-400/15 text-gray-400'
                    }`}>
                      {m.status}
                    </span>

                    {/* Operational Commands */}
                    {m.status !== 'Completed' && (
                      <div className="flex gap-2">
                        {m.status === 'Scheduled' && (
                          <button
                            onClick={() => handleUpdateStatus(m._id, 'Active')}
                            className="bg-accentCyan/20 hover:bg-accentCyan text-accentCyan hover:text-spaceBg font-mono text-[9px] font-bold py-1 px-2.5 rounded transition-all"
                          >
                            LAUNCH
                          </button>
                        )}
                        {m.status === 'Active' && (
                          <button
                            onClick={() => handleUpdateStatus(m._id, 'Completed')}
                            className="bg-green-400/20 hover:bg-green-400 text-green-400 hover:text-spaceBg font-mono text-[9px] font-bold py-1 px-2.5 rounded transition-all"
                          >
                            COMPLETE
                          </button>
                        )}
                        {m.status !== 'Delayed' && (
                          <button
                            onClick={() => handleUpdateStatus(m._id, 'Delayed')}
                            className="bg-accentDanger/20 hover:bg-accentDanger text-accentDanger hover:text-spaceBg font-mono text-[9px] font-bold py-1 px-2.5 rounded transition-all"
                          >
                            HOLD
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right: Launcher Comparison Charts */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">Launcher Thrust Analysis</h2>

          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Engine Peak Thrust (kN)</h3>
            <div className="h-56 relative">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888', font: { family: 'Courier New', size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: '#888', font: { family: 'Courier New', size: 10 } } }
                  }
                }}
              />
            </div>
          </GlassCard>

          {/* Core Specs Card */}
          <GlassCard glow className="flex flex-col gap-4 font-mono text-xs">
            <h3 className="text-xs font-bold font-orbitron text-accentCyan uppercase tracking-widest">Launcher Catalog</h3>
            {rockets.map((r, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-orbitron font-bold text-white text-xs">{r.name}</h4>
                  <span className="text-[10px] text-gray-500">MAX MASS: {(r.mass / 1000).toLocaleString()} t</span>
                </div>
                <span className="text-accentCyan font-bold">{r.success}% SUCCESS RATE</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>

      {/* Schedule Flight Popup Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-spaceBg/70 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-spaceCard/95 border border-accentCyan/30 rounded-xl shadow-2xl p-6 backdrop-blur-xl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-lg font-black font-orbitron text-gradient-cyan uppercase tracking-widest">
                LAUNCH OPERATIONS SCHEDULER
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateMission} className="flex flex-col gap-4 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Mission Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artemis South Lunar Base-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-spaceBg/60 border border-accentCyan/10 focus:border-accentCyan/40 py-2 px-3 rounded text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Launcher Vehicle</label>
                  <select
                    value={rocket}
                    onChange={(e) => setRocket(e.target.value)}
                    className="w-full bg-spaceBg/60 border border-accentCyan/10 py-2 px-2 rounded text-white outline-none bg-spaceCard"
                  >
                    <option value="Starship-HLS">Starship-HLS</option>
                    <option value="Falcon Heavy">Falcon Heavy</option>
                    <option value="Artemis SLS">Artemis SLS</option>
                    <option value="Falcon 9">Falcon 9</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Destination Target</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-spaceBg/60 border border-accentCyan/10 py-2 px-3 rounded text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Cargo Payload Type</label>
                  <input
                    type="text"
                    required
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="w-full bg-spaceBg/60 border border-accentCyan/10 py-2 px-3 rounded text-white outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase">Initial Deployment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-spaceBg/60 border border-accentCyan/10 py-2 px-2 rounded text-white outline-none bg-spaceCard"
                  >
                    <option value="Scheduled">Scheduled (Parking Orbit)</option>
                    <option value="Active">Active (Immediate Ignition)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Flight Manifest Description</label>
                <textarea
                  placeholder="Operational purpose of flight..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-spaceBg/60 border border-accentCyan/10 focus:border-accentCyan/40 py-2 px-3 rounded text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-cyber-primary w-full py-3 mt-2 flex items-center justify-center gap-1 font-orbitron tracking-widest text-sm"
              >
                <Flame className="h-4 w-4" />
                <span>CONFIRM LAUNCH IGNITION</span>
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchCenter;
