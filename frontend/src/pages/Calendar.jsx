import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, Compass, Plus } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/calendar', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setEvents(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron tracking-widest text-gradient-cyan uppercase">
            OPERATIONAL CALENDAR
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-1">LAUNCH SCHEDULES &bull; VEHICLE MAINTENANCE SLICES</p>
        </div>
      </div>

      {/* Grid of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((e) => (
            <GlassCard key={e.id} className="flex flex-col gap-3 border-l-4 border-l-accentCyan bg-accentCyan/5">
              <div className="flex justify-between items-start">
                <h3 className="font-orbitron font-bold text-white text-xs uppercase tracking-wider">{e.title}</h3>
                <span className="text-[8px] font-mono bg-accentCyan/20 text-accentCyan px-1.5 py-0.5 rounded uppercase font-bold">
                  {e.type}
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-[9px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-accentCyan" /> Start: {new Date(e.startDate).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-accentCyan" /> End: {new Date(e.endDate).toLocaleString()}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">{e.description}</p>
            </GlassCard>
          ))
        ) : (
          <p className="text-xs text-gray-500 font-mono text-center py-6 col-span-full">No operational schedule events found.</p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
