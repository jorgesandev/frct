'use client';

// =============================================================================
// DepositForm Component
// =============================================================================
// Form for depositing USDC into the treasury vault
// =============================================================================

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ArrowDown, Loader2, Check, AlertCircle } from 'lucide-react';

import { useUserUsdc, useVault } from '@/hooks/useVault';
import { TREASURY_VAULT_ABI, ERC20_ABI, BASE_SEPOLIA_CHAIN_ID, USDC_ADDRESSES } from '@/lib/contracts';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS as `0x${string}`;
const USDC_ADDRESS = USDC_ADDRESSES[BASE_SEPOLIA_CHAIN_ID];

type DepositStep = 'input' | 'approving' | 'depositing' | 'success' | 'error';

export function DepositForm() {
  const { address, isConnected } = useAccount();
  const { balance, balanceFormatted, allowance, refetch: refetchBalance, refetchAllowance } = useUserUsdc();
  const { refetch: refetchVault } = useVault();
  
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<DepositStep>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse amount to BigInt
  const parsedAmount = amount ? parseUnits(amount, 6) : BigInt(0);
  const needsApproval = parsedAmount > allowance;

  // Approval transaction
  const { 
    data: approveHash, 
    writeContract: writeApprove, 
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Deposit transaction
  const { 
    data: depositHash, 
    writeContract: writeDeposit, 
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Handle approval confirmation
  useEffect(() => {
    if (isApproveConfirmed && step === 'approving') {
      refetchAllowance();
      // Auto-proceed to deposit
      handleDeposit();
    }
  }, [isApproveConfirmed, step]);

  // Handle deposit confirmation
  useEffect(() => {
    if (isDepositConfirmed && step === 'depositing') {
      setStep('success');
      refetchBalance();
      refetchVault();
    }
  }, [isDepositConfirmed, step]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      setErrorMessage(approveError.message || 'Approval failed');
      setStep('error');
    }
    if (depositError) {
      setErrorMessage(depositError.message || 'Deposit failed');
      setStep('error');
    }
  }, [approveError, depositError]);

  const handleApprove = () => {
    setStep('approving');
    setErrorMessage(null);
    writeApprove({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [VAULT_ADDRESS, parsedAmount],
      chainId: BASE_SEPOLIA_CHAIN_ID, // Force Base Sepolia
    });
  };

  const handleDeposit = () => {
    setStep('depositing');
    setErrorMessage(null);
    writeDeposit({
      address: VAULT_ADDRESS,
      abi: TREASURY_VAULT_ABI,
      functionName: 'deposit',
      args: [parsedAmount],
      chainId: BASE_SEPOLIA_CHAIN_ID, // Force Base Sepolia
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedAmount || parsedAmount > balance) return;

    if (needsApproval) {
      handleApprove();
    } else {
      handleDeposit();
    }
  };

  const handleReset = () => {
    setAmount('');
    setStep('input');
    setErrorMessage(null);
  };

  const handleMaxClick = () => {
    setAmount(formatUnits(balance, 6));
  };

  if (!isConnected) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Deposit USDC</h3>
        <div className="text-center py-8 text-zinc-500">
          Connect your wallet to deposit
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Deposit USDC</h3>

      {step === 'success' ? (
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-zinc-100 mb-2">Deposit Successful!</p>
          <p className="text-sm text-zinc-400 mb-4">
            {amount} USDC has been deposited to the treasury.
          </p>
          <a
            href={`https://sepolia.basescan.org/tx/${depositHash}`}
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
            New Deposit
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
              Balance: ${balanceFormatted} USDC
            </p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
              <ArrowDown className="h-5 w-5 text-zinc-400" />
            </div>
          </div>

          {/* Destination */}
          <div className="mb-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <p className="text-sm text-zinc-400 mb-1">Destination</p>
            <p className="font-mono text-sm text-zinc-100">FRCT Treasury Vault</p>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {VAULT_ADDRESS?.slice(0, 10)}...{VAULT_ADDRESS?.slice(-8)}
            </p>
          </div>

          {/* Status / Button */}
          {step === 'approving' && (isApprovePending || isApproveConfirming) ? (
            <div className="flex items-center justify-center gap-2 py-3 text-teal-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Approving USDC...</span>
            </div>
          ) : step === 'depositing' && (isDepositPending || isDepositConfirming) ? (
            <div className="flex items-center justify-center gap-2 py-3 text-teal-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Depositing...</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!parsedAmount || parsedAmount > balance || step !== 'input'}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {needsApproval ? 'Approve & Deposit' : 'Deposit'}
            </button>
          )}

          {parsedAmount > balance && (
            <p className="text-sm text-red-400 mt-2 text-center">
              Insufficient balance
            </p>
          )}
        </form>
      )}
    </div>
  );
}

