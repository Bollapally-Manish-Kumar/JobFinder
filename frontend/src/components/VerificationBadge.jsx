/**
 * Verification Badge Component
 * Shows verification ticks based on user plan with tooltips
 * 
 * BASIC_PLUS: Blue hollow tick ✔ - "Verified User"
 * AI: Double solid tick ✔✔ - "AI Verified"
 * PRO_PLUS: Triple gold tick ✔✔✔ - "Pro Verified"
 */

import { useState } from 'react';

// Verification badge configurations
const BADGE_CONFIG = {
  BASIC_PLUS: {
    label: 'Verified User',
    tooltip: 'Email verified • Active subscriber',
    ticks: 1,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-400',
    hollow: true
  },
  AI: {
    label: 'AI Verified',
    tooltip: 'Verified + AI profile analysis completed',
    ticks: 2,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-400',
    hollow: false
  },
  PRO_PLUS: {
    label: 'Pro Verified',
    tooltip: 'Verified • AI optimized • Priority profile',
    ticks: 3,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-400',
    hollow: false
  }
};

// Single tick SVG component
const Tick = ({ hollow = false, className = '' }) => (
  <svg 
    className={`w-4 h-4 ${className}`} 
    viewBox="0 0 24 24" 
    fill={hollow ? 'none' : 'currentColor'}
    stroke="currentColor"
    strokeWidth={hollow ? 2.5 : 0}
  >
    <path 
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function VerificationBadge({ plan, showLabel = false, size = 'md' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const config = BADGE_CONFIG[plan];
  if (!config) return null;
  
  const sizeClasses = {
    sm: 'scale-75',
    md: '',
    lg: 'scale-125'
  };

  return (
    <div 
      className={`relative inline-flex items-center gap-0.5 ${sizeClasses[size]}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Ticks */}
      <div className="flex items-center -space-x-1.5">
        {Array.from({ length: config.ticks }).map((_, i) => (
          <Tick 
            key={i} 
            hollow={config.hollow} 
            className={config.color}
          />
        ))}
      </div>
      
      {/* Label (optional) */}
      {showLabel && (
        <span className={`ml-1.5 text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className={`${config.bgColor} ${config.borderColor} border backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg whitespace-nowrap`}>
            <p className={`text-xs font-semibold ${config.color} mb-0.5`}>
              {config.label}
            </p>
            <p className="text-[10px] text-dark-300">
              {config.tooltip}
            </p>
          </div>
          {/* Arrow */}
          <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 ${config.bgColor} ${config.borderColor} border-r border-b transform rotate-45`} />
        </div>
      )}
    </div>
  );
}

// Export config for use elsewhere
export { BADGE_CONFIG };
