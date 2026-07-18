import React from 'react';
import { X, Check, AlertTriangle, Info, Skull } from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose, notifications, onMarkAsRead }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex shadow-2xl">
      {/* Background click dismiss */}
      <div className="absolute inset-0 bg-spaceBg/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Panel */}
      <div className="relative w-full bg-spaceCard/95 border-l border-accentCyan/20 backdrop-blur-xl h-full flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <h2 className="text-lg font-black font-orbitron text-gradient-cyan uppercase tracking-widest">
            Telemetry Alerts
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              // Type-specific styles
              let borderClass = 'border-accentCyan/20';
              let iconColor = 'text-accentCyan';
              let Icon = Info;

              if (notif.type === 'warning') {
                borderClass = 'border-accentPurple/40';
                iconColor = 'text-accentPurple';
                Icon = AlertTriangle;
              } else if (notif.type === 'danger') {
                borderClass = 'border-accentDanger/50';
                iconColor = 'text-accentDanger';
                Icon = Skull;
              }

              return (
                <div
                  key={notif._id}
                  className={`border ${borderClass} rounded-lg p-4 bg-spaceBg/40 relative group transition-all duration-200 ${
                    notif.read ? 'opacity-50' : 'opacity-100 hover:bg-spaceBg/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white font-orbitron">{notif.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{notif.message}</p>
                      <span className="text-[10px] text-gray-500 mt-2 block font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => onMarkAsRead(notif._id)}
                      className="absolute top-4 right-4 p-1 rounded-full bg-accentCyan/10 hover:bg-accentCyan text-accentCyan hover:text-spaceBg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Clear alert"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 font-mono gap-2">
              <Check className="h-8 w-8 text-accentCyan animate-pulse" />
              <span>All flight vectors clean. No active alarms.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
