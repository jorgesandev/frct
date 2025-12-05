'use client';

// =============================================================================
// useSolanaVault Hook
// =============================================================================
// Fetches real Solana vault balance from devnet
// =============================================================================

import { useState, useEffect, useCallback } from 'react';

interface SolanaVaultData {
  balance: string;
  balanceRaw: string;
  decimals: number;
  vaultTokenAccount: string;
  isLoading: boolean;
  error: string | null;
}

export function useSolanaVault() {
  const [data, setData] = useState<SolanaVaultData>({
    balance: '0',
    balanceRaw: '0',
    decimals: 6,
    vaultTokenAccount: '',
    isLoading: true,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/solana-balance');
      const result = await response.json();
      
      setData({
        balance: result.balance || '0',
        balanceRaw: result.balanceRaw || '0',
        decimals: result.decimals || 6,
        vaultTokenAccount: result.vaultTokenAccount || '',
        isLoading: false,
        error: result.error || null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: String(error),
      }));
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    ...data,
    refetch: fetchBalance,
  };
}

