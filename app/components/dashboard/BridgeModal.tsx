// =============================================================================
// Bridge Modal Component
// =============================================================================
// Modal for bridging USDC between Base and Solana via CCTP
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCCTPBridge } from '@/hooks/useCCTPBridge';
import type { BridgeStatus } from '@/types/cctp';

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultBalance?: string;
  targetSolanaAllocation?: number;
}

const STATUS_MESSAGES: Record<BridgeStatus | 'idle', { text: string; icon: string }> = {
  idle: { text: 'Ready to bridge', icon: '🌉' },
  pending_deposit: { text: 'Waiting for approval...', icon: '⏳' },
  deposited: { text: 'USDC burned on Base', icon: '🔥' },
  pending_attestation: { text: 'Waiting for Circle attestation...', icon: '⏳' },
  attested: { text: 'Attestation received!', icon: '✅' },
  pending_mint: { text: 'Minting on Solana...', icon: '⏳' },
  completed: { text: 'Bridge complete!', icon: '🎉' },
  failed: { text: 'Bridge failed', icon: '❌' },
};

export function BridgeModal({ isOpen, onClose, vaultBalance = '0', targetSolanaAllocation = 50 }: BridgeModalProps) {
  const { address, isConnected } = useAccount();
  const {
    status,
    currentTx,
    error,
    isLoading,
    bridgeToSolana,
    checkAttestation,
    reset,
  } = useCCTPBridge();

  const [amount, setAmount] = useState('');
  const [solanaAddress, setSolanaAddress] = useState('');
  const [polling, setPolling] = useState(false);

  // Calculate suggested amount based on allocation
  const suggestedAmount = (parseFloat(vaultBalance) * (targetSolanaAllocation / 100)).toFixed(2);

  // Poll for attestation when in pending_attestation status
  useEffect(() => {
    if (status === 'pending_attestation' && currentTx?.messageHash && !polling) {
      setPolling(true);
      
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/cctp-attestation?messageHash=${currentTx.messageHash}`);
          const data = await response.json();
          
          if (data.status === 'complete') {
            clearInterval(pollInterval);
            setPolling(false);
            // Update status through hook
            checkAttestation(currentTx.messageHash!);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 10000); // Poll every 10 seconds

      return () => {
        clearInterval(pollInterval);
        setPolling(false);
      };
    }
  }, [status, currentTx?.messageHash, polling, checkAttestation]);

  const handleBridge = async () => {
    if (!amount || !solanaAddress) return;
    await bridgeToSolana(amount, solanaAddress);
  };

  const handleClose = () => {
    reset();
    setAmount('');
    setSolanaAddress('');
    onClose();
  };

  if (!isOpen) return null;

  const statusInfo = STATUS_MESSAGES[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Bridge USDC to Solana
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg ${
            status === 'failed' ? 'bg-red-500/10 border border-red-500/30' :
            status === 'completed' || status === 'attested' ? 'bg-green-500/10 border border-green-500/30' :
            'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{statusInfo.icon}</span>
              <div>
                <p className="font-medium text-[var(--foreground)]">{statusInfo.text}</p>
                {currentTx?.sourceTxHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${currentTx.sourceTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    View on Basescan
                  </a>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          {status === 'idle' && (
            <>
              {/* Chain Flow Diagram */}
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl">🔵</span>
                  </div>
                  <span className="text-sm text-[var(--muted)] mt-1">Base</span>
                </div>
                <div className="flex items-center">
                  <div className="w-16 h-0.5 bg-[var(--border)]" />
                  <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="w-16 h-0.5 bg-[var(--border)]" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl">🟣</span>
                  </div>
                  <span className="text-sm text-[var(--muted)] mt-1">Solana</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                  Amount (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    onClick={() => setAmount(suggestedAmount)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-[var(--primary)]/20 text-[var(--primary)] rounded hover:bg-[var(--primary)]/30 transition-colors"
                  >
                    Suggested: {suggestedAmount}
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Vault Balance: {vaultBalance} USDC
                </p>
              </div>

              {/* Solana Address Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                  Solana Destination Address
                </label>
                <input
                  type="text"
                  value={solanaAddress}
                  onChange={(e) => setSolanaAddress(e.target.value)}
                  placeholder="Enter Solana wallet address..."
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <p className="text-xs text-[var(--muted)] mt-1">
                  Tip: Use your Solana vault token account address
                </p>
              </div>

              {/* CCTP Info */}
              <div className="p-3 bg-[var(--background)] rounded-lg">
                <p className="text-xs text-[var(--muted)]">
                  <span className="font-medium text-[var(--foreground)]">Powered by Circle CCTP</span>
                  <br />
                  Native USDC burn-and-mint. No wrapped tokens. ~15 min transfer time.
                </p>
              </div>
            </>
          )}

          {/* Progress Steps */}
          {status !== 'idle' && status !== 'failed' && (
            <div className="space-y-3">
              <ProgressStep 
                step={1} 
                label="Burn USDC on Base" 
                complete={['deposited', 'pending_attestation', 'attested', 'pending_mint', 'completed'].includes(status)}
                active={status === 'pending_deposit'}
              />
              <ProgressStep 
                step={2} 
                label="Wait for Circle Attestation" 
                complete={['attested', 'pending_mint', 'completed'].includes(status)}
                active={status === 'pending_attestation'}
              />
              <ProgressStep 
                step={3} 
                label="Mint USDC on Solana" 
                complete={status === 'completed'}
                active={status === 'pending_mint' || status === 'attested'}
              />
            </div>
          )}

          {/* Attestation Info */}
          {status === 'pending_attestation' && (
            <div className="text-center text-sm text-[var(--muted)]">
              <p>This typically takes 10-15 minutes.</p>
              <p>You can close this modal - we&apos;ll track progress.</p>
            </div>
          )}

          {/* Attested - Manual Mint Step */}
          {status === 'attested' && currentTx?.messageHash && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-[var(--foreground)] mb-2">
                Attestation received! To complete the bridge:
              </p>
              <ol className="text-xs text-[var(--muted)] list-decimal list-inside space-y-1">
                <li>Connect your Solana wallet</li>
                <li>Call receiveMessage on Solana</li>
                <li>USDC will be minted to your destination</li>
              </ol>
              <p className="text-xs text-[var(--muted)] mt-2">
                Message Hash: <code className="text-[var(--primary)]">{currentTx.messageHash.slice(0, 20)}...</code>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-[var(--border)]">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
          >
            {status === 'idle' ? 'Cancel' : 'Close'}
          </button>
          
          {status === 'idle' && (
            <button
              onClick={handleBridge}
              disabled={!amount || !solanaAddress || !isConnected || isLoading}
              className="flex-1 px-4 py-3 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Bridge USDC'}
            </button>
          )}

          {status === 'failed' && (
            <button
              onClick={reset}
              className="flex-1 px-4 py-3 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Progress Step Component
function ProgressStep({ step, label, complete, active }: {
  step: number;
  label: string;
  complete: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${complete ? 'bg-green-500 text-white' : 
          active ? 'bg-[var(--primary)] text-black animate-pulse' : 
          'bg-[var(--border)] text-[var(--muted)]'}
      `}>
        {complete ? '✓' : step}
      </div>
      <span className={`text-sm ${
        complete ? 'text-green-400' : 
        active ? 'text-[var(--foreground)]' : 
        'text-[var(--muted)]'
      }`}>
        {label}
      </span>
      {active && (
        <div className="ml-auto">
          <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

