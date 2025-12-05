'use client';

// =============================================================================
// Risk Engine Page
// =============================================================================
// Detailed view of Polymarket risk factors and scoring methodology
// =============================================================================

import { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Info,
  ExternalLink,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';

import { RiskSummary, MarketData } from '@/types/risk';

export default function RiskPage() {
  const [riskData, setRiskData] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/risk-summary');
      if (!response.ok) throw new Error('Failed to fetch risk data');
      const data = await response.json();
      setRiskData(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Aggressive': return 'text-green-400';
      case 'Defensive': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getRegimeBgColor = (regime: string) => {
    switch (regime) {
      case 'Aggressive': return 'bg-green-500/10 border-green-500/30';
      case 'Defensive': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getRiskBarColor = (score: number) => {
    if (score < 35) return 'from-green-500 to-green-400';
    if (score < 65) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Risk Engine</h1>
          <p className="mt-1 text-zinc-400">Polymarket-powered risk assessment and allocation recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {lastRefresh.toLocaleTimeString()}
              {riskData?.cacheHit && ' (cached)'}
            </span>
          )}
          <button
            onClick={fetchRiskData}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 !py-2 !px-3"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 card p-4 border-red-500/30 bg-red-500/10 text-red-400">
          Error: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !riskData && (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      )}

      {/* Main Content */}
      {riskData && (
        <>
          {/* Score Overview */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Risk Score Card */}
            <div className="card-glow p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-zinc-100">Overall Risk Score</h2>
                <span className={`badge ${riskData.regime === 'Aggressive' ? 'badge-aggressive' : riskData.regime === 'Defensive' ? 'badge-defensive' : 'badge-neutral'}`}>
                  {riskData.regime}
                </span>
              </div>

              {/* Large Score Display */}
              <div className="flex items-end gap-4 mb-6">
                <span className="text-7xl font-bold font-mono text-zinc-100">
                  {riskData.riskScore}
                </span>
                <span className="text-2xl text-zinc-500 mb-2">/ 100</span>
              </div>

              {/* Score Bar */}
              <div className="relative h-4 rounded-full overflow-hidden bg-zinc-800 mb-2">
                <div 
                  className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${getRiskBarColor(riskData.riskScore)} transition-all duration-500`}
                  style={{ width: `${riskData.riskScore}%` }}
                />
                {/* Threshold markers */}
                <div className="absolute left-[35%] top-0 bottom-0 w-px bg-zinc-600" />
                <div className="absolute left-[65%] top-0 bottom-0 w-px bg-zinc-600" />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>0 (Low Risk)</span>
                <span>35</span>
                <span>65</span>
                <span>100 (High Risk)</span>
              </div>
            </div>

            {/* Recommended Allocation */}
            <div className={`card p-6 border ${getRegimeBgColor(riskData.regime)}`}>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-teal-400" />
                <h2 className="text-lg font-semibold text-zinc-100">Recommended</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-zinc-400">Base (Stable)</span>
                    <span className="font-mono font-bold text-zinc-100">{riskData.recommendedBasePct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${riskData.recommendedBasePct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-zinc-400">Solana (Growth)</span>
                    <span className="font-mono font-bold text-zinc-100">{riskData.recommendedSolanaPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${riskData.recommendedSolanaPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-700/50">
                <p className="text-xs text-zinc-500">
                  {riskData.regime === 'Defensive' 
                    ? 'Higher allocation to stable Base chain due to elevated risk.'
                    : riskData.regime === 'Aggressive'
                    ? 'Higher allocation to Solana for growth in low-risk environment.'
                    : 'Balanced allocation for moderate risk conditions.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Market Factors */}
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">Market Factors</h2>
              <a 
                href="https://polymarket.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                Polymarket <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Market</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Probability</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Weight</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Risk Contribution</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riskData.markets.map((market) => (
                    <MarketRow key={market.key} market={market} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Explanations */}
          <div className="card p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-teal-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Risk Assessment Summary</h2>
            </div>
            <ul className="space-y-3">
              {riskData.explanations.map((explanation, idx) => (
                <li key={idx} className="flex items-start gap-3 text-zinc-300">
                  <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-400" />
                  <span>{explanation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Methodology */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Methodology</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-zinc-400">
                FRCT uses a weighted-sum model to calculate an aggregate risk score from Polymarket prediction markets:
              </p>
              <div className="terminal my-4">
                <code className="text-teal-400">
                  riskScore = Σ(market_probability × market_weight × risk_direction) × 100
                </code>
              </div>
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-2">Aggressive (0-35)</h4>
                  <p className="text-sm text-zinc-400">Low risk environment. Higher allocation to Solana for growth potential.</p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <h4 className="font-semibold text-yellow-400 mb-2">Neutral (35-65)</h4>
                  <p className="text-sm text-zinc-400">Moderate risk. Balanced allocation between Base and Solana.</p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <h4 className="font-semibold text-red-400 mb-2">Defensive (65-100)</h4>
                  <p className="text-sm text-zinc-400">High risk environment. Higher allocation to Base for stability.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MarketRow({ market }: { market: MarketData }) {
  const isPositiveContribution = market.riskContribution > 0;
  
  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
      <td className="py-4 px-4">
        <p className="text-sm text-zinc-100">{market.question}</p>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">{market.slug}</p>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-mono text-teal-400">
          {(market.probability * 100).toFixed(1)}%
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-mono text-zinc-400">
          {(market.weight * 100).toFixed(0)}%
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={`font-mono ${isPositiveContribution ? 'text-red-400' : 'text-green-400'}`}>
            {isPositiveContribution ? '+' : ''}{(market.riskContribution * 100).toFixed(1)}
          </span>
          {isPositiveContribution ? (
            <TrendingUp className="h-4 w-4 text-red-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-400" />
          )}
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`inline-flex h-2 w-2 rounded-full ${market.status === 'active' ? 'bg-green-400' : 'bg-zinc-500'}`} />
      </td>
    </tr>
  );
}

