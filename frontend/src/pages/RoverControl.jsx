import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Compass, Shield, Radio, Terminal, Send, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const RoverControl = () => {
  const [consoleLogs, setConsoleLogs] = useState([
    "[SYSTEM] Connection sequence initiated to Pathfinder Ares-3.",
    "[SYSTEM] Signal attenuation: 4.8 dB. Command pipeline operational."
  ]);
  const [latency, setLatency] = useState('0.0s');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerCommand = async (direction) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/explorer/rover/command', {
        command: direction
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setLatency(res.data.latency);
        setConsoleLogs((prev) => [
          ...prev,
          `[OPERATOR] Sent command packet: ${direction.toUpperCase()}`,
          `[ROVER] Latency delay: ${res.data.latency}`,
          `[ROVER] Action feedback: ${res.data.action}`
        ]);
      }
    } catch (err) {
      setConsoleLogs((prev) => [...prev, `[ERROR] Telemetry packet drop on downlink.`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
          ROVER CONTROLS
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1">REMOTE PATHFINDER INTERACTION CONSOLE &bull; MARS LATENCY LAG SIMULATION</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Monitor: Console Logs */}
        <div className="lg:col-span-2">
          <GlassCard glow className="flex flex-col gap-4 min-h-[400px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-accentCyan animate-pulse" /> ROVER CONSOLE TELEMETRY
              </span>
              <span className="text-[9px] text-accentCyan font-mono">LATENCY: {latency}</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-accentCyan/80 flex flex-col gap-1.5 p-3 bg-spaceBg/60 rounded-lg max-h-[300px]">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Monitor: Directional Controls */}
        <GlassCard className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
          <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest text-center mb-4">
            Directional Thrust grid
          </h3>

          <div className="relative w-48 h-48 bg-spaceBg/40 border border-white/5 rounded-full flex items-center justify-center shadow-inner">
            {/* Forward */}
            <button
              disabled={isSubmitting}
              onClick={() => triggerCommand('forward')}
              className="absolute top-2 btn-cyber-primary p-3 rounded-full hover:scale-105 transition-transform"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            {/* Left */}
            <button
              disabled={isSubmitting}
              onClick={() => triggerCommand('left')}
              className="absolute left-2 btn-cyber-primary p-3 rounded-full hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {/* Right */}
            <button
              disabled={isSubmitting}
              onClick={() => triggerCommand('right')}
              className="absolute right-2 btn-cyber-primary p-3 rounded-full hover:scale-105 transition-transform"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            {/* Reverse */}
            <button
              disabled={isSubmitting}
              onClick={() => triggerCommand('reverse')}
              className="absolute bottom-2 btn-cyber-primary p-3 rounded-full hover:scale-105 transition-transform"
            >
              <ArrowDown className="h-5 w-5" />
            </button>

            {/* SpechScan Center button */}
            <button
              disabled={isSubmitting}
              onClick={() => triggerCommand('scan')}
              className="btn-cyber-primary font-bold font-orbitron text-[9px] px-3.5 py-2.5 rounded-lg uppercase tracking-wider scale-110"
            >
              SCAN
            </button>
          </div>

          <div className="text-[10px] text-gray-500 font-mono text-center leading-relaxed max-w-[200px] mt-2">
            Direction commands take time to upload due to light-distance lag between Earth and Mars.
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RoverControl;
