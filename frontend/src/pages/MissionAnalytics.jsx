import React from 'react';
import { motion } from 'framer-motion';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Trophy, TrendingUp, Zap, Clock } from 'lucide-react';
import GlassCard from '../components/GlassCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

const MissionAnalytics = () => {
  // 1. Success Rate Chart
  const pieData = {
    labels: ['Success', 'Active', 'Holds', 'Aborted'],
    datasets: [
      {
        data: [142, 4, 2, 1],
        backgroundColor: [
          'rgba(0, 229, 255, 0.5)',
          'rgba(123, 97, 255, 0.5)',
          'rgba(255, 206, 86, 0.3)',
          'rgba(255, 77, 109, 0.5)'
        ],
        borderColor: ['#00E5FF', '#7B61FF', '#FFCE56', '#FF4D6D'],
        borderWidth: 1
      }
    ]
  };

  // 2. Engine Thrust vs Mass Efficiency
  const barData = {
    labels: ['Starship', 'Falcon Heavy', 'SLS Artemis', 'Falcon 9'],
    datasets: [
      {
        label: 'Payload to LEO (t)',
        data: [150, 63.8, 95, 22.8],
        backgroundColor: 'rgba(0, 229, 255, 0.3)',
        borderColor: '#00E5FF',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Payload to GTO (t)',
        data: [27, 26.7, 27, 8.3],
        backgroundColor: 'rgba(123, 97, 255, 0.3)',
        borderColor: '#7B61FF',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // 3. Crew Competencies (Radar Chart)
  const radarData = {
    labels: ['Biometrics', 'Docking Accuracy', 'System Purge Speed', 'Emergency Reaction', 'Scientific Output'],
    datasets: [
      {
        label: 'Commander Mercer',
        data: [96, 99, 94, 98, 88],
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        borderColor: '#00E5FF',
        borderWidth: 1.5
      },
      {
        label: 'Sarah Chen',
        data: [92, 95, 99, 94, 96],
        backgroundColor: 'rgba(123, 97, 255, 0.1)',
        borderColor: '#7B61FF',
        borderWidth: 1.5
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
        pointLabels: { color: '#888', font: { family: 'Courier New', size: 9 } },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { labels: { color: '#fff', font: { family: 'Orbitron', size: 8 } } }
    }
  };

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            FLIGHT MISSION ANALYTICS
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">FLEET STABILITY &bull; LAUNCH SUCCESS PROFILES</p>
        </div>
      </div>

      {/* Stats Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-spaceCard border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <Trophy className="h-5 w-5 text-accentCyan" />
          <div>
            <span className="text-[10px] text-gray-500 font-mono block">SUCCESS TOTALS</span>
            <span className="text-sm font-black font-mono text-white">142 FLIGHTS</span>
          </div>
        </div>
        <div className="bg-spaceCard border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-accentPurple" />
          <div>
            <span className="text-[10px] text-gray-500 font-mono block">GROWTH INDEX</span>
            <span className="text-sm font-black font-mono text-white">+14.2% Y/Y</span>
          </div>
        </div>
        <div className="bg-spaceCard border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <Zap className="h-5 w-5 text-accentDanger" />
          <div>
            <span className="text-[10px] text-gray-500 font-mono block">ENGINE CAPACITY</span>
            <span className="text-sm font-black font-mono text-white">99.8% NOMINAL</span>
          </div>
        </div>
        <div className="bg-spaceCard border border-white/5 p-4 rounded-xl flex items-center gap-3">
          <Clock className="h-5 w-5 text-green-400" />
          <div>
            <span className="text-[10px] text-gray-500 font-mono block">ORBIT TIME</span>
            <span className="text-sm font-black font-mono text-white">14,821 hrs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Success ratios */}
        <GlassCard glow className="flex flex-col gap-4">
          <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest text-center">Global Flight Success Ratio</h3>
          <div className="h-56 relative flex justify-center">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff', font: { family: 'Courier New', size: 9 } } } } }} />
          </div>
        </GlassCard>

        {/* Payload capability comparison */}
        <GlassCard glow className="flex flex-col gap-4">
          <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest text-center">Payload Delivery Profiles (tonnes)</h3>
          <div className="h-56 relative">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#fff', font: { family: 'Courier New', size: 8 } } } },
                scales: {
                  y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888', font: { family: 'Courier New', size: 8 } } },
                  x: { grid: { display: false }, ticks: { color: '#888', font: { family: 'Courier New', size: 8 } } }
                }
              }}
            />
          </div>
        </GlassCard>

        {/* Crew performance competencies */}
        <GlassCard glow className="flex flex-col gap-4">
          <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest text-center">Active Crew Competency Matrix</h3>
          <div className="h-56 relative">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default MissionAnalytics;
