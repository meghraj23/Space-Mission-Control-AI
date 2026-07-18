import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, ShieldAlert, Cpu, Activity, ArrowRight, Star, Quote } from 'lucide-react';
import SpaceGlobe from '../components/SpaceGlobe';
import GlassCard from '../components/GlassCard';

const Landing = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 29, hours: 23, minutes: 59, seconds: 59 });

  // Countdown timer simulation for next launch
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { value: '04', label: 'ACTIVE MISSIONS', icon: Rocket },
    { value: '3,842', label: 'ORBITAL SATELLITES', icon: Cpu },
    { value: '99.4%', label: 'SUCCESS RATIO', icon: Activity },
    { value: '08', label: 'CREW IN ORBIT', icon: Star },
  ];

  return (
    <div className="w-full flex flex-col relative overflow-hidden">
      {/* Meteor Shower Simulation Layer */}
      <div className="meteor-container">
        <div className="meteor-item" style={{ left: '20%', animationDelay: '1s' }}></div>
        <div className="meteor-item" style={{ left: '50%', animationDelay: '3s' }}></div>
        <div className="meteor-item" style={{ left: '80%', animationDelay: '5s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 py-12 gap-12 relative z-10 max-w-7xl mx-auto w-full">
        {/* Text Area */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 bg-accentCyan/10 border border-accentCyan/30 px-3.5 py-1 rounded-full text-xs font-mono text-accentCyan">
            <ShieldAlert className="h-4 w-4" />
            <span>CORE TELEMETRY INTEGRITY PROTOCOL ACTIVE</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            INTELLIGENT SPACE <br />
            <span className="text-gradient-cyan">MISSION CONTROL</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed font-mono">
            Autonomous mission planning, cognitive payload tracking, and high-frequency real-time telemetry matrices. Engineered for NASA-level telemetry and multi-planetary command interfaces.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Link to="/login" className="btn-cyber-primary px-8 py-3.5 flex items-center gap-2 text-sm tracking-widest">
              <span>ESTABLISH LINK</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/launches" className="btn-cyber-secondary px-8 py-3.5 text-sm tracking-widest">
              <span>LAUNCH LOGS</span>
            </Link>
          </div>
        </motion.div>

        {/* 3D Earth Globe Canvas Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 w-full flex items-center justify-center relative"
        >
          <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]">
            <SpaceGlobe />
          </div>
        </motion.div>
      </section>

      {/* Operations Countdown Row */}
      <section className="py-8 bg-spaceCard/35 border-y border-white/5 relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold tracking-widest text-accentCyan font-orbitron">NEXT DEEP SPACE WINDOW</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">TARGET: ARES PATHFINDER III (MARS JEZERO)</p>
          </div>
          <div className="flex gap-4 font-orbitron">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-black text-white bg-spaceCard border border-accentCyan/20 py-2 px-3 rounded shadow-glow-cyan">
                  {value.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">{unit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statistics */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={i} className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-accentCyan/10 rounded-full border border-accentCyan/20 text-accentCyan">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-3xl md:text-4xl font-black font-orbitron text-white">{stat.value}</span>
                <span className="text-xs font-mono text-gray-500 tracking-wider uppercase">{stat.label}</span>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Core Features Overview */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-4xl font-black mb-4 uppercase">COMMAND SPECTRUM</h2>
          <p className="text-sm text-gray-400 font-mono">
            Modular flight modules engineered to sustain deep space operations, satellite monitoring, and high-frequency real-time command loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard glow className="flex flex-col gap-4">
            <Cpu className="h-8 w-8 text-accentCyan" />
            <h3 className="text-lg font-bold font-orbitron">AI FLIGHT PATHER</h3>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Cognitive heuristics and real-time failure prediction models mapping trajectory vectors dynamically to adjust descent windows and payload release parameters.
            </p>
          </GlassCard>

          <GlassCard glow className="flex flex-col gap-4">
            <Activity className="h-8 w-8 text-accentPurple" />
            <h3 className="text-lg font-bold font-orbitron">LIVE STREAM MATRIX</h3>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Fast low-latency WebSockets delivering real-time pressure, engine thrust values, orbital drift indicators, and astronaut biometric monitors.
            </p>
          </GlassCard>

          <GlassCard glow className="flex flex-col gap-4">
            <ShieldAlert className="h-8 w-8 text-accentDanger" />
            <h3 className="text-lg font-bold font-orbitron">SOLAR SHIELD DECK</h3>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Continuous monitoring of solar radiation indices, proton flux densities, coronal mass ejection trajectories, and geomagnetics.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 md:px-16 max-w-7xl mx-auto w-full relative z-10 border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xl md:text-3xl font-black font-orbitron uppercase">OPERATIONAL REVIEWS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="flex flex-col gap-4 relative">
            <Quote className="absolute top-4 right-4 h-12 w-12 text-accentCyan/10" />
            <p className="text-xs text-gray-400 italic leading-relaxed font-mono">
              "Mission Control AI is an absolute game-changer. The capability to view orbital drift metrics and simulated propulsion curves in one integrated cockpit panel has simplified our command logistics."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-10 w-10 rounded-full bg-accentCyan/20 flex items-center justify-center font-bold text-accentCyan font-mono">
                SX
              </div>
              <div>
                <h4 className="text-xs font-bold font-orbitron">Marcus Vance</h4>
                <p className="text-[10px] text-gray-500 font-mono">Operations Lead, Space Operations Group</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4 relative">
            <Quote className="absolute top-4 right-4 h-12 w-12 text-accentPurple/10" />
            <p className="text-xs text-gray-400 italic leading-relaxed font-mono">
              "Biometric vector feeds for our ISS resupply teams are perfectly visual. With integrated chat assistance, troubleshooting orbital nitrogen leaks is handled in real-time."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-10 w-10 rounded-full bg-accentPurple/20 flex items-center justify-center font-bold text-accentPurple font-mono">
                NS
              </div>
              <div>
                <h4 className="text-xs font-bold font-orbitron">Dr. Sarah Chen</h4>
                <p className="text-[10px] text-gray-500 font-mono">Principal Systems Integrator, NASA Ames</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Landing;
