import React from 'react';

const GlassCard = ({ children, className = '', glow = false, danger = false, onClick }) => {
  let cardClass = 'glass-panel';
  if (glow) cardClass = 'glass-panel-glow';
  if (danger) cardClass = 'glass-panel-danger';

  return (
    <div
      onClick={onClick}
      className={`${cardClass} p-5 md:p-6 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
