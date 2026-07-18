import React from 'react';
import { Orbit, Cpu, Compass, Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-spaceBg border-t border-white/5 py-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 mt-auto">
      <div className="flex items-center gap-2">
        <Orbit className="h-5 w-5 text-accentCyan" />
        <span className="text-sm font-bold tracking-widest text-gray-400 font-orbitron uppercase">
          MISSION CONTROL AI
        </span>
      </div>

      <div className="flex items-center gap-6 text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3 text-accentPurple" />
          <span>CORE ENGINE: V3.8.4</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="h-3 w-3 text-accentCyan" />
          <span>DESCENT ANGLE: NOMINAL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-accentDanger" />
          <span>AI SYNC: 100%</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 font-mono">
        &copy; {new Date().getFullYear()} NASA/SPACEX JOINT OPERATIONAL INITIATIVE. ALL VECTOR FLIGHT CHANNELS PROTECTED.
      </p>
    </footer>
  );
};

export default Footer;
