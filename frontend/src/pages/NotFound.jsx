import React from 'react';
import { Link } from 'react-router-dom';
import { Orbit, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative z-10">
      <div className="flex flex-col items-center gap-4">
        <Orbit className="h-16 w-16 text-accentDanger animate-spin-slow" />
        <h1 className="text-5xl md:text-7xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-accentDanger to-accentPurple tracking-widest uppercase">
          404: VECTOR LOST
        </h1>
        <h2 className="text-sm font-mono text-gray-400 max-w-md leading-relaxed mt-2 uppercase">
          The flight trajectory you requested has decayed or decouplers failed. Apogee check resulted in target dereferencing.
        </h2>
        <Link to="/" className="btn-cyber-primary px-8 py-3 mt-6 flex items-center gap-2 text-sm tracking-widest">
          <Compass className="h-4 w-4" />
          <span>RETURN TO OPERATIONAL BRIDGE</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
