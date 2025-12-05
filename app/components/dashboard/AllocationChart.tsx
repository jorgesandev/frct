'use client';

// =============================================================================
// AllocationChart Component
// =============================================================================
// Donut chart showing treasury allocation between Base and Solana
// =============================================================================

import { useVault } from '@/hooks/useVault';
import { useSolanaVault } from '@/hooks/useSolanaVault';
import { useRiskSummary } from '@/hooks/useRiskSummary';

interface AllocationChartProps {
  showRecommended?: boolean;
}

export function AllocationChart({ showRecommended = true }: AllocationChartProps) {
  const { formatted, isLoading: vaultLoading } = useVault();
  const { balance: solanaBalance, isLoading: solanaLoading } = useSolanaVault();
  const { data: riskData } = useRiskSummary();

  if (vaultLoading || solanaLoading) {
    return (
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-center h-40 sm:h-48">
          <div className="animate-pulse text-zinc-500 text-sm">Loading allocation data...</div>
        </div>
      </div>
    );
  }

  // Calculate real percentages from actual balances
  const solanaBalanceNum = parseFloat(solanaBalance) || 0;
  const baseBalanceNum = parseFloat(formatted.baseBalanceFormatted.replace(/,/g, '')) || 0;
  const realTotalValue = baseBalanceNum + solanaBalanceNum;
  
  const basePercent = realTotalValue > 0 ? (baseBalanceNum / realTotalValue) * 100 : 50;
  const solanaPercent = realTotalValue > 0 ? (solanaBalanceNum / realTotalValue) * 100 : 50;

  // SVG calculations for donut chart - responsive sizes
  const size = 140; // Base size for mobile
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke offsets for each segment
  const baseOffset = 0;
  const baseDash = (basePercent / 100) * circumference;
  const solanaDash = (solanaPercent / 100) * circumference;

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mb-4 sm:mb-6">Treasury Allocation</h3>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]" viewBox={`0 0 ${size} ${size}`}>
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
            <span className="text-lg sm:text-xl font-bold text-zinc-100 font-mono">
              ${realTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-500">Total Value</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex sm:flex-col gap-4 sm:space-y-4">
          {/* Base */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-zinc-100">Base</p>
              <p className="text-[10px] sm:text-xs text-zinc-500">
                ${formatted.baseBalanceFormatted} ({basePercent.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Solana */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-zinc-100">Solana</p>
              <p className="text-[10px] sm:text-xs text-zinc-500">
                ${solanaBalanceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({solanaPercent.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Allocation */}
      {showRecommended && riskData && (
        <div className="mt-4 sm:mt-6 pt-4 border-t border-zinc-800">
          <p className="text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3">Recommended ({riskData.regime})</p>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex-1 p-2 sm:p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] sm:text-xs text-zinc-400">Base</span>
              </div>
              <span className="text-base sm:text-lg font-mono font-bold text-zinc-100">
                {riskData.recommendedBasePct}%
              </span>
              {riskData.recommendedBasePct !== basePercent && (
                <span className={`text-[10px] sm:text-xs ml-1 sm:ml-2 ${riskData.recommendedBasePct > basePercent ? 'text-green-400' : 'text-red-400'}`}>
                  {riskData.recommendedBasePct > basePercent ? '↑' : '↓'}
                  {Math.abs(riskData.recommendedBasePct - basePercent).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex-1 p-2 sm:p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] sm:text-xs text-zinc-400">Solana</span>
              </div>
              <span className="text-base sm:text-lg font-mono font-bold text-zinc-100">
                {riskData.recommendedSolanaPct}%
              </span>
              {riskData.recommendedSolanaPct !== solanaPercent && (
                <span className={`text-[10px] sm:text-xs ml-1 sm:ml-2 ${riskData.recommendedSolanaPct > solanaPercent ? 'text-green-400' : 'text-red-400'}`}>
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

