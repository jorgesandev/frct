'use client';

// =============================================================================
// AllocationChart Component
// =============================================================================
// Donut chart showing treasury allocation between Base and Solana
// =============================================================================

import { useVault } from '@/hooks/useVault';
import { useRiskSummary } from '@/hooks/useRiskSummary';

interface AllocationChartProps {
  showRecommended?: boolean;
}

export function AllocationChart({ showRecommended = true }: AllocationChartProps) {
  const { data: vault, formatted, isLoading: vaultLoading } = useVault();
  const { data: riskData } = useRiskSummary();

  if (vaultLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-zinc-500">Loading allocation data...</div>
        </div>
      </div>
    );
  }

  const basePercent = formatted.actualBasePercent || 50;
  const solanaPercent = formatted.actualSolanaPercent || 50;

  // SVG calculations for donut chart
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke offsets for each segment
  const baseOffset = 0;
  const baseDash = (basePercent / 100) * circumference;
  const solanaDash = (solanaPercent / 100) * circumference;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-6">Treasury Allocation</h3>

      <div className="flex items-center justify-center gap-8">
        {/* Donut Chart */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgb(39, 39, 42)"
              strokeWidth={strokeWidth}
            />
            
            {/* Base segment (blue) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${baseDash} ${circumference}`}
              strokeDashoffset={baseOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            
            {/* Solana segment (gradient represented as purple) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgb(168, 85, 247)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${solanaDash} ${circumference}`}
              strokeDashoffset={-baseDash}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-zinc-100 font-mono">
              ${formatted.totalValueFormatted}
            </span>
            <span className="text-xs text-zinc-500">Total Value</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {/* Base */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Base</p>
              <p className="text-xs text-zinc-500">
                ${formatted.baseBalanceFormatted} ({basePercent.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Solana */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-teal-400" />
            <div>
              <p className="text-sm font-medium text-zinc-100">Solana</p>
              <p className="text-xs text-zinc-500">
                ${formatted.solanaBalanceFormatted} ({solanaPercent.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Allocation */}
      {showRecommended && riskData && (
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-400 mb-3">Recommended by Risk Engine ({riskData.regime})</p>
          <div className="flex gap-4">
            <div className="flex-1 p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-zinc-400">Base</span>
              </div>
              <span className="text-lg font-mono font-bold text-zinc-100">
                {riskData.recommendedBasePct}%
              </span>
              {riskData.recommendedBasePct !== basePercent && (
                <span className={`text-xs ml-2 ${riskData.recommendedBasePct > basePercent ? 'text-green-400' : 'text-red-400'}`}>
                  {riskData.recommendedBasePct > basePercent ? '↑' : '↓'}
                  {Math.abs(riskData.recommendedBasePct - basePercent).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex-1 p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs text-zinc-400">Solana</span>
              </div>
              <span className="text-lg font-mono font-bold text-zinc-100">
                {riskData.recommendedSolanaPct}%
              </span>
              {riskData.recommendedSolanaPct !== solanaPercent && (
                <span className={`text-xs ml-2 ${riskData.recommendedSolanaPct > solanaPercent ? 'text-green-400' : 'text-red-400'}`}>
                  {riskData.recommendedSolanaPct > solanaPercent ? '↑' : '↓'}
                  {Math.abs(riskData.recommendedSolanaPct - solanaPercent).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

