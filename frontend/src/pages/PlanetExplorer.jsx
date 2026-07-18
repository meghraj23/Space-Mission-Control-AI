import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sun, Shield, Activity, Globe } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const PlanetExplorer = () => {
  const [planets, setPlanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  useEffect(() => {
    const fetchPlanets = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/explorer/planets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setPlanets(res.data.data);
          setSelectedPlanet(res.data.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlanets();
  }, []);

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
          SOL SYSTEM EXPLORER
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1">PLANETARY STATISTICS DATABASE &bull; SCIENCE DECK DATA FEEDS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Planet Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {planets.map((planet) => (
            <motion.div
              key={planet.name}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedPlanet(planet)}
              className={`cursor-pointer rounded-xl p-5 border transition-all ${
                selectedPlanet?.name === planet.name 
                  ? 'bg-accentCyan/10 border-accentCyan shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'bg-spaceCard/50 border-white/5 hover:border-accentCyan/30'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-orbitron font-bold text-white text-lg tracking-wider">{planet.name}</h3>
                <Globe className="h-5 w-5 text-accentCyan/75" />
              </div>
              <div className="flex flex-col gap-2 font-mono text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Semi-major Axis:</span>
                  <span className="text-white">{planet.distance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Surface Temp:</span>
                  <span className="text-white">{planet.temp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Planet Analysis Panel */}
        <div>
          {selectedPlanet ? (
            <GlassCard glow className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-accentCyan font-mono tracking-widest uppercase">COGNITIVE RADAR ANALYZER</span>
                <h2 className="text-2xl font-black font-orbitron tracking-wide text-white uppercase">{selectedPlanet.name}</h2>
              </div>

              <div className="flex flex-col gap-3 font-mono text-xs border-t border-white/5 pt-4">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-500">Surface Gravity:</span>
                  <span className="text-accentCyan">{selectedPlanet.gravity}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-500">Natural Satellites:</span>
                  <span className="text-accentCyan">{selectedPlanet.moons} Moons</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">System Orbit Status:</span>
                  <span className="text-green-400 font-bold">NOMINAL DETECT</span>
                </div>
              </div>

              <div className="bg-spaceBg/60 border border-white/5 p-4 rounded-lg flex flex-col gap-2">
                <span className="text-[9px] font-bold font-orbitron text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-yellow-400" /> SOLAR IRRADIANCE FACTOR
                </span>
                <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                  Magnetic field interaction is constant. High radiation shield coefficients advised for exploratory cargo landing modules.
                </p>
              </div>
            </GlassCard>
          ) : (
            <p className="text-xs text-gray-500 font-mono text-center py-12">Select a planet to run telemetry diagnostics.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanetExplorer;
