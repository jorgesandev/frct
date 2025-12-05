'use client';

// =============================================================================
// WithdrawForm Component
// =============================================================================
// Form for withdrawing USDC from the treasury vault (owner only)
// =============================================================================

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ArrowUp, Loader2, Check, AlertCircle, Lock } from 'lucide-react';

import { useVault } from '@/hooks/useVault';
import { TREASURY_VAULT_ABI } from '@/lib/contracts';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS as `0x${string}`;

type WithdrawStep = 'input' | 'withdrawing' | 'success' | 'error';

export function WithdrawForm() {
  const { address, isConnected } = useAccount();
  const { data: vault, formatted, refetch: refetchVault } = useVault();
  
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [step, setStep] = useState<WithdrawStep>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default recipient to connected wallet
  useEffect(() => {
    if (address && !recipient) {
      setRecipient(address);
    }
  }, [address, recipient]);

  // Parse amount to BigInt
  const parsedAmount = amount ? parseUnits(amount, 6) : BigInt(0);
  const maxWithdraw = vault.baseBalance;

  // Withdraw transaction
  const { 
    data: withdrawHash, 
    writeContract: writeWithdraw, 
    isPending: isWithdrawPending,
    error: withdrawError,
  } = useWriteContract();

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Handle withdrawal confirmation
  useEffect(() => {
    if (isWithdrawConfirmed && step === 'withdrawing') {
      setStep('success');
      refetchVault();
    }
  }, [isWithdrawConfirmed, step]);

  // Handle errors
  useEffect(() => {
    if (withdrawError) {
      setErrorMessage(withdrawError.message || 'Withdrawal failed');
      setStep('error');
    }
  }, [withdrawError]);

  const handleWithdraw = () => {
    if (!recipient) return;
    
    setStep('withdrawing');
    setErrorMessage(null);
    writeWithdraw({
      address: VAULT_ADDRESS,
      abi: TREASURY_VAULT_ABI,
      functionName: 'withdraw',
      args: [parsedAmount, recipient as `0x${string}`],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedAmount || parsedAmount > maxWithdraw || !recipient) return;
    handleWithdraw();
  };

  const handleReset = () => {
    setAmount('');
    setStep('input');
    setErrorMessage(null);
  };

  const handleMaxClick = () => {
    setAmount(formatUnits(maxWithdraw, 6));
  };

  if (!isConnected) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Withdraw USDC</h3>
        <div className="text-center py-8 text-zinc-500">
          Connect your wallet to withdraw
        </div>
      </div>
    );
  }

  if (!vault.isOwner) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Withdraw USDC</h3>
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <p className="text-zinc-400">
            Only the vault owner can withdraw funds.
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-2">
            Owner: {vault.owner?.slice(0, 10)}...{vault.owner?.slice(-8)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 border-yellow-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Withdraw USDC</h3>
        <span className="badge badge-neutral">Owner Only</span>
      </div>

      {step === 'success' ? (
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-zinc-100 mb-2">Withdrawal Successful!</p>
          <p className="text-sm text-zinc-400 mb-4">
            {amount} USDC has been withdrawn.
          </p>
          <a
            href={`https://sepolia.basescan.org/tx/${withdrawHash}`}
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
            New Withdrawal
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
          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={step !== 'input'}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 pr-24 text-lg font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-xs text-teal-400 hover:text-teal-300"
                >
                  MAX
                </button>
                <span className="text-zinc-400">USDC</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Available: ${formatted.baseBalanceFormatted} USDC
            </p>
          </div>

          {/* Recipient Input */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={step !== 'input'}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 disabled:opacity-50"
            />
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
              <ArrowUp className="h-5 w-5" />
            </div>
          </div>

          {/* Source */}
          <div className="mb-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <p className="text-sm text-zinc-400 mb-1">Source</p>
            <p className="font-mono text-sm text-zinc-100">FRCT Treasury Vault</p>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {VAULT_ADDRESS?.slice(0, 10)}...{VAULT_ADDRESS?.slice(-8)}
            </p>
          </div>

          {/* Status / Button */}
          {step === 'withdrawing' && (isWithdrawPending || isWithdrawConfirming) ? (
            <div className="flex items-center justify-center gap-2 py-3 text-yellow-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Withdrawing...</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!parsedAmount || parsedAmount > maxWithdraw || !recipient || step !== 'input'}
              className="w-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Withdraw
            </button>
          )}

          {parsedAmount > maxWithdraw && (
            <p className="text-sm text-red-400 mt-2 text-center">
              Amount exceeds vault balance
            </p>
          )}
        </form>
      )}
    </div>
  );
}

