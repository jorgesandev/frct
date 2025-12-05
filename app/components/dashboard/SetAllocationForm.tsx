'use client';

// =============================================================================
// SetAllocationForm Component
// =============================================================================
// Form for setting target allocation between Base and Solana (owner only)
// =============================================================================

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Loader2, Check, AlertCircle, Lock, Target } from 'lucide-react';

import { useVault } from '@/hooks/useVault';
import { useRiskSummary } from '@/hooks/useRiskSummary';
import { TREASURY_VAULT_ABI } from '@/lib/contracts';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS as `0x${string}`;

type SetAllocationStep = 'input' | 'setting' | 'success' | 'error';

export function SetAllocationForm() {
  const { isConnected } = useAccount();
  const { data: vault, formatted, refetch: refetchVault } = useVault();
  const { data: riskData } = useRiskSummary();
  
  const [basePercent, setBasePercent] = useState(50);
  const [step, setStep] = useState<SetAllocationStep>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync slider with current allocation
  useEffect(() => {
    if (formatted.targetBasePercent) {
      setBasePercent(formatted.targetBasePercent);
    }
  }, [formatted.targetBasePercent]);

  const solanaPercent = 100 - basePercent;
  const baseBps = Math.round(basePercent * 100);
  const solanaBps = Math.round(solanaPercent * 100);

  // Set allocation transaction
  const { 
    data: setAllocationHash, 
    writeContract: writeSetAllocation, 
    isPending: isSetAllocationPending,
    error: setAllocationError,
  } = useWriteContract();

  const { isLoading: isSetAllocationConfirming, isSuccess: isSetAllocationConfirmed } = useWaitForTransactionReceipt({
    hash: setAllocationHash,
  });

  // Handle confirmation
  useEffect(() => {
    if (isSetAllocationConfirmed && step === 'setting') {
      setStep('success');
      refetchVault();
    }
  }, [isSetAllocationConfirmed, step]);

  // Handle errors
  useEffect(() => {
    if (setAllocationError) {
      setErrorMessage(setAllocationError.message || 'Failed to set allocation');
      setStep('error');
    }
  }, [setAllocationError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('setting');
    setErrorMessage(null);
    writeSetAllocation({
      address: VAULT_ADDRESS,
      abi: TREASURY_VAULT_ABI,
      functionName: 'setTargetAllocation',
      args: [baseBps, solanaBps],
    });
  };

  const handleApplyRecommended = () => {
    if (riskData) {
      setBasePercent(riskData.recommendedBasePct);
    }
  };

  const handleReset = () => {
    setStep('input');
    setErrorMessage(null);
  };

  if (!isConnected) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Set Allocation</h3>
        <div className="text-center py-8 text-zinc-500">
          Connect your wallet
        </div>
      </div>
    );
  }

  if (!vault.isOwner) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Set Allocation</h3>
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <p className="text-zinc-400">
            Only the vault owner can set allocation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Set Target Allocation</h3>
        <Target className="h-5 w-5 text-teal-400" />
      </div>

      {step === 'success' ? (
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-zinc-100 mb-2">Allocation Updated!</p>
          <p className="text-sm text-zinc-400 mb-4">
            Base: {basePercent}% | Solana: {solanaPercent}%
          </p>
          <a
            href={`https://sepolia.basescan.org/tx/${setAllocationHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-400 hover:text-teal-300"
          >
            View transaction →
          </a>
          <button
            onClick={handleReset}
            className="btn-secondary w-full mt-4"
          >
            Done
          </button>
        </div>
      ) : step === 'error' ? (
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-zinc-100 mb-2">Transaction Failed</p>
          <p className="text-sm text-red-400 mb-4 break-words">
            {errorMessage?.slice(0, 100)}
          </p>
          <button
            onClick={handleReset}
            className="btn-secondary w-full"
          >
            Try Again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Current Allocation */}
          <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 text-sm">
            <span className="text-zinc-400">Current: </span>
            <span className="text-zinc-100 font-mono">
              Base {formatted.targetBasePercent}% / Solana {formatted.targetSolanaPercent}%
            </span>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>Base</span>
              <span>Solana</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={basePercent}
              onChange={(e) => setBasePercent(Number(e.target.value))}
              disabled={step !== 'input'}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-zinc-800
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-teal-400
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                disabled:opacity-50"
            />

            <div className="flex justify-between mt-4">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-zinc-400">Base</span>
                </div>
                <span className="text-2xl font-bold font-mono text-zinc-100">{basePercent}%</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-zinc-400">Solana</span>
                </div>
                <span className="text-2xl font-bold font-mono text-zinc-100">{solanaPercent}%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setBasePercent(50)}
              className="flex-1 text-xs py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              50/50
            </button>
            <button
              type="button"
              onClick={() => setBasePercent(70)}
              className="flex-1 text-xs py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              70/30
            </button>
            {riskData && (
              <button
                type="button"
                onClick={handleApplyRecommended}
                className="flex-1 text-xs py-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
              >
                Risk Engine ({riskData.recommendedBasePct}/{riskData.recommendedSolanaPct})
              </button>
            )}
          </div>

          {/* Submit Button */}
          {step === 'setting' && (isSetAllocationPending || isSetAllocationConfirming) ? (
            <div className="flex items-center justify-center gap-2 py-3 text-teal-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Setting allocation...</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={step !== 'input'}
              className="btn-primary w-full"
            >
              Set Allocation
            </button>
          )}
        </form>
      )}
    </div>
  );
}

