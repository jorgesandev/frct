// =============================================================================
// CCTP Types
// =============================================================================

export type BridgeDirection = 'base-to-solana' | 'solana-to-base';

export interface BridgeTransaction {
  id: string;
  direction: BridgeDirection;
  amount: string;
  sourceTxHash?: string;
  destinationTxHash?: string;
  messageHash?: string;
  nonce?: string;
  status: BridgeStatus;
  createdAt: string;
  completedAt?: string;
  sourceAddress: string;
  destinationAddress: string;
}

export type BridgeStatus = 
  | 'pending_deposit'      // User initiated, waiting for deposit tx
  | 'deposited'            // USDC burned on source chain
  | 'pending_attestation'  // Waiting for Circle attestation
  | 'attested'             // Attestation received
  | 'pending_mint'         // Waiting for mint on destination
  | 'completed'            // USDC minted on destination
  | 'failed';              // Transaction failed

export interface BridgeQuote {
  sourceChain: 'base' | 'solana';
  destinationChain: 'base' | 'solana';
  amount: string;
  estimatedTime: string; // e.g., "~15 minutes"
  fee: string; // CCTP is feeless for USDC
}

export interface AttestationResponse {
  status: 'pending' | 'complete';
  attestation?: string;
  message?: string;
}

// Events emitted by TokenMessenger
export interface DepositForBurnEvent {
  nonce: bigint;
  burnToken: `0x${string}`;
  amount: bigint;
  depositor: `0x${string}`;
  mintRecipient: `0x${string}`;
  destinationDomain: number;
  destinationTokenMessenger: `0x${string}`;
  destinationCaller: `0x${string}`;
}

// Events emitted by MessageTransmitter
export interface MessageSentEvent {
  message: `0x${string}`;
}

