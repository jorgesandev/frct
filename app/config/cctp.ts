// =============================================================================
// CCTP (Cross-Chain Transfer Protocol) Configuration
// =============================================================================
// Official Circle CCTP contract addresses and domain IDs
// Docs: https://developers.circle.com/stablecoins/reference/cctp-evm-contracts
// =============================================================================

export const CCTP_DOMAIN_IDS = {
  ethereum: 0,
  avalanche: 1,
  optimism: 2,
  arbitrum: 3,
  noble: 4,
  solana: 5,
  base: 6,
  polygon: 7,
} as const;

export type CCTPDomain = keyof typeof CCTP_DOMAIN_IDS;

// Base Sepolia Testnet CCTP Contracts
export const CCTP_BASE_SEPOLIA = {
  tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as `0x${string}`,
  messageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD' as `0x${string}`,
  tokenMinter: '0xE997d7d2F6E065a9A93Fa2175E878Fb9081F1f0A' as `0x${string}`,
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  domainId: CCTP_DOMAIN_IDS.base,
} as const;

// Solana Devnet CCTP (for reference)
export const CCTP_SOLANA_DEVNET = {
  tokenMessenger: 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
  messageTransmitter: 'CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd',
  usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  domainId: CCTP_DOMAIN_IDS.solana,
} as const;

// TokenMessenger ABI (only the functions we need)
export const TOKEN_MESSENGER_ABI = [
  {
    name: 'depositForBurn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }],
  },
  {
    name: 'depositForBurnWithCaller',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
      { name: 'destinationCaller', type: 'bytes32' },
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }],
  },
] as const;

// MessageTransmitter ABI (for receiving messages)
export const MESSAGE_TRANSMITTER_ABI = [
  {
    name: 'receiveMessage',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'message', type: 'bytes' },
      { name: 'attestation', type: 'bytes' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    name: 'usedNonces',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'nonce', type: 'bytes32' }],
    outputs: [{ name: 'used', type: 'uint256' }],
  },
] as const;

// Helper to convert EVM address to bytes32 (for Solana destination)
export function addressToBytes32(address: string): `0x${string}` {
  // For EVM addresses, left-pad to 32 bytes
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  return `0x${'0'.repeat(24)}${cleanAddress}` as `0x${string}`;
}

// Helper to convert Solana pubkey to bytes32
export function solanaAddressToBytes32(pubkey: string): `0x${string}` {
  // Solana addresses are base58 encoded, need to decode and convert to hex
  // For simplicity in testnets, we'll use a placeholder approach
  // In production, use @solana/web3.js to decode the pubkey
  const placeholder = '0x' + Buffer.from(pubkey.slice(0, 32).padEnd(32, '0')).toString('hex');
  return placeholder as `0x${string}`;
}

// Circle Attestation API endpoints
export const CCTP_ATTESTATION_API = {
  testnet: 'https://iris-api-sandbox.circle.com/attestations',
  mainnet: 'https://iris-api.circle.com/attestations',
} as const;

// Get attestation status for a message
export async function getAttestation(messageHash: string, isMainnet = false): Promise<{
  status: 'pending' | 'complete';
  attestation?: string;
}> {
  const baseUrl = isMainnet ? CCTP_ATTESTATION_API.mainnet : CCTP_ATTESTATION_API.testnet;
  
  try {
    const response = await fetch(`${baseUrl}/${messageHash}`);
    const data = await response.json();
    
    if (data.status === 'complete' && data.attestation) {
      return { status: 'complete', attestation: data.attestation };
    }
    
    return { status: 'pending' };
  } catch (error) {
    console.error('Failed to get attestation:', error);
    return { status: 'pending' };
  }
}

