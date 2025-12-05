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
      <div className={`card ${compact ? 'p-4' : 'p-4 sm:p-6'}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-zinc-500">Loading risk data...</div>
        </div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className={`card ${compact ? 'p-4' : 'p-4 sm:p-6'}`}>
        <div className="flex items-center justify-center h-32 text-zinc-500">
          Unable to load risk data
        </div>
      </div>
    );
  }

  const { riskScore, regime } = riskData;
  
  // Calculate needle rotation: -90deg (0) to 90deg (100)
  const needleRotation = ((riskScore / 100) * 180) - 90;

  // SVG arc parameters
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  // Create arc path for semi-circle (bottom half)
  const createArc = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Active arc endpoint based on score
  const scoreAngle = 180 + (riskScore / 100) * 180; // 180 to 360 degrees
  const activeArc = createArc(180, Math.min(scoreAngle, 360));

  return (
    <div className={`card ${compact ? 'p-4' : 'p-4 sm:p-6'}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-zinc-100">Risk Score</h3>
        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
      </div>

      {/* Gauge Container */}
      <div className="relative flex flex-col items-center">
        {/* Semi-circle Gauge */}
        <div className="relative w-44 h-24 sm:w-52 sm:h-28">
          <svg 
            viewBox="0 0 200 110" 
            className="w-full h-full"
          >
            {/* Background arc - Gray */}
            <path
              d={createArc(180, 360)}
              fill="none"
              stroke="rgba(63, 63, 70, 0.5)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Green zone (0-35%) */}
            <path
              d={createArc(180, 243)}
              fill="none"
              stroke="rgba(34, 197, 94, 0.3)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Yellow zone (35-65%) */}
            <path
              d={createArc(243, 297)}
              fill="none"
              stroke="rgba(245, 158, 11, 0.3)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Red zone (65-100%) */}
            <path
              d={createArc(297, 360)}
              fill="none"
              stroke="rgba(239, 68, 68, 0.3)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Active arc - shows current score */}
            {riskScore > 0 && (
              <path
                d={activeArc}
                fill="none"
                stroke={getStrokeColor(riskScore)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            )}

            {/* Needle */}
            <g transform={`rotate(${needleRotation}, ${centerX}, ${centerY})`}>
              <line
                x1={centerX}
                y1={centerY}
                x2={centerX}
                y2={centerY - radius + 15}
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r="6"
                fill="white"
              />
            </g>
          </svg>
        </div>

        {/* Score Display */}
        <div className="mt-2 sm:mt-3 text-center">
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

function getStrokeColor(score: number): string {
  if (score < 35) return 'rgb(34, 197, 94)'; // green
  if (score < 65) return 'rgb(245, 158, 11)'; // yellow
  return 'rgb(239, 68, 68)'; // red
}
