'use client';

// =============================================================================
// Dashboard Page
// =============================================================================
// Main dashboard with treasury overview, risk display, and actions
// =============================================================================

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  Wallet, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  Activity,
  Settings,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import Link from 'next/link';

import { useVault, useUserUsdc } from '@/hooks/useVault';
import { useRiskSummary, getRegimeBadgeClass } from '@/hooks/useRiskSummary';
import { 
  ChainBalanceCard, 
  RiskGauge, 
  AllocationChart, 
  DepositForm, 
  WithdrawForm,
  SetAllocationForm,
  RebalanceButton 
} from '@/components/dashboard';

type Tab = 'overview' | 'deposit' | 'withdraw' | 'settings';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: vault, formatted, isLoading: vaultLoading, refetch: refetchVault, vaultAddress } = useVault();
  const { balanceFormatted: userUsdcBalance } = useUserUsdc();
  const { data: riskData, isLoading: riskLoading, refetch: refetchRisk } = useRiskSummary();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const handleRefresh = () => {
    refetchVault();
    refetchRisk();
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: Activity },
    { id: 'deposit' as Tab, label: 'Deposit', icon: ArrowDownToLine },
    { id: 'withdraw' as Tab, label: 'Withdraw', icon: ArrowUpFromLine, ownerOnly: true },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings, ownerOnly: true },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Treasury Dashboard</h1>
          <p className="mt-1 text-zinc-400">Monitor and manage your FRCT treasury</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center gap-2 !py-2 !px-3"
          >
            <RefreshCw className={`h-4 w-4 ${vaultLoading || riskLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {vault.isOwner && (
            <span className="badge badge-aggressive">
              <CheckCircle2 className="h-3 w-3" />
              Owner
            </span>
          )}
        </div>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <div className="mb-8 card-glow p-4 flex items-center gap-3 text-yellow-400 border-yellow-500/30">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>Connect your wallet to interact with the treasury.</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isHidden = tab.ownerOnly && !vault.isOwner;
          if (isHidden) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 border border-transparent'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Main Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Value */}
            <div className="card p-6 card-glow">
              <div className="flex items-center justify-between mb-4">
                <span className="stat-label">Total Value</span>
                <Wallet className="h-5 w-5 text-teal-400" />
              </div>
              <div className="stat-value text-teal-400">
                ${vaultLoading ? '...' : formatted.totalValueFormatted}
              </div>
              <span className="text-sm text-zinc-500 mt-1 block">USDC</span>
            </div>

            {/* Chain Balances */}
            <ChainBalanceCard 
              chain="base" 
              balance={formatted.baseBalanceFormatted}
              percent={formatted.actualBasePercent}
              loading={vaultLoading}
            />
            <ChainBalanceCard 
              chain="solana" 
              balance={formatted.solanaBalanceFormatted}
              percent={formatted.actualSolanaPercent}
              loading={vaultLoading}
            />

            {/* Risk Score Quick View */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="stat-label">Risk Score</span>
                <Activity className="h-5 w-5 text-teal-400" />
              </div>
              <div className="stat-value">
                {riskLoading ? '...' : riskData?.riskScore ?? '--'}
              </div>
              {riskData && (
                <span className={`badge ${getRegimeBadgeClass(riskData.regime)} mt-2`}>
                  {riskData.regime}
                </span>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Risk Gauge */}
            <RiskGauge />
            
            {/* Allocation Chart */}
            <AllocationChart />
          </div>

          {/* Rebalance Button (if owner) */}
          {vault.isOwner && (
            <div className="mb-8">
              <RebalanceButton />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/risk" className="card p-4 hover:border-teal-500/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-100">Risk Engine</p>
                  <p className="text-sm text-zinc-500">View full analysis</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 ml-auto group-hover:text-teal-400 transition-colors" />
              </div>
            </Link>

            <a 
              href={`https://sepolia.basescan.org/address/${vaultAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 hover:border-teal-500/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-100">View Contract</p>
                  <p className="text-sm text-zinc-500">Basescan Explorer</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 ml-auto group-hover:text-blue-400 transition-colors" />
              </div>
            </a>

            {isConnected && (
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">Your USDC</p>
                    <p className="text-sm text-teal-400 font-mono">
                      ${userUsdcBalance}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Explanations */}
          {riskData && riskData.explanations.length > 0 && (
            <div className="mt-8 card p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Risk Assessment</h2>
              <ul className="space-y-2">
                {riskData.explanations.map((explanation, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="text-teal-400 mt-0.5">•</span>
                    {explanation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {activeTab === 'deposit' && (
        <div className="max-w-md mx-auto">
          <DepositForm />
        </div>
      )}

      {activeTab === 'withdraw' && vault.isOwner && (
        <div className="max-w-md mx-auto">
          <WithdrawForm />
        </div>
      )}

      {activeTab === 'settings' && vault.isOwner && (
        <div className="max-w-md mx-auto space-y-6">
          <SetAllocationForm />
          <RebalanceButton />
        </div>
      )}
    </div>
  );
}
