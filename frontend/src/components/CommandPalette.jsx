import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Terminal, ShieldAlert, Activity, Cpu } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const commands = [
    { name: 'Navigation: Dashboard', category: 'Pages', action: () => navigate('/dashboard'), icon: Compass },
    { name: 'Navigation: Satellite Monitoring', category: 'Pages', action: () => navigate('/satellites'), icon: Compass },
    { name: 'Navigation: Astronaut Management', category: 'Pages', action: () => navigate('/crew'), icon: Compass },
    { name: 'Navigation: AI Command Center', category: 'Pages', action: () => navigate('/ai'), icon: Compass },
    { name: 'Navigation: Space Weather Alert', category: 'Pages', action: () => navigate('/weather'), icon: Compass },
    { name: 'Navigation: Mission Analytics', category: 'Pages', action: () => navigate('/analytics'), icon: Compass },
    { name: 'Navigation: Launch Operations', category: 'Pages', action: () => navigate('/launches'), icon: Compass },
    { name: 'Action: Reset Flight Simulator', category: 'Control Deck', action: () => alert('Simulator Reset Sequence Initiated.'), icon: Cpu },
    { name: 'Action: Force Orbit Correction', category: 'Control Deck', action: () => alert('Orbit corrections applied globally.'), icon: Activity },
    { name: 'Action: Trigger Fire Suppression', category: 'Emergency Protocols', action: () => alert('Fire suppression triggers: NOMINAL'), icon: ShieldAlert },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-spaceBg/70 backdrop-blur-md" onClick={onClose}></div>

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl bg-spaceCard/95 border border-accentCyan/30 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-float">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 bg-spaceBg/50">
          <Search className="h-5 w-5 text-accentCyan" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or nav shortcut..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white text-sm font-mono placeholder-gray-500"
          />
          <button
            onClick={onClose}
            className="text-[10px] font-mono border border-white/20 px-1.5 py-0.5 rounded text-gray-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-accentCyan/10 text-left transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-accentCyan" />
                    <span className="text-sm font-medium text-gray-300 font-mono">{cmd.name}</span>
                  </div>
                  <span className="text-[10px] font-orbitron font-semibold tracking-wider text-accentPurple uppercase bg-accentPurple/10 px-2 py-0.5 rounded-full">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-5 py-6 text-center text-sm text-gray-500 font-mono">
              No flight sequences found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
