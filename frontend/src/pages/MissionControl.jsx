import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Play, Pause, RefreshCw, Send, Terminal, ShieldAlert, 
  Activity, Users, Compass, HelpCircle, AlertTriangle 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const MissionControl = () => {
  const [activeMission, setActiveMission] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const logEndRef = useRef(null);

  // 1. Fetch active flight manifest
  useEffect(() => {
    const fetchActive = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/missions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const active = res.data.data.find(m => m.status === 'Active');
          if (active) {
            setActiveMission(active);
            setChecklist(active.checklist || []);
          }
        }
      } catch (err) {
        console.error('Failed to load active deck.');
      }
    };
    fetchActive();
  }, []);

  // 2. Generate simulated systems logs ticks
  useEffect(() => {
    const defaultLogs = [
      "[08:00:12] [COMMS] S-Band carrier signal lock acquired.",
      "[08:00:45] [PROPULSION] Core pressure readings stabilized at 200 bar.",
      "[08:01:22] [AVIONICS] Primary flight computer sequence synced."
    ];
    setLogs(defaultLogs);

    const logTimer = setInterval(() => {
      const systems = ["AVIONICS", "PROPULSION", "COMMS", "LIFE_SUPPORT", "SOLAR_SHIELD"];
      const messages = [
        "Apogee vector calculations updated.",
        "Helium regulator pressure checks: NOMINAL.",
        "Proton flux ionization limits checked.",
        "Cabin standard pressure stable at 14.7 psi.",
        "Satellite constellation handshake: OK."
      ];
      const randomSystem = systems[Math.floor(Math.random() * systems.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toTimeString().split(' ')[0];
      
      setLogs((prev) => [...prev, `[${timestamp}] [${randomSystem}] ${randomMessage}`].slice(-25));
    }, 4000);

    return () => clearInterval(logTimer);
  }, []);

  // 3. Scroll console to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleToggleChecklist = async (index) => {
    if (!activeMission) return;
    const updatedChecklist = checklist.map((item, i) => i === index ? { ...item, done: !item.done } : item);
    setChecklist(updatedChecklist);

    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/missions/${activeMission._id}`, {
        checklist: updatedChecklist
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userStr = localStorage.getItem('user');
    const username = userStr ? JSON.parse(userStr).username : 'Operator';

    const msg = {
      sender: username,
      text: chatInput,
      timestamp: new Date().toTimeString().split(' ')[0]
    };

    setChatMessages((prev) => [...prev, msg]);
    setChatInput('');

    // AI copilot inline response trigger
    setTimeout(() => {
      const aiResponse = {
        sender: 'AI Onboard',
        text: `Command received: "${msg.text}". Analyzing trajectory vectors... Subsystem checks nominal. Proceeding with standard countdown count.`,
        timestamp: new Date().toTimeString().split(' ')[0]
      };
      setChatMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            MISSION CONTROL CENTER
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">FLIGHT COMMAND COCKPIT &bull; MULTI-MONITOR OPERATIONS MATRIX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Monitor: Telemetry Logs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard glow className="flex flex-col gap-4 flex-1 min-h-[350px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-accentCyan animate-pulse" /> COMMAND CONSOLE logs
              </span>
              <span className="text-[9px] text-accentCyan font-mono">LINK STABLE</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-accentCyan/80 flex flex-col gap-1.5 p-3 bg-spaceBg/60 rounded-lg max-h-[300px]">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
              ))}
              <div ref={logEndRef}></div>
            </div>
          </GlassCard>

          {/* Bottom Left Monitor: Launch Checklist */}
          <GlassCard className="flex flex-col gap-4">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Pre-Flight checklist deck</h3>
            
            {activeMission ? (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {checklist.map((item, idx) => (
                  <label key={idx} className="flex items-center justify-between p-3.5 bg-spaceBg/40 border border-white/5 rounded-lg cursor-pointer hover:border-accentCyan/20 transition-all">
                    <span className={item.done ? 'text-gray-500 line-through' : 'text-gray-300'}>
                      {item.item}
                    </span>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(idx)}
                      className="h-4 w-4 accent-accentCyan"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-mono text-center py-6">No active launch checklist available.</p>
            )}
          </GlassCard>
        </div>

        {/* Right Monitor: Crew Communications */}
        <div className="flex flex-col gap-6">
          <GlassCard glow className="flex flex-col gap-4 h-[450px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accentPurple" /> OPERATIONS CHAT
              </span>
            </div>

            {/* Chat feed */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-1">
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-xs font-mono">
                  <div className="flex justify-between text-[9px] text-gray-500">
                    <span className="font-bold text-accentCyan">@{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-gray-300 mt-1 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChat} className="flex gap-2 border-t border-white/5 pt-3">
              <input
                type="text"
                placeholder="Broadcast operational sequence orders..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-spaceBg/60 border border-white/5 focus:border-accentCyan/40 rounded px-3 py-2 text-xs font-mono text-white outline-none"
              />
              <button type="submit" className="btn-cyber-primary p-2 rounded">
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </GlassCard>

          {/* Quick Warning widget */}
          <GlassCard className="flex flex-col gap-3 border-l-4 border-l-accentDanger bg-accentDanger/5">
            <div className="flex items-center gap-2 text-accentDanger text-xs font-bold font-orbitron">
              <AlertTriangle className="h-4 w-4 animate-bounce" />
              <span>APOGEE DECAY WARNING</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
              Hubble Cosmic II orbital parameters drifting. Auto-restoration algorithms offline. Request delta-V calculations override.
            </p>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default MissionControl;
