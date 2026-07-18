import React from 'react';
import { motion } from 'framer-motion';
import { Sun, ShieldAlert, Compass, Eye, ShieldCheck, Thermometer } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const SpaceWeather = () => {
  const solarIndicators = [
    { label: 'PROTON FLUX DENSITY', value: '4.2 MeV', status: 'Nominal', color: 'text-accentCyan' },
    { label: 'X-RAY BURSTS', value: 'Class C-1', status: 'Nominal', color: 'text-accentCyan' },
    { label: 'SOLAR WIND VELOCITY', value: '412.5 km/s', status: 'Optimal', color: 'text-green-400' },
    { label: 'CORONAL TEMPERATURE', value: '1.2M Kelvin', status: 'Stable', color: 'text-accentCyan' }
  ];

  const geomagneticMetrics = [
    { label: 'MAGNETIC STORM LEVEL', value: 'Kp-4', description: 'Minor storm alert active in polar latitudes. Visible auroras likely.' },
    { label: 'COSMIC RADIATION RATE', value: '2.4 mSv/year', description: 'Cabin shielding factor at 99.8%. Crew dose rates within normal bounds.' }
  ];

  const asteroidApproaches = [
    { name: 'Asteroid 2026-QA4', diameter: '42 meters', missDistance: '2.4M km', hazard: 'Non-Hazardous' },
    { name: 'Asteroid Apollo-88', diameter: '185 meters', missDistance: '8.4M km', hazard: 'Non-Hazardous' }
  ];

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            SPACE WEATHER CORRELATOR
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">SOLAR FLARE RADIATION TRACKER &bull; GEOMAGNETIC SHIELD INTEGRITY</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Solar metrics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase">Solar Activity Index</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solarIndicators.map((ind, i) => (
              <GlassCard key={i} glow className="flex flex-col gap-3 relative">
                <Sun className="absolute top-4 right-4 h-12 w-12 text-accentCyan/5" />
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{ind.label}</span>
                <span className={`text-2xl font-black font-orbitron ${ind.color}`}>{ind.value}</span>
                <span className="text-[9px] font-mono text-gray-400 uppercase">STATUS: {ind.status}</span>
              </GlassCard>
            ))}
          </div>

          {/* Geomagnetic Storm info */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">Magnetosphere Shield Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geomagneticMetrics.map((met, i) => (
                <GlassCard key={i} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold font-orbitron text-white">{met.label}</span>
                    <span className="text-accentCyan font-bold font-mono text-sm">{met.value}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono leading-relaxed">{met.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Asteroid Warnings & Shields */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold font-orbitron text-gray-400 tracking-wider uppercase font-orbitron">Cosmic Proximity Vector</h2>

          {/* Near Earth Asteroids list */}
          <GlassCard glow className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-accentCyan font-orbitron text-xs font-bold">
              <Eye className="h-4 w-4" />
              <span>NEA TRAJECTORY SCANNER</span>
            </div>
            
            <div className="flex flex-col gap-4 font-mono text-xs mt-2">
              {asteroidApproaches.map((ast, i) => (
                <div key={i} className="border-b border-white/5 pb-3 last:border-none last:pb-0">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>{ast.name}</span>
                    <span className="text-green-400 text-[10px] uppercase font-orbitron">{ast.hazard}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>DIAMETER: {ast.diameter}</span>
                    <span>MISS RANGE: {ast.missDistance}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Radiation shield diagnostics */}
          <GlassCard className="flex flex-col gap-3 border-l-4 border-l-accentPurple">
            <div className="flex items-center gap-2 text-accentPurple text-xs font-bold font-orbitron">
              <ShieldCheck className="h-4 w-4" />
              <span>DEFLECTOR SHIELDS LOCKED</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
              Deflector electromagnetic coils are loaded at 100% capacitor capacity. Ground station alerts stand at nominal levels.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SpaceWeather;
