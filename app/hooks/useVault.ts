'use client';

// =============================================================================
// useVault Hook
// =============================================================================
// Custom hook for reading vault contract data
// =============================================================================

import { useReadContracts, useReadContract, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { 
  TREASURY_VAULT_ABI, 
  ERC20_ABI,
  BASE_SEPOLIA_CHAIN_ID,
  USDC_ADDRESSES,
} from '@/lib/contracts';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS as `0x${string}`;
const USDC_ADDRESS = USDC_ADDRESSES[BASE_SEPOLIA_CHAIN_ID];

export interface VaultData {
  baseBalance: bigint;
  solanaBalance: bigint;
  totalValue: bigint;
  targetBaseBps: number;
  targetSolanaBps: number;
  actualBaseBps: number;
  actualSolanaBps: number;
  owner: `0x${string}`;
  isOwner: boolean;
  needsRebalance: boolean;
}

export interface FormattedVaultData {
  baseBalanceFormatted: string;
  solanaBalanceFormatted: string;
  totalValueFormatted: string;
  targetBasePercent: number;
  targetSolanaPercent: number;
  actualBasePercent: number;
  actualSolanaPercent: number;
}

export function useVault() {
  const { address } = useAccount();

  const { data: vaultData, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'getBaseBalance',
      },
      {
        address: VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'getTotalValue',
      },
      {
        address: VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'getCurrentAllocation',
      },
      {
        address: VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'getActualAllocation',
      },
      {
        address: VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'owner',
      },
      {
        address: VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'simulatedSolanaBalance',
      },
      {
        address: VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'needsRebalance',
        args: [500], // 5% threshold
      },
    ],
  });

  const baseBalance = (vaultData?.[0]?.result as bigint) ?? BigInt(0);
  const totalValue = (vaultData?.[1]?.result as bigint) ?? BigInt(0);
  const targetAllocation = vaultData?.[2]?.result as [number, number] | undefined;
  const actualAllocation = vaultData?.[3]?.result as [number, number] | undefined;
  const owner = (vaultData?.[4]?.result as `0x${string}`) ?? '0x0';
  const solanaBalance = (vaultData?.[5]?.result as bigint) ?? BigInt(0);
  const needsRebalance = (vaultData?.[6]?.result as boolean) ?? false;

  const isOwner = address ? address.toLowerCase() === owner.toLowerCase() : false;

  const data: VaultData = {
    baseBalance,
    solanaBalance,
    totalValue,
    targetBaseBps: targetAllocation?.[0] ?? 0,
    targetSolanaBps: targetAllocation?.[1] ?? 0,
    actualBaseBps: actualAllocation?.[0] ?? 0,
    actualSolanaBps: actualAllocation?.[1] ?? 0,
    owner,
    isOwner,
    needsRebalance,
  };

  const formatted: FormattedVaultData = {
    baseBalanceFormatted: formatUsdc(baseBalance),
    solanaBalanceFormatted: formatUsdc(solanaBalance),
    totalValueFormatted: formatUsdc(totalValue),
    targetBasePercent: (targetAllocation?.[0] ?? 0) / 100,
    targetSolanaPercent: (targetAllocation?.[1] ?? 0) / 100,
    actualBasePercent: (actualAllocation?.[0] ?? 0) / 100,
    actualSolanaPercent: (actualAllocation?.[1] ?? 0) / 100,
  };

  return {
    data,
    formatted,
    isLoading,
    error,
    refetch,
    vaultAddress: VAULT_ADDRESS,
    usdcAddress: USDC_ADDRESS,
  };
}

export function useUserUsdc() {
  const { address } = useAccount();

  const { data: balance, isLoading, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, VAULT_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: (balance as bigint) ?? BigInt(0),
    balanceFormatted: formatUsdc((balance as bigint) ?? BigInt(0)),
    allowance: (allowance as bigint) ?? BigInt(0),
    isLoading,
    refetch,
    refetchAllowance,
  };
}

function formatUsdc(value: bigint): string {
  return parseFloat(formatUnits(value, 6)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

