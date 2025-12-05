'use client';

// =============================================================================
// RebalanceButton Component
// =============================================================================
// Button to trigger rebalance planning based on risk engine recommendations
// =============================================================================

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Loader2, Check, AlertCircle, Lock, RefreshCw, ArrowRightLeft } from 'lucide-react';

import { useVault } from '@/hooks/useVault';
import { useRiskSummary } from '@/hooks/useRiskSummary';
import { TREASURY_VAULT_ABI, BASE_SEPOLIA_CHAIN_ID } from '@/lib/contracts';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS as `0x${string}`;

type RebalanceStep = 'idle' | 'planning' | 'success' | 'error';

export function RebalanceButton() {
  const { isConnected } = useAccount();
  const { data: vault, formatted, refetch: refetchVault } = useVault();
  const { data: riskData } = useRiskSummary();
  
  const [step, setStep] = useState<RebalanceStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Plan rebalance transaction
  const { 
    data: rebalanceHash, 
    writeContract: writeRebalance, 
    isPending: isRebalancePending,
    error: rebalanceError,
    reset: resetRebalance,
  } = useWriteContract();

  const { isLoading: isRebalanceConfirming, isSuccess: isRebalanceConfirmed } = useWaitForTransactionReceipt({
    hash: rebalanceHash,
  });

  // Handle confirmation
  useEffect(() => {
    if (isRebalanceConfirmed && step === 'planning') {
      setStep('success');
      refetchVault();
    }
  }, [isRebalanceConfirmed, step]);

  // Handle errors
  useEffect(() => {
    if (rebalanceError) {
      setErrorMessage(rebalanceError.message || 'Rebalance failed');
      setStep('error');
    }
  }, [rebalanceError]);

  const handleRebalance = () => {
    if (!riskData) return;
    
    const newBaseBps = Math.round(riskData.recommendedBasePct * 100);
    const newSolanaBps = Math.round(riskData.recommendedSolanaPct * 100);
    
    setStep('planning');
    setErrorMessage(null);
    writeRebalance({
      address: VAULT_ADDRESS,
      abi: TREASURY_VAULT_ABI,
      functionName: 'planRebalance',
      args: [newBaseBps, newSolanaBps],
      chainId: BASE_SEPOLIA_CHAIN_ID, // Force Base Sepolia
    });
  };

  const handleReset = () => {
    setStep('idle');
    setErrorMessage(null);
    resetRebalance();
  };

  if (!isConnected) {
    return null;
  }

  if (!vault.isOwner) {
    return null; // Only show for owner
  }

  if (!riskData) {
    return null;
  }

  // Check if rebalance is needed
  const currentBase = formatted.targetBasePercent;
  const recommendedBase = riskData.recommendedBasePct;
  const difference = Math.abs(currentBase - recommendedBase);
  const needsRebalance = difference >= 5; // 5% threshold

  if (!needsRebalance && step === 'idle') {
    return (
      <div className="card p-4 border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-zinc-100">Allocation Optimal</p>
            <p className="text-sm text-zinc-500">
              Current allocation matches risk recommendation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 border-teal-500/20 card-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Rebalance Available</h3>
        <ArrowRightLeft className="h-5 w-5 text-teal-400" />
      </div>

      {step === 'success' ? (
        <div className="text-center py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400 mx-auto mb-3">
            <Check className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-zinc-100 mb-2">Rebalance Planned!</p>
          <p className="text-xs text-zinc-400 mb-3">
            CCTP bridge will execute the transfer.
          </p>
          <a
            href={`https://sepolia.basescan.org/tx/${rebalanceHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-400 hover:text-teal-300"
          >
            View transaction →
          </a>
          <button
            onClick={handleReset}
            className="btn-secondary w-full mt-4 !py-2 text-sm"
          >
            Done
          </button>
        </div>
      ) : step === 'error' ? (
        <div className="text-center py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 mx-auto mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-zinc-100 mb-2">Failed</p>
          <p className="text-xs text-red-400 mb-3">
            {errorMessage?.slice(0, 50)}
          </p>
          <button
            onClick={handleReset}
            className="btn-secondary w-full !py-2 text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Current vs Recommended */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
              <span className="text-sm text-zinc-400">Current</span>
              <span className="font-mono text-sm text-zinc-100">
                {currentBase}% / {100 - currentBase}%
              </span>
            </div>
            <div className="flex justify-center">
              <RefreshCw className="h-4 w-4 text-teal-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <span className="text-sm text-teal-400">Recommended</span>
              <span className="font-mono text-sm text-teal-400">
                {recommendedBase}% / {100 - recommendedBase}%
              </span>
            </div>
          </div>

          {/* Regime explanation */}
          <p className="text-xs text-zinc-500 mb-4">
            Risk engine suggests <strong className="text-zinc-300">{riskData.regime}</strong> allocation 
            based on current market conditions.
          </p>

          {/* Button */}
          {step === 'planning' && (isRebalancePending || isRebalanceConfirming) ? (
            <div className="flex items-center justify-center gap-2 py-3 text-teal-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Planning rebalance...</span>
            </div>
          ) : (
            <button
              onClick={handleRebalance}
              className="btn-primary w-full"
            >
              Apply Rebalance
            </button>
          )}
        </>
      )}
    </div>
  );
}

