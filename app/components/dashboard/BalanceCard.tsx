'use client';

// =============================================================================
// BalanceCard Component
// =============================================================================
// Individual balance card with icon, value, and animated counter
// =============================================================================

import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface BalanceCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBgClass?: string;
  subtitle?: string;
  highlight?: boolean;
  loading?: boolean;
}

export function BalanceCard({
  label,
  value,
  icon: Icon,
  iconBgClass = 'bg-teal-500/10 text-teal-400',
  subtitle,
  highlight = false,
  loading = false,
}: BalanceCardProps) {
  const [displayValue, setDisplayValue] = useState(loading ? '...' : value);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (!loading && value !== displayValue && displayValue !== '...') {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timeout);
    } else if (!loading) {
      setDisplayValue(value);
    }
  }, [value, loading, displayValue]);

  return (
    <div className={`card p-6 ${highlight ? 'card-glow' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="stat-label">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBgClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      
      <div className={`stat-value transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} ${highlight ? 'text-teal-400' : ''}`}>
        ${loading ? '...' : displayValue}
      </div>
      
      {subtitle && (
        <span className="text-sm text-zinc-500 mt-1 block">
          {subtitle}
        </span>
      )}
    </div>
  );
}

// Chain-specific balance cards
interface ChainBalanceCardProps {
  chain: 'base' | 'solana';
  balance: string;
  percent: number;
  loading?: boolean;
}

export function ChainBalanceCard({ chain, balance, percent, loading }: ChainBalanceCardProps) {
  const isBase = chain === 'base';
  
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="stat-label">{isBase ? 'Base Balance' : 'Solana Balance'}</span>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
          isBase 
            ? 'bg-blue-500' 
            : 'bg-gradient-to-br from-purple-500 to-teal-400'
        }`}>
          <span className="text-xs font-bold text-white">{isBase ? 'B' : 'S'}</span>
        </div>
      </div>
      
      <div className="stat-value">
        ${loading ? '...' : balance}
      </div>
      
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isBase ? 'bg-blue-500' : 'bg-gradient-to-r from-purple-500 to-teal-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-sm text-zinc-400 font-mono w-14 text-right">
          {percent.toFixed(1)}%
        </span>
      </div>
      
      {!isBase && (
        <span className="text-xs text-zinc-500 mt-2 block">(simulated)</span>
      )}
    </div>
  );
}

