// =============================================================================
// FRCT Contract Configuration
// =============================================================================
// ABI and addresses for TreasuryVaultBase contract
// =============================================================================

/**
 * Base Sepolia Chain ID
 */
export const BASE_SEPOLIA_CHAIN_ID = 84532;

/**
 * Base Mainnet Chain ID
 */
export const BASE_MAINNET_CHAIN_ID = 8453;

/**
 * USDC Token Addresses
 */
export const USDC_ADDRESSES = {
  [BASE_SEPOLIA_CHAIN_ID]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const,
  [BASE_MAINNET_CHAIN_ID]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
} as const;

/**
 * TreasuryVaultBase Contract Addresses
 * Updated after deployment
 */
export const TREASURY_VAULT_ADDRESSES = {
  [BASE_SEPOLIA_CHAIN_ID]: process.env.NEXT_PUBLIC_TREASURY_VAULT_BASE_ADDRESS as `0x${string}` | undefined,
  [BASE_MAINNET_CHAIN_ID]: undefined, // Not deployed to mainnet yet
} as const;

/**
 * Get the treasury vault address for a given chain
 */
export function getTreasuryVaultAddress(chainId: number): `0x${string}` | undefined {
  return TREASURY_VAULT_ADDRESSES[chainId as keyof typeof TREASURY_VAULT_ADDRESSES];
}

/**
 * Get the USDC address for a given chain
 */
export function getUsdcAddress(chainId: number): `0x${string}` | undefined {
  return USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES];
}

/**
 * TreasuryVaultBase ABI
 * Generated from contracts/out/TreasuryVaultBase.sol/TreasuryVaultBase.json
 */
export const TREASURY_VAULT_ABI = [
  {
    type: 'constructor',
    inputs: [{ name: '_usdc', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'MAX_BPS',
    inputs: [],
    outputs: [{ name: '', type: 'uint16', internalType: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getActualAllocation',
    inputs: [],
    outputs: [
      { name: 'actualBaseBps', type: 'uint16', internalType: 'uint16' },
      { name: 'actualSolanaBps', type: 'uint16', internalType: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBaseBalance',
    inputs: [],
    outputs: [{ name: 'balance', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCurrentAllocation',
    inputs: [],
    outputs: [
      { name: 'baseBps', type: 'uint16', internalType: 'uint16' },
      { name: 'solanaBps', type: 'uint16', internalType: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalValue',
    inputs: [],
    outputs: [{ name: 'totalValue', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'needsRebalance',
    inputs: [{ name: 'thresholdBps', type: 'uint16', internalType: 'uint16' }],
    outputs: [{ name: 'needsRebalance', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'planRebalance',
    inputs: [
      { name: 'newBaseBps', type: 'uint16', internalType: 'uint16' },
      { name: 'newSolBps', type: 'uint16', internalType: 'uint16' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setSimulatedSolanaBalance',
    inputs: [{ name: 'newBalance', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTargetAllocation',
    inputs: [
      { name: 'baseBps', type: 'uint16', internalType: 'uint16' },
      { name: 'solanaBps', type: 'uint16', internalType: 'uint16' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'simulatedSolanaBalance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'targetBaseBps',
    inputs: [],
    outputs: [{ name: '', type: 'uint16', internalType: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'targetSolanaBps',
    inputs: [],
    outputs: [{ name: '', type: 'uint16', internalType: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'usdc',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IERC20' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'to', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      { name: 'from', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      { name: 'previousOwner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'newOwner', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RebalancePlanned',
    inputs: [
      { name: 'newBaseBps', type: 'uint16', indexed: false, internalType: 'uint16' },
      { name: 'newSolanaBps', type: 'uint16', indexed: false, internalType: 'uint16' },
      { name: 'baseAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'solanaAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SimulatedSolanaBalanceUpdated',
    inputs: [
      { name: 'oldBalance', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'newBalance', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TargetAllocationSet',
    inputs: [
      { name: 'baseBps', type: 'uint16', indexed: false, internalType: 'uint16' },
      { name: 'solanaBps', type: 'uint16', indexed: false, internalType: 'uint16' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      { name: 'to', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'InsufficientBalance', inputs: [] },
  { type: 'error', name: 'InvalidAllocation', inputs: [] },
  { type: 'error', name: 'NotOwner', inputs: [] },
  { type: 'error', name: 'TransferFailed', inputs: [] },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
  { type: 'error', name: 'ZeroAmount', inputs: [] },
] as const;

/**
 * ERC20 ABI (minimal for USDC interactions)
 */
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;

