import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, ChevronDown, ChevronRight, Compass, ShieldAlert, Cpu, 
  Activity, Sun, Globe, Radio, User, BookOpen, Database, 
  Settings, Folder, Calendar, Terminal, ShieldCheck 
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [expandedDecks, setExpandedDecks] = useState({
    command: true,
    flight: false,
    orbit: false,
    science: false,
    crew: false,
    data: false,
    systems: false
  });

  const toggleDeck = (deck) => {
    setExpandedDecks(prev => ({ ...prev, [deck]: !prev[deck] }));
  };

  const isActive = (path) => location.pathname === path;

  const decks = [
    {
      id: 'command',
      label: 'Command Deck',
      icon: Compass,
      links: [
        { name: 'Operations Deck', path: '/dashboard' },
        { name: 'Mission Control Room', path: '/control-room' }
      ]
    },
    {
      id: 'flight',
      label: 'Flight Ops',
      icon: Cpu,
      links: [
        { name: 'Launch Center', path: '/launches' }
      ]
    },
    {
      id: 'orbit',
      label: 'Orbit Ops',
      icon: Globe,
      links: [
        { name: 'Satellites Tracker', path: '/satellites' }
      ]
    },
    {
      id: 'crew',
      label: 'Crew Quarters',
      icon: User,
      links: [
        { name: 'Crew Biometrics', path: '/crew' }
      ]
    },
    {
      id: 'science',
      label: 'Science Deck',
      icon: Sun,
      links: [
        { name: 'Space Weather', path: '/weather' },
        { name: 'Sol Explorer', path: '/explorer' },
        { name: 'Rover Controls', path: '/rover' }
      ]
    },
    {
      id: 'data',
      label: 'Data Center',
      icon: Folder,
      links: [
        { name: 'Mission Calendar', path: '/calendar' },
        { name: 'Historical Archive', path: '/archive' },
        { name: 'Mission Documents', path: '/documents' }
      ]
    },
    {
      id: 'systems',
      label: 'Systems Monitor',
      icon: Database,
      links: [
        { name: 'Health & Diagnostics', path: '/health' },
        { name: 'Security Dashboard', path: '/security' }
      ]
    }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-full z-45 bg-spaceCard/95 border-r border-accentCyan/10 w-64 pt-16 flex flex-col transition-transform duration-300 backdrop-blur-md ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-4">
        {decks.map((deck) => {
          const Icon = deck.icon;
          const isExpanded = expandedDecks[deck.id];
          return (
            <div key={deck.id} className="flex flex-col gap-1.5">
              <button
                onClick={() => toggleDeck(deck.id)}
                className="w-full flex items-center justify-between text-xs font-bold font-orbitron text-gray-500 hover:text-accentCyan tracking-wider uppercase py-1 text-left"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accentCyan/75" />
                  {deck.label}
                </span>
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-1 pl-6 border-l border-white/5 mt-1">
                  {deck.links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-xs font-mono py-1.5 px-3 rounded transition-colors ${
                        isActive(link.path) 
                          ? 'text-accentCyan bg-accentCyan/10 font-bold border-r-2 border-accentCyan' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
