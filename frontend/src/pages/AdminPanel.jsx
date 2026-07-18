import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Users, Radio, UserPlus, Trash2, Cpu, Settings as SettingsIcon } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [crew, setCrew] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // New crew member states
  const [crewName, setCrewName] = useState('');
  const [crewRole, setCrewRole] = useState('Payload Specialist');
  const [crewBio, setCrewBio] = useState('');

  // New satellite states
  const [satName, setSatName] = useState('');
  const [satDesignation, setSatDesignation] = useState('');
  const [satOrbit, setSatOrbit] = useState('Low Earth Orbit (LEO)');

  const fetchUsers = async () => {
    // Note: Mock endpoint falls back to static list if users retrieval not implemented
    setUsers([
      { _id: 'u1', username: 'admin', email: 'admin@missioncontrol.gov', role: 'Admin' },
      { _id: 'u2', username: 'operator', email: 'operator@missioncontrol.gov', role: 'Operator' },
      { _id: 'u3', username: 'scientist', email: 'scientist@missioncontrol.gov', role: 'Scientist' },
      { _id: 'u4', username: 'guest', email: 'guest@missioncontrol.gov', role: 'Guest' }
    ]);
  };

  const fetchCrew = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/crew', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setCrew(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSatellites = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/satellites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setSatellites(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchCrew(), fetchSatellites()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleCreateCrew = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/crew', {
        name: crewName,
        role: crewRole,
        bio: crewBio,
        status: 'Idle',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCrewName('');
        setCrewBio('');
        fetchCrew();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Access Denied: Admin only.');
    }
  };

  const handleDeleteCrew = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/crew/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCrew();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  const handleCreateSatellite = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/satellites', {
        name: satName,
        designation: satDesignation,
        orbit: satOrbit,
        status: 'Operational',
        altitude: 450,
        battery: 100,
        signalStrength: 100
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSatName('');
        setSatDesignation('');
        fetchSatellites();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Access Denied: Admin only.');
    }
  };

  const handleDeleteSatellite = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/satellites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSatellites();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center font-orbitron text-accentCyan text-lg animate-pulse">
        LOADING ADMINISTRATIVE CONTROL VAULTS...
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            ADMINISTRATIVE BRIDGE
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">COMMAND CONSOLE OVERRIDES &bull; ROSTER MANAGEMENT</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col gap-3 font-orbitron text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              activeTab === 'users' ? 'bg-accentCyan/10 border-accentCyan text-accentCyan' : 'border-white/5 hover:border-white/10 text-gray-400'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> USER ROLES
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('crew')}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              activeTab === 'crew' ? 'bg-accentCyan/10 border-accentCyan text-accentCyan' : 'border-white/5 hover:border-white/10 text-gray-400'
            }`}
          >
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> ASTRONAUT ROSTER
            </span>
          </button>

          <button
            onClick={() => setActiveTab('satellites')}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              activeTab === 'satellites' ? 'bg-accentCyan/10 border-accentCyan text-accentCyan' : 'border-white/5 hover:border-white/10 text-gray-400'
            }`}
          >
            <span className="flex items-center gap-2">
              <Radio className="h-4 w-4" /> SATELLITES ARRAY
            </span>
          </button>
        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-3">
          
          {/* Tab 1: Users */}
          {activeTab === 'users' && (
            <GlassCard glow className="flex flex-col gap-6">
              <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">User Directory & Permissions</h3>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500">
                      <th className="py-2.5">USERNAME</th>
                      <th className="py-2.5">EMAIL ADDRESS</th>
                      <th className="py-2.5">DECK PERMISSION LEVEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-white/5 text-gray-300">
                        <td className="py-3 font-semibold text-white">@{u.username}</td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3">
                          <span className={`text-[10px] font-orbitron font-bold px-2.5 py-0.5 rounded-full ${
                            u.role === 'Admin' ? 'bg-accentDanger/10 text-accentDanger' : (u.role === 'Operator' ? 'bg-accentCyan/10 text-accentCyan' : 'bg-gray-500/10 text-gray-400')
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* Tab 2: Crew */}
          {activeTab === 'crew' && (
            <div className="flex flex-col gap-8">
              {/* Add Crew Form */}
              <GlassCard glow className="flex flex-col gap-4">
                <h3 className="text-sm font-bold font-orbitron text-gradient-cyan uppercase tracking-wider">Register Astronaut Profile</h3>
                <form onSubmit={handleCreateCrew} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commander Marcus Vance"
                      value={crewName}
                      onChange={(e) => setCrewName(e.target.value)}
                      className="w-full bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 py-2 px-3 rounded text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Mission Duty Role</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flight Systems Engineer"
                      value={crewRole}
                      onChange={(e) => setCrewRole(e.target.value)}
                      className="w-full bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 py-2 px-3 rounded text-white outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Biographical Log</label>
                    <textarea
                      required
                      placeholder="Background history and aerospace competencies..."
                      value={crewBio}
                      onChange={(e) => setCrewBio(e.target.value)}
                      rows={3}
                      className="w-full bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 py-2 px-3 rounded text-white outline-none resize-none"
                    />
                  </div>
                  <button type="submit" className="btn-cyber-primary py-2.5 md:col-span-2 text-xs font-orbitron tracking-wider">
                    DECRIP DECK AND DEPLOY
                  </button>
                </form>
              </GlassCard>

              {/* Roster management grid */}
              <GlassCard className="flex flex-col gap-4">
                <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">Roster Deletion Matrix</h3>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  {crew.map((c) => (
                    <div key={c._id} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-white text-sm font-orbitron">{c.name}</h4>
                        <p className="text-[10px] text-gray-500">{c.role}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCrew(c._id)}
                        className="p-1.5 rounded bg-accentDanger/10 hover:bg-accentDanger text-accentDanger hover:text-white transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Tab 3: Satellites */}
          {activeTab === 'satellites' && (
            <div className="flex flex-col gap-8">
              {/* Add Sat Form */}
              <GlassCard glow className="flex flex-col gap-4">
                <h3 className="text-sm font-bold font-orbitron text-gradient-cyan uppercase tracking-wider">Register Orbital Satellite</h3>
                <form onSubmit={handleCreateSatellite} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Satellite Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Starlink-C401"
                      value={satName}
                      onChange={(e) => setSatName(e.target.value)}
                      className="w-full bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 py-2 px-3 rounded text-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Telemetry Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SL-C401-2026"
                      value={satDesignation}
                      onChange={(e) => setSatDesignation(e.target.value)}
                      className="w-full bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 py-2 px-3 rounded text-white outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Orbit Target Belt</label>
                    <select
                      value={satOrbit}
                      onChange={(e) => setSatOrbit(e.target.value)}
                      className="w-full bg-spaceBg/60 border border-white/5 py-2 px-2 rounded text-white outline-none bg-spaceCard"
                    >
                      <option value="Low Earth Orbit (LEO)">Low Earth Orbit (LEO)</option>
                      <option value="Medium Earth Orbit (MEO)">Medium Earth Orbit (MEO)</option>
                      <option value="Geostationary Orbit (GEO)">Geostationary Orbit (GEO)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-cyber-primary py-2.5 md:col-span-2 text-xs font-orbitron tracking-wider">
                    REGISTER SATELLITE NODE
                  </button>
                </form>
              </GlassCard>

              {/* Satellites delete list */}
              <GlassCard className="flex flex-col gap-4">
                <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">Satellite Decomission Panel</h3>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  {satellites.map((s) => (
                    <div key={s._id} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-white text-sm font-orbitron">{s.name}</h4>
                        <p className="text-[10px] text-gray-500">{s.designation} &bull; {s.orbit}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSatellite(s._id)}
                        className="p-1.5 rounded bg-accentDanger/10 hover:bg-accentDanger text-accentDanger hover:text-white transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
