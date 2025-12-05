'use client';

// =============================================================================
// PayoutForm Component
// =============================================================================
// Form for creating Circle payouts from the treasury
// =============================================================================

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Send, 
  Loader2, 
  Check, 
  AlertCircle, 
  Lock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

import { useVault } from '@/hooks/useVault';
import { 
  PayoutResponse, 
  PayoutStatus, 
  SupportedChain,
  CHAIN_NAMES,
  PayoutApiResponse 
} from '@/types/circle';

type PayoutStep = 'input' | 'creating' | 'success' | 'error';

const CHAINS: { value: SupportedChain; label: string }[] = [
  { value: 'BASE', label: 'Base' },
  { value: 'SOL', label: 'Solana' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'MATIC', label: 'Polygon' },
];

export function PayoutForm() {
  const { isConnected } = useAccount();
  const { data: vault } = useVault();
  
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState<SupportedChain>('BASE');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<PayoutStep>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payout, setPayout] = useState<PayoutResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !address) return;

    setStep('creating');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/circle-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          address,
          chain,
          email: email || undefined,
        }),
      });

      const data: PayoutApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payout');
      }

      setPayout(data.payout || null);
      setStep('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  };

  const handleReset = () => {
    setAmount('');
    setAddress('');
    setEmail('');
    setStep('input');
    setErrorMessage(null);
    setPayout(null);
  };

  if (!isConnected) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Circle Payout</h3>
        <div className="text-center py-8 text-zinc-500">
          Connect your wallet to access payouts
        </div>
      </div>
    );
  }

  if (!vault.isOwner) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Circle Payout</h3>
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <p className="text-zinc-400">
            Only the vault owner can create payouts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Circle Payout</h3>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-purple-400">Sandbox</span>
        </div>
      </div>

      {step === 'success' && payout ? (
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-zinc-100 mb-2">Payout Created!</p>
          <div className="text-sm text-zinc-400 mb-4 space-y-1">
            <p>Amount: <span className="text-zinc-100">${payout.amount} {payout.currency}</span></p>
            <p>Status: <PayoutStatusBadge status={payout.status} /></p>
            <p className="font-mono text-xs break-all mt-2">
              To: {payout.destination}
            </p>
          </div>
          {payout.trackingRef && (
            <p className="text-xs text-zinc-500 mb-4">
              Tracking: {payout.trackingRef}
            </p>
          )}
          <button
            onClick={handleReset}
            className="btn-secondary w-full"
          >
            New Payout
          </button>
        </div>
      ) : step === 'error' ? (
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-zinc-100 mb-2">Payout Failed</p>
          <p className="text-sm text-red-400 mb-4 break-words">
            {errorMessage}
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
          {/* Chain Selection */}
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2">Destination Chain</label>
            <div className="grid grid-cols-2 gap-2">
              {CHAINS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setChain(c.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    chain === c.value
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={step !== 'input'}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-8 pr-4 py-3 text-lg font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Address Input */}
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2">
              {chain === 'SOL' ? 'Solana Address' : 'Wallet Address (0x...)'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={chain === 'SOL' ? 'Solana address...' : '0x...'}
              disabled={step !== 'input'}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>

          {/* Email (optional) */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              disabled={step !== 'input'}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          {step === 'creating' ? (
            <div className="flex items-center justify-center gap-2 py-3 text-purple-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating payout...</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!amount || !address || step !== 'input'}
              className="w-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold py-3 px-4 rounded-lg hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Create Payout
            </button>
          )}

          {/* Info */}
          <p className="text-xs text-zinc-500 mt-4 text-center">
            Payouts are processed via Circle Payments API (Sandbox)
          </p>
        </form>
      )}
    </div>
  );
}

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const statusConfig = {
    pending: { class: 'badge-neutral', label: 'Pending' },
    confirmed: { class: 'badge-neutral', label: 'Confirmed' },
    complete: { class: 'badge-aggressive', label: 'Complete' },
    failed: { class: 'badge-defensive', label: 'Failed' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`badge ${config.class}`}>
      {config.label}
    </span>
  );
}

/**
 * Payout History Component
 */
export function PayoutHistory() {
  const [payouts, setPayouts] = useState<PayoutResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/circle-payout');
      const data: PayoutApiResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch payouts');
      }

      setPayouts(data.payouts || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Payout History</h3>
        <div className="flex items-center justify-center py-8 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading payouts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Payout History</h3>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchPayouts} className="btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Payout History</h3>
        <button onClick={fetchPayouts} className="text-zinc-400 hover:text-zinc-100">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {payouts.length === 0 ? (
        <p className="text-center text-zinc-500 py-8">No payouts yet</p>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div key={payout.id} className="p-3 rounded-lg bg-zinc-800/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-100">
                  ${payout.amount} to {payout.chain}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  {payout.destination.slice(0, 10)}...{payout.destination.slice(-6)}
                </p>
              </div>
              <PayoutStatusBadge status={payout.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

