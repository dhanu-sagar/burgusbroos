import React from 'react';
import { motion } from 'framer-motion';

interface FocusProgressRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  animate?: boolean;
}

export const FocusProgressRing: React.FC<FocusProgressRingProps> = ({
  score,
  size = 140,
  strokeWidth = 9,
  className = '',
  animate = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Focus Score: ${clampedScore} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          {/* Apple-inspired sleek monochromatic gradient */}
          <linearGradient id="focusRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#3f3f46" />
          </linearGradient>

          {/* Optional soft ambient shadow filter */}
          <filter id="ringSoftGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(0, 0, 0, 0.06)"
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Circle */}
        {animate ? (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#focusRingGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: 1.0,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.15,
            }}
            filter="url(#ringSoftGlow)"
          />
        ) : (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#focusRingGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#ringSoftGlow)"
          />
        )}
      </svg>

      {/* Numerical Badge in Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-none tabular-nums">
          {clampedScore}
        </span>
        <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-neutral-400 mt-1">
          / 100
        </span>
      </div>
    </div>
  );
};
