'use client';

// =============================================================================
// RiskGauge Component
// =============================================================================
// Visual gauge showing current risk score with animated needle
// =============================================================================

import { Activity } from 'lucide-react';
import { useRiskSummary, getRegimeBadgeClass, getRiskScoreColor } from '@/hooks/useRiskSummary';

interface RiskGaugeProps {
  compact?: boolean;
}

export function RiskGauge({ compact = false }: RiskGaugeProps) {
  const { data: riskData, isLoading } = useRiskSummary();

  if (isLoading) {
    return (
      <div className={`card ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-zinc-500">Loading risk data...</div>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className={`card ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-center h-32 text-zinc-500">
          Unable to load risk data
        </div>
      </div>
    );
  }

  const { riskScore, regime } = riskData;
  
  // Calculate needle rotation: -90deg (0) to 90deg (100)
  const needleRotation = ((riskScore / 100) * 180) - 90;

  return (
    <div className={`card ${compact ? 'p-4' : 'p-4 sm:p-6'}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-zinc-100">Risk Score</h3>
        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
      </div>

      {/* Gauge Container */}
      <div className="relative flex flex-col items-center">
        {/* Semi-circle Gauge */}
        <div className="relative w-40 h-20 sm:w-48 sm:h-24 overflow-hidden">
          {/* Background arc segments */}
          <svg 
            viewBox="0 0 200 100" 
            className="w-full h-full"
            style={{ transform: 'rotate(0deg)' }}
          >
            {/* Green zone (0-35) */}
            <path
              d="M 10 100 A 90 90 0 0 1 73 23"
              fill="none"
              stroke="rgba(34, 197, 94, 0.3)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Yellow zone (35-65) */}
            <path
              d="M 73 23 A 90 90 0 0 1 127 23"
              fill="none"
              stroke="rgba(245, 158, 11, 0.3)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Red zone (65-100) */}
            <path
              d="M 127 23 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="rgba(239, 68, 68, 0.3)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            
            {/* Active arc - shows current score */}
            <path
              d={`M 10 100 A 90 90 0 ${riskScore > 50 ? 1 : 0} 1 ${getArcEndpoint(riskScore)}`}
              fill="none"
              stroke={getStrokeColor(riskScore)}
              strokeWidth="16"
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
            style={{ 
              transform: `translateX(-50%) rotate(${needleRotation}deg)`,
              width: '3px',
              height: '55px',
            }}
          >
            <div className="w-full h-full bg-gradient-to-t from-zinc-400 to-zinc-200 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-200 rounded-full" />
          </div>
        </div>

        {/* Score Display */}
        <div className="mt-3 sm:mt-4 text-center">
          <span className={`text-4xl sm:text-5xl font-bold font-mono ${getRiskScoreColor(riskScore)}`}>
            {riskScore}
          </span>
          <span className="text-lg sm:text-xl text-zinc-500 ml-1">/100</span>
        </div>

        {/* Regime Badge */}
        <div className="mt-2 sm:mt-3">
          <span className={`badge ${getRegimeBadgeClass(regime)} text-xs sm:text-sm`}>
            {regime}
          </span>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between w-full mt-3 sm:mt-4 text-[10px] sm:text-xs text-zinc-500">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
}

function getArcEndpoint(score: number): string {
  // Convert score (0-100) to angle (0-180 degrees, starting from left)
  const angle = (score / 100) * Math.PI;
  const x = 100 - 90 * Math.cos(angle);
  const y = 100 - 90 * Math.sin(angle);
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
}

function getStrokeColor(score: number): string {
  if (score < 35) return 'rgb(34, 197, 94)'; // green
  if (score < 65) return 'rgb(245, 158, 11)'; // yellow
  return 'rgb(239, 68, 68)'; // red
}

